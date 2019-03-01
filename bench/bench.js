'use strict'

const HW = require('../');
const jsonFastify = require("fast-json-stringify")

const benchmark = require('benchmark')

const schema = {
	'title': 'Example Schema',
	'type': 'object',
	'properties': {
		'firstName': {
			'type': 'string'
		},
		'lastName': {
			'type': 'string'
		},
		'age': {
			'description': 'Age in years',
			'type': 'integer'
		}
	}
}



const arraySchema = {
	title: 'array schema',
	type: 'array',
	items: schema
}


const obj = {
	firstName: 'Matteo',
	lastName: 'Collina',
	age: 32
}


const objBig = {
	firstName: 'MatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteo',
	lastName: 'CollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollina',
	age: 32
}



const multiArray = []
const multiArrayBig = []


//Prepare DataSets..
var str = ''

for (var i = 0; i < 10000; i++) {
	str += i
	if (i % 100 === 0) {
		str += '"'
	}
}


for (i = 0; i < 1000; i++) {
	multiArray.push(obj)
	multiArrayBig.push(objBig)
}



// prepare schemas
const HWSchema = {
	stringify:  HW(schema),
	stringifyUgly:  HW(schema, { uglify: true }),
	
	stringifyArray:  HW(arraySchema),
	stringifyArrayUgly:  HW(arraySchema, { uglify: true }),
	
	stringifyString:  HW({ type: 'string' }),
	stringifyStringUgly:  HW({ type: 'string', uglify: true })
};


const fastifySchema = {
	stringify:  jsonFastify(schema),
	stringifyUgly:  jsonFastify(schema, { uglify: true }),
	
	stringifyArray:  jsonFastify(arraySchema),
	stringifyArrayUgly:  jsonFastify(arraySchema, { uglify: true }),
	
	stringifyString:  jsonFastify({ type: 'string' }),
	stringifyStringUgly:  jsonFastify({ type: 'string', uglify: true })
};






const suites = {};


suites.creation = new benchmark.Suite('creation');
suites.creation.add('json-hardwire creation', function () {
	HW(schema)
})
suites.creation.add('json-fastify-json creation', function () {
	jsonFastify(schema)
})



suites.array = new benchmark.Suite('array');
suites.array.add('JSON.stringify array', function () {
	JSON.stringify(multiArray)
})

suites.array.add('json-hardwire array', function () {
	HWSchema.stringifyArray(multiArray)
})

suites.array.add('json-hardwire-uglified array', function () {
	HWSchema.stringifyArrayUgly(multiArray)
})

suites.array.add('json-fastify-json array', function () {
	fastifySchema.stringifyArray(multiArray)
})

suites.array.add('json-fastify-json-uglified array', function () {
	fastifySchema.stringifyArrayUgly(multiArray)
})



suites.arrayBig = new benchmark.Suite('arrayBig');
suites.arrayBig.add('JSON.stringify BIG array', function () {
	JSON.stringify(multiArrayBig)
})

suites.arrayBig.add('json-hardwire BIG array', function () {
	HWSchema.stringifyArray(multiArrayBig)
})

suites.arrayBig.add('json-hardwire-uglified BIG array', function () {
	HWSchema.stringifyArrayUgly(multiArrayBig)
})

suites.arrayBig.add('json-fastify-json BIG array', function () {
	fastifySchema.stringifyArray(multiArrayBig)
})

suites.arrayBig.add('json-fastify-json-uglified BIG array', function () {
	fastifySchema.stringifyArrayUgly(multiArrayBig)
})




suites.stringLong = new benchmark.Suite('stringLong');
suites.stringLong.add('JSON.stringify long string', function () {
	JSON.stringify(str)
})

suites.stringLong.add('json-hardwire long string', function () {
	HWSchema.stringifyString(str)
})

suites.stringLong.add('json-hardwire-uglified long string', function () {
	HWSchema.stringifyStringUgly(str)
})

suites.stringLong.add('json-fastify-json long string', function () {
	fastifySchema.stringifyString(str)
})

suites.stringLong.add('json-fastify-json-uglified long string', function () {
	fastifySchema.stringifyStringUgly(str)
})



suites.stringShort = new benchmark.Suite('stringShort');
suites.stringShort.add('JSON.stringify short string', function () {
	JSON.stringify('hello world')
})

suites.stringShort.add('json-hardwire short string', function () {
	HWSchema.stringifyString('hello world')
})

suites.stringShort.add('json-hardwire-uglified short string', function () {
	HWSchema.stringifyStringUgly('hello world')
})

suites.stringShort.add('json-fastify-json short string', function () {
	fastifySchema.stringifyString('hello world')
})

suites.stringShort.add('json-fastify-json-uglified short string', function () {
	fastifySchema.stringifyStringUgly('hello world')
})



suites.object = new benchmark.Suite('object');
suites.object.add('JSON.stringify obj', function () {
	JSON.stringify(obj)
})

suites.object.add('json-hardwire obj', function () {
	HWSchema.stringify(obj)
})

suites.object.add('json-hardwire-uglified obj', function () {
	HWSchema.stringifyUgly(obj)
})

suites.object.add('json-fastify-json obj', function () {
	fastifySchema.stringify(obj)
})

suites.object.add('json-fastify-json-uglified obj', function () {
	fastifySchema.stringifyUgly(obj)
})






function run(suite){
	suite
		.on('cycle', function (event) {
			console.log(String(event.target));
		})
		.on('complete', function () {
			console.log(`Fastest is ${this.filter('fastest').map('name')}
			`);

		})
		.run({});
}

for (let suite in suites){
	run(suites[suite]);
}