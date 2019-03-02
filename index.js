"use strict";

const Ajv = require("ajv");
const merge = require("deepmerge");

const flatstr = require("flatstr");

// This Ajv instance is used to validate that the passed schema
// is valid json schema. We reuse the instance to avoid having to
// pay the ajv creation cost more than once.
const ajv = new Ajv({
	// Ignore any unknown formats as they aren't used.
	unknownFormats: "ignore",

	// Ignoring unknown formats emits warnings, but we don't need to hear about
	// them.
	logger: {
	log: console.log,
	warn: function() {},
	error: console.error
	}
});

let uglify = null;
let isLong;
try {
	isLong = require("long").isLong;
} catch (e) {
	isLong = null;
}

const addComma = `
	if (addComma) {
		json += ','
	}
	addComma = true
`;

function build(schema, options) {
	options = options || {};
	//isValidSchema(schema, options.schema)
	/* eslint no-new-func: "off" */
	let code = `
	'use strict'
	`;

	code += `
	${$asString.toString()}
	${$asStringSmall.toString()}
	${$asNumber.toString()}
	${$asNull.toString()}
	${$asBoolean.toString()}
	
	${$asHardInt.toString()}
	${$asHardFloat.toString()}
	${$asHardDate.toString()}
	${$asHardString.toString()}
	${$asHardJSONEncoded.toString()}
	`;

	// only handle longs if the module is used
	if (isLong) {
	code += `
		const isLong = ${isLong.toString()}
		${$asInteger.toString()}
	`;
	} else {
	code += `
		const $asInteger = $asNumber
	`;
	}

	if (schema.type === undefined) {
	schema.type = inferTypeByKeyword(schema);
	}

	

	let main;

	switch (schema.type) {
	case "object":
		main = "$main";
		code = buildObject(schema, code, main, options.schema, schema);
		break;
	case "string":
		main = $asString.name;
		break;
	case "integer":
		main = $asInteger.name;
		break;
	case "number":
		main = $asNumber.name;
		break;
	case "boolean":
		main = $asBoolean.name;
		break;
	case "null":
		main = $asNull.name;
		break;
	case "array":
		main = "$main";
		code = buildArray(schema, code, main, options.schema, schema);
		break;

	case "hardInt":
		main = $asHardInt.name;
		break;

	case "hardFloat":
		main = $asHardFloat.name;
		break;
	case "hardDate":
		main = $asHardDate.name;
		break;
	case "hardString":
		main = $asHardString.name;
		break;

	case "hardJSONEncoded":
		main = $asHardJSONEncoded.name;
		break;
	default:
		throw new Error(`${schema.type} unsupported`);
	}

	code += `
	;
	return flatstr(${main});
	`;


	console.log( "Final Code:", code );

	if (options.uglify) {
		code = uglifyCode(code);
	}

	let dependencies = [];
	let dependenciesName = [];

	if (hasAnyOf(schema) || hasIf(schema)) {
		dependencies.push(new Ajv());
		dependenciesName.push("ajv");
	}

	dependencies.push(flatstr);
	dependenciesName.push("flatstr");

	dependenciesName.push(code);
	return Function.apply(null, dependenciesName).apply(null, dependencies);
}

const objectKeywords = [
	"maxProperties",
	"minProperties",
	"required",
	"properties",
	"patternProperties",
	"additionalProperties",
	"dependencies"
];

const arrayKeywords = [
	"items",
	"additionalItems",
	"maxItems",
	"minItems",
	"uniqueItems",
	"contains"
];

const stringKeywords = ["maxLength", "minLength", "pattern"];

const numberKeywords = [
	"multipleOf",
	"maximum",
	"exclusiveMaximum",
	"minimum",
	"exclusiveMinimum"
];

/**
 * Infer type based on keyword in order to generate optimized code
 * https://json-schema.org/latest/json-schema-validation.html#rfc.section.6
 */
function inferTypeByKeyword(schema) {
	for (const keyword of objectKeywords) {
	if (keyword in schema) return "object";
	}
	for (const keyword of arrayKeywords) {
	if (keyword in schema) return "array";
	}
	for (const keyword of stringKeywords) {
	if (keyword in schema) return "string";
	}
	for (const keyword of numberKeywords) {
	if (keyword in schema) return "number";
	}
	return schema.type;
}

function hasAnyOf(schema) {
	if ("anyOf" in schema) {
		return true;
	}

	let objectKeys = Object.keys(schema);
	for (let i = 0; i < objectKeys.length; i++) {
		let value = schema[objectKeys[i]];
		if (typeof value === "object") {
			if (hasAnyOf(value)) {
			return true;
			}
		}
	}

	return false;
}

function hasIf(schema) {
	const str = JSON.stringify(schema);
	return /"if":{/.test(str) && /"then":{/.test(str);
}

function $asNull() {
	return "null";
}

const $asInteger = (function() {
	if (isLong) {
		return function $asInteger(i) {
			if (isLong(i)) {
				return i.toString();
			}
			return $asNumber(i);
		};
	} else {
		return function $asInteger(i) {
			return $asNumber(i);
		};
	}
})();

function $asNumber(i) {
	let num = Number(i);
	if (isNaN(num)) {
		return "null";
	} else {
		return "" + num;
	}
}

function $asHardInt(i) {
	return parseInt(i, 10);
}

function $asHardFloat(f) {
	return parseFloat(f);
}

function $asHardDate(d) {
	return `"${d.toISOString()}"`;
}

function $asHardJSONEncoded(str) {
	return str;
}

function $asHardString(str) {
	return `"${str}"`;
}

function $asBoolean(bool) {
	return (bool && "true") || "false"; // eslint-disable-line
}

function $asString(str) {
	if (typeof str !== "string") {
	if (str === null || str === undefined) {
		return '""';
	} else if (str instanceof Date) {
		return `"${str.toISOString()}"`;
	} else if (str instanceof RegExp) {
		str = str.source;
	} else {
		str = str.toString();
	}
	}

	let l = str.length;
	if (!l) {
		return '""';
	}
	if (l < 42) {
		return $asStringSmall(str, l);
	}
	return JSON.stringify(str);
}

// magically escape strings for json
// relying on their charCodeAt
// everything below 32 needs JSON.stringify()
// 34 and 92 happens all the time, so we
// have a fast case for them
function $asStringSmall(str, l) {
	let result = "";
	let point = 255;
	let last = 0;
	for (let i = 0; i < l && point >= 32; i++) {
		point = str.charCodeAt(i);
		if (point === 34 || point === 92) {
			result += `${str.slice(last, i)}\\`;
			last = i;
		}
	}

	if (last === 0) {
		result = str;
	} else {
		result += str.slice(last);
	}
	return point < 32 ? JSON.stringify(str) : `"${result}"`;
}

function addPatternProperties(schema, externalSchema, fullSchema) {
	let pp = schema.patternProperties;
	let code = `
		const properties = ${JSON.stringify(schema.properties)} || {},
			keys = Object.keys(obj);
		let i=0, e=keys.length;
		for (; i < e; i++) {
			if (properties[keys[i]]) continue;
	`;
	Object.keys(pp).forEach((regex, index) => {
	if (pp[regex]["$ref"]) {
		pp[regex] = refFinder(
			pp[regex]["$ref"],
			fullSchema,
			externalSchema,
			fullSchema
		);
	}
	let type = pp[regex].type;
	code += `
		if (/${regex}/.test(keys[i])) {
	`;
	if (type === "object") {
		code += buildObject(
		pp[regex],
		"",
		"buildObjectPP" + index,
		externalSchema,
		fullSchema
		);
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + buildObjectPP${index}(obj[keys[i]]);
		`;
	} else if (type === "array") {
		code += buildArray(
		pp[regex],
		"",
		"buildArrayPP" + index,
		externalSchema,
		fullSchema
		);
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + buildArrayPP${index}(obj[keys[i]]);
		`;
	} else if (type === "null") {
		code += `
			${addComma}
			json += $asHardString(keys[i]) +':null';
		`;
	} else if (type === "string") {
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + $asString(obj[keys[i]]);
		`;
	} else if (type === "integer") {
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + $asInteger(obj[keys[i]]);
		`;
	} else if (type === "number") {
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + $asNumber(obj[keys[i]]);
		`;
	} else if (type === "boolean") {
		code += `
			${addComma}
			json += $asHardString(keys[i]) + ':' + $asBoolean(obj[keys[i]]);
		`;
	} else {
		code += `
		throw new Error('Cannot coerce ' + obj[keys[i]] + ' to ${type}');
		`;
	}

	code += `
			continue;
		}
	`;
	});
	if (schema.additionalProperties) {
	code += additionalProperty(schema, externalSchema, fullSchema);
	}

	code += `
		}
	`;
	return code;
}

function additionalProperty(schema, externalSchema, fullSchema) {
	let ap = schema.additionalProperties;
	let code = "";
	if (ap === true) {
	return `
		const v = obj[keys[i]];
		if (v !== undefined) {
			${addComma}
			json += $asHardString(keys[i]) + ':' + JSON.stringify(v);
		}
	`;
	}
	if (ap["$ref"]) {
	ap = refFinder(ap["$ref"], fullSchema, externalSchema);
	}

	let type = ap.type;
	if (type === "object") {
	code += buildObject(ap, "", "buildObjectAP", externalSchema);
	code += `
		${addComma}
		json += $asHardString(keys[i]) + ':' + buildObjectAP(obj[keys[i]]);
	`;
	} else if (type === "array") {
	code += buildArray(ap, "", "buildArrayAP", externalSchema, fullSchema);
	code += `
		${addComma}
		json += $asHardString(keys[i]) + ':' + buildArrayAP(obj[keys[i]]);
	`;
	} else if (type === "null") {
	code += `
		${addComma}
		json += $asHardString(keys[i]) +':null';
	`;
	} else if (type === "string") {
	code += `
		${addComma}
		json += $asHardString(keys[i]) + ':' + $asString(obj[keys[i]]);
	`;
	} else if (type === "integer") {
	code += `
		const v = obj[keys[i]],
			t = Number(v);
	`;
		if (isLong) {
			code += `
				if (isLong(v) || !isNaN(t)) {
				${addComma}
				json += $asHardString(keys[i]) + ':' + $asInteger(v);
				}
			`;
		} else {
			code += `
				if (!isNaN(t)) {
				${addComma}
				json += $asHardString(keys[i]) + ':' + t;
				}
			`;
		}
	} else if (type === "number") {
	code += `
		const t = Number(obj[keys[i]]);
		if (!isNaN(t)) {
			${addComma}
			json += $asHardString(keys[i]) + ':' + t;
		}
	`;
	} else if (type === "boolean") {
	code += `
		${addComma}
		json += $asHardString(keys[i]) + ':' + $asBoolean(obj[keys[i]]);
	`;
	} else {
	code += `
		throw new Error('Cannot coerce ' + obj[keys[i]] + ' to ${type}');
	`;
	}
	return code;
}

function addAdditionalProperties(schema, externalSchema, fullSchema) {
	return `
		const properties = ${JSON.stringify(schema.properties)} || {},
			keys = Object.keys(obj);
		let i=0, e=keys.length;
		for (; i < e; i++) {
			if (properties[keys[i]]) continue;
			${additionalProperty(schema, externalSchema, fullSchema)}
		}
	`;
}

function idFinder(schema, searchedId) {
	let objSchema;
	const explore = (schema, searchedId) => {
		Object.keys(schema || {}).forEach((key, i, a) => {
			if (key === "$id" && schema[key] === searchedId) {
				objSchema = schema;
			} else if (objSchema === undefined && typeof schema[key] === "object") {
				explore(schema[key], searchedId);
			}
		});
	};
	explore(schema, searchedId);
	return objSchema;
}

function refFinder(ref, schema, externalSchema) {
	// Split file from walk
	ref = ref.split("#");

	// If external file
	if (ref[0]) {
	schema = externalSchema[ref[0]];
	}

	let code = "return schema";
	// If it has a path
	if (ref[1]) {
	// ref[1] could contain a JSON pointer - ex: /definitions/num
	// or plan name fragment id without suffix # - ex: customId
	let walk = ref[1].split("/");
	if (walk.length === 1) {
		return idFinder(schema, `#${ref[1]}`);
	} else {
		for (let i = 1; i < walk.length; i++) {
		code += `['${walk[i]}']`;
		}
	}
	}
	return new Function("schema", code)(schema);
}

function buildCode(schema, code, laterCode, name, externalSchema, fullSchema) {
	Object.keys(schema.properties || {}).forEach((key, i, a) => {
	if (schema.properties[key]["$ref"]) {
		schema.properties[key] = refFinder(
			schema.properties[key]["$ref"],
			fullSchema,
			externalSchema
		);
	}

	// Using obj['key'] !== undefined instead of obj.hasOwnProperty(prop) for perf reasons,
	// see https://github.com/mcollina/fast-json-stringify/pull/3 for discussion.

	let type = schema.properties[key].type;
	if (type === "number") {
		code += `
			let t = Number(obj['${key}']);
			if (!isNaN(t)) {
			${addComma}
			json += '${$asString(key)}:' + t;
		`;
	} else if (type === "integer") {
		code += `
			let rendered = false;
		`;
		if (isLong) {
		code += `
			const v = obj['${key}']
			if (isLong(v)) {
				${addComma}
				json += '${$asString(key)}:' + v.toString();
				rendered = true;
			} else {
				let t = Number(v);
				if (!isNaN(t)) {
					${addComma}
					json += '${$asString(key)}:' + t;
					rendered = true;
				}
			}
		`;
		} else {
		code += `
			let t = Number(obj['${key}'])
			if (!isNaN(t)) {
				${addComma}
				json += '${$asString(key)}:' + t
				rendered = true
			}
		`;
		}
		code += `
			if (rendered) {
		`;
	} else {
		code += `
		if (obj['${key}'] !== undefined) {
			${addComma}
			json += '${$asString(key)}:'
		`;

		let result = nested(
			laterCode,
			name,
			key,
			schema.properties[key],
			externalSchema,
			fullSchema,
			type
		);
		code += result.code;
		laterCode = result.laterCode;
	}

	let defaultValue = schema.properties[key].default;
	if (defaultValue !== undefined) {
		code += `
		} else {
			${addComma}
			json += '${$asString(key)}:${JSON.stringify(defaultValue).replace(/'/g, "'")}';
		`;
	} else if (schema.required && schema.required.indexOf(key) !== -1) {
		code += `
		} else {
			throw new Error('${key} is required!');
		`;
	}

	code += `
		}
	`;
	});

	return { code: code, laterCode: laterCode };
}

function buildCodeWithAllOfs(
	schema,
	code,
	laterCode,
	name,
	externalSchema,
	fullSchema
) {
	if (schema.allOf) {
	schema.allOf.forEach(ss => {
		let builtCode = buildCodeWithAllOfs(
			ss,
			code,
			laterCode,
			name,
			externalSchema,
			fullSchema
		);

		code = builtCode.code;
		laterCode = builtCode.laterCode;
	});
	} else {
	let builtCode = buildCode(
		schema,
		code,
		laterCode,
		name,
		externalSchema,
		fullSchema
	);

	code = builtCode.code;
	laterCode = builtCode.laterCode;
	}

	return { code: code, laterCode: laterCode };
}

function buildInnerObject(schema, name, externalSchema, fullSchema) {
	let laterCode = "";
	let code = "";
	if (schema.patternProperties) {
	code += addPatternProperties(schema, externalSchema, fullSchema);
	} else if (schema.additionalProperties && !schema.patternProperties) {
	code += addAdditionalProperties(schema, externalSchema, fullSchema);
	}

	return buildCodeWithAllOfs(
		schema,
		code,
		laterCode,
		name,
		externalSchema,
		fullSchema
	);
}

function addIfThenElse(schema, name, externalSchema, fullSchema) {
	let code = "";
	let r;
	let laterCode = "";
	let innerR;

	const copy = merge({}, schema);
	const i = copy.if;
	const then = copy.then;
	const e = copy.else;
	delete copy.if;
	delete copy.then;
	delete copy.else;
	let merged = merge(copy, then);

	code += `
	valid = ajv.validate(${require("util").inspect(i, { depth: null })}, obj)
	if (valid) {
	`;
	if (merged.if && merged.then) {
	innerR = addIfThenElse(merged, name + "Then", externalSchema, fullSchema);
	code += innerR.code;
	laterCode = innerR.laterCode;
	}

	r = buildInnerObject(merged, name + "Then", externalSchema, fullSchema);
	code += r.code;
	laterCode += r.laterCode;

	code += `
	}
	`;
	if (e) {
	merged = merge(copy, e);

	code += `
		else {
	`;

	if (merged.if && merged.then) {
		innerR = addIfThenElse(merged, name + "Else", externalSchema, fullSchema);
		code += innerR.code;
		laterCode += innerR.laterCode;
	}

	r = buildInnerObject(merged, name + "Else", externalSchema, fullSchema);
	code += r.code;
	laterCode += r.laterCode;

	code += `
		}
	`;
	}
	return { code: code, laterCode: laterCode };
}

function toJSON(variableName) {
	return `typeof ${variableName}.toJSON === 'function'
	? ${variableName}.toJSON()
	: ${variableName}
	`;
}

function buildObject(schema, code, name, externalSchema, fullSchema) {
	code += `
	function ${name} (input) {
	`;
	if (schema.nullable) {
	code += `
		if(input === null) {
			return '${$asNull()}';
		}
	`;
	}
	code += `
		let obj = ${toJSON("input")}
		let json = '{';
		let addComma = false;
	`;

	let laterCode = "";
	let r;
	if (schema.if && schema.then) {
		code += `
			let valid;
		`;
		r = addIfThenElse(schema, name, externalSchema, fullSchema);
	} else {
		r = buildInnerObject(schema, name, externalSchema, fullSchema);
	}

	code += r.code;
	laterCode = r.laterCode;

	// Removes the comma if is the last element of the string (in case there are not properties)
	code += `
			return json + '}';
	}
	`;

	code += laterCode;
	return code;
}

function buildArray(schema, code, name, externalSchema, fullSchema) {
	code += `
	function ${name} (obj) {
		let json = '[';
	`;

	let laterCode = "";

	if (schema.items["$ref"]) {
		schema.items = refFinder(schema.items["$ref"], fullSchema, externalSchema);
	}

	let result = { code: "", laterCode: "" };
	if (Array.isArray(schema.items)) {
		result = schema.items.reduce((res, item, i) => {
			let accessor = "[i]";
			const tmpRes = nested(
				laterCode,
				name,
				accessor,
				item,
				externalSchema,
				fullSchema,
				i
			);
			let condition = `i === ${i} && ${buildArrayTypeCondition(
				item.type,
				accessor
			)}`;
			return {
				code: `${res.code}
				${i > 0 ? "else" : ""} if (${condition}) {
					${tmpRes.code}
				}`,
				laterCode: `${res.laterCode}
				${tmpRes.laterCode}`
			};
		}, result);

		result.code += `
		else {
			throw new Error(\`Item at $\{i} does not match schema definition. For $\{JSON.stringify(obj)}. Was $\{obj[i]} -> $\{typeof obj[i] } \`)
		}
		`;
	} else {
		result = nested(
			laterCode,
			name,
			"[i]",
			schema.items,
			externalSchema,
			fullSchema
		);
	}

	code += `
	const len = obj.length,
		w = len - 1;
	let i = 0;
	if (len>0){
		${result.code}
	}
	for (i = 1; i < len; i++) {
		json += ','
		${result.code}
	}
	`;

	laterCode = result.laterCode;

	code += `
		return json + ']';
	}
	`;

	code += laterCode;

	return code;
}

function buildArrayTypeCondition(type, accessor) {
	let condition;
	switch (type) {
	case "null":
		condition = `obj${accessor} === null`;
		break;
	case "string":
	case "hardString":
		condition = `typeof obj${accessor} === 'string'`;
		break;
	case "integer":
	case "hardInt":
		condition = `Number.isInteger(obj${accessor})`;
		break;
	case "number":
		condition = `Number.isFinite(obj${accessor})`;
		break;
	case "boolean":
		condition = `typeof obj${accessor} === 'boolean'`;
		break;
	case "array":
		condition = `Array.isArray(obj${accessor})`;
		break;
	case "hardDate":
		condition = `obj${accessor} && typeof obj${accessor} === 'object' && obj${accessor} instanceof Date`;
		break;
	case "object":
		condition = `obj${accessor} && typeof obj${accessor} === 'object' && obj${accessor}.constructor === Object`;
		break;

	case "hardFloat":
		condition = `typeof obj${accessor} === 'number' && Number(obj${accessor}) === obj${accessor} && obj${accessor} % 1 !== 0;`;
		break;

	default:
		if (Array.isArray(type)) {
			let conditions = type.map(subType => {
				return buildArrayTypeCondition(subType, accessor);
			});
			condition = `(${conditions.join(" || ")})`;
		} else {
			throw new Error(`${type} unsupported`);
		}
	}
	return condition;
}

function nested(
	laterCode,
	name,
	key,
	schema,
	externalSchema,
	fullSchema,
	subKey
) {
	let code = "";
	let funcName;

	if (schema.type === undefined) {
		let inferedType = inferTypeByKeyword(schema);
		if (inferedType) {
			schema.type = inferedType;
		}
	}

	let type = schema.type;

	let accessor = key[0]==='[' ? key : `['${key}']`;
	switch (type) {
	case "null":
		code += `
		json += $asNull();
		`;
		break;
	case "string":
		code += `
		json += $asString(obj${accessor});
		`;
		break;
	case "integer":
		code += `
		json += $asInteger(obj${accessor});
		`;
		break;
	case "number":
		code += `
		json += $asNumber(obj${accessor});
		`;
		break;
	case "boolean":
		code += `
		json += $asBoolean(obj${accessor});
		`;
		break;

	case "hardInt":
		code += `
			json += $asHardInt(obj${accessor});
		`;
		break;
	case "hardFloat":
		code += `
			json += $asHardFloat(obj${accessor});
		`;
		break;
	case "hardDate":
		code += `
			json += $asHardDate(obj${accessor});
		`;
		break;
	case "hardString":
		code += `
			json += $asHardString(obj${accessor});
		`;
		break;
	case "hardJSONEncoded":
		code += `
			json += $asHardJSONEncoded(obj${accessor});
		`;
		break;


	case "object":
		funcName = (name + '$obj' + key + subKey).replace(/[-.\[\] ]/g, ""); // eslint-disable-line
		laterCode = buildObject(
			schema,
			laterCode,
			funcName,
			externalSchema,
			fullSchema
		);
		code += `
		json += ${funcName}(obj${accessor});
		`;
		break;
	case "array":
		funcName = (name + '$arr' + key + subKey).replace(/[-.\[\] ]/g, ""); // eslint-disable-line
		laterCode = buildArray(
			schema,
			laterCode,
			funcName,
			externalSchema,
			fullSchema
		);
		code += `
		json += ${funcName}(obj${accessor})
		`;
		break;
	case undefined:
		if ("anyOf" in schema) {
		schema.anyOf.forEach((s, index) => {
			let nestedResult = nested(
				laterCode,
				name,
				key,
				s,
				externalSchema,
				fullSchema,
				subKey
			);
			code += `
			${index === 0 ? "if" : "else if"}(ajv.validate(${require("util").inspect(s, {
			depth: null
			})}, obj${accessor}))
				${nestedResult.code}
			`;
			laterCode = nestedResult.laterCode;
		});
		code += `
			else json+= null
		`;
		} else if (isEmpty(schema)) {
		code += `
			json += JSON.stringify(obj${accessor})
		`;
		} else {
		throw new Error(`${schema.type} unsupported`);
		}
		break;
	default:
		if (Array.isArray(type)) {
		const nullIndex = type.indexOf("null");
		const sortedTypes =
			nullIndex !== -1
			? [type[nullIndex]]
				.concat(type.slice(0, nullIndex))
				.concat(type.slice(nullIndex + 1))
			: type;
		sortedTypes.forEach((type, index) => {
			let tempSchema = Object.assign({}, schema, { type });
			let nestedResult = nested(
				laterCode,
				name,
				key,
				tempSchema,
				externalSchema,
				fullSchema,
				subKey
			);
			if (type === "string") {
			code += `
				${
			index === 0 ? "if" : "else if"
		}(typeof obj${accessor} === "${type}" || obj${accessor} instanceof Date || obj${accessor} instanceof RegExp)
				${nestedResult.code}
			`;
			} else if (type === "null") {
			code += `
				${index === 0 ? "if" : "else if"}(obj${accessor} == null)
				${nestedResult.code}
			`;
			} else if (type === "array") {
			code += `
				${index === 0 ? "if" : "else if"}(Array.isArray(obj${accessor}))
				${nestedResult.code}
			`;
			} else if (type === "integer") {
			code += `
				${index === 0 ? "if" : "else if"}(Number.isInteger(obj${accessor}))
				${nestedResult.code}
			`;
			} else {
			code += `
				${index === 0 ? "if" : "else if"}(typeof obj${accessor} === "${type}")
				${nestedResult.code}
			`;
			}
			laterCode = nestedResult.laterCode;
		});
		code += `
			else json+= null;
		`;
		} else {
		throw new Error(`${type} unsupported`);
		}
	}

	return {
		code,
		laterCode
	};
}

function uglifyCode(code) {
	if (!uglify) {
		loadUglify();
	}

	let uglified = uglify.minify(code, {
		parse: {
			bare_returns: true
		},
		compress:{
			hoist_funs: true,
			toplevel: true
		}
	});

	if (uglified.error) {
		throw uglified.error;
	}

	return uglified.code;
}

function loadUglify() {
	try {
		uglify = require("uglify-es");
		let uglifyVersion = require("uglify-es/package.json").version;

		if (uglifyVersion[0] !== "3") {
			throw new Error("Only version 3 of uglify-es is supported");
		}
	} catch (e) {
		uglify = null;
		if (e.code === "MODULE_NOT_FOUND") {
			throw new Error(
			"In order to use uglify, you have to manually install `uglify-es`"
			);
		}

		throw e;
	}
}

function isValidSchema(schema, externalSchema) {
	if (externalSchema) {
		Object.keys(externalSchema).forEach(key => {
			try {
			ajv.addSchema(externalSchema[key], key);
			} catch (err) {
			err.message = '"' + key + '" ' + err.message;
			throw err;
			}
		});
	}
	ajv.compile(schema);
	ajv.removeSchema();
}

function isEmpty(schema) {
	for (let key in schema) {
		if (schema.hasOwnProperty(key)) return false;
	}
	return true;
}

module.exports = build;
