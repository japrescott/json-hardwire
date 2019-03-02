### json-hardwire:

this is a fork of __fast-json-stringify__ that is highly optimized for speed and unforgiving if your json doesnt match the schema. it is also json-schema incompatible as it adds new types for more optimizations

I made this for because fast-json-stringify is *not* very fast when it comes to long strings and horrible, when they are nested in array/object structures. If you know your data, you can let json-hardwire boost the creation of the stringified object.

see the benchmarks named `hardwire` to see the boost


Unforgiving types:

 * `'hardString'`
 * `'hardInt'`
 * `'hardFloat'`
 * `'hardDate'`
 * `'hardJSONEncoded'`




## Benchmarks of json-hardwire:
Note: JSON.stringify is the baseline

Node 10.12.0:

```
Running benchmark "array"
=========================
JSON.stringify array x 3,481 ops/sec ±4.57% (84 runs sampled) 1x
json-hardwire array x 9,105 ops/sec ±0.32% (89 runs sampled) 2.7263565355565142x
json-fastify-json array x 6,514 ops/sec ±3.54% (87 runs sampled) 1.8897189013023814x
Fastest is json-hardwire array
slowest is JSON.stringify array is 63.321%slower

Running benchmark "arrayLongString"
===================================
JSON.stringify longString array x 1,086 ops/sec ±4.36% (85 runs sampled) 1x
json-hardwire longString array x 11,338 ops/sec ±0.53% (89 runs sampled) 10.835003078448604x
json-fastify-json longString array x 496 ops/sec ±1.35% (83 runs sampled) 0.4705407797725417x
Fastest is json-hardwire longString array
slowest is json-fastify-json longString array is 95.657%slower

Running benchmark "arrayComplex"
================================
JSON.stringify complex array x 272 ops/sec ±5.50% (78 runs sampled) 1x
json-hardwire complex array x 9,096 ops/sec ±0.37% (87 runs sampled) 35.15515986064193x
json-fastify-json complex array x 6,567 ops/sec ±2.70% (90 runs sampled) 24.805482688843536x
Fastest is json-hardwire complex array
slowest is JSON.stringify complex array is 97.155%slower

Running benchmark "stringLong"
==============================
JSON.stringify long string x 13,854 ops/sec ±5.24% (85 runs sampled) 1x
json-hardwire long string x 74,361,126 ops/sec ±0.48% (88 runs sampled) 5621.549221104614x
json-fastify-json long string x 13,640 ops/sec ±6.10% (81 runs sampled) 0.9765167621993757x
Fastest is json-hardwire long string
slowest is json-fastify-json long string,JSON.stringify long string is 99.983%slower

Running benchmark "stringShort"
===============================
JSON.stringify short string x 4,045,749 ops/sec ±0.66% (92 runs sampled) 1x
json-hardwire short string x 951,082,662 ops/sec ±0.41% (92 runs sampled) 235.6741284651254x
json-fastify-json short string x 29,783,720 ops/sec ±0.51% (91 runs sampled) 7.37315272778112x
json-fastify-json-uglified short string x 28,940,193 ops/sec ±2.63% (87 runs sampled) 7.016066571583278x
Fastest is json-hardwire short string
slowest is JSON.stringify short string is 99.576%slower

Running benchmark "object"
==========================
JSON.stringify obj x 1,624,338 ops/sec ±2.63% (87 runs sampled) 1x
json-hardwire obj x 11,181,532 ops/sec ±0.31% (86 runs sampled) 7.043029884363477x
json-fastify-json obj x 6,793,823 ops/sec ±0.48% (87 runs sampled) 4.272111048912816x
Fastest is json-hardwire obj
slowest is JSON.stringify obj is 85.802%slower


```













### OLD DOCUMENTATION:


__fast-json-stringify__ is significantly faster than `JSON.stringify()` for small payloads. Its performance advantage shrinks as your payload grows. It pairs well with [__flatstr__](https://www.npmjs.com/package/flatstr), which triggers a V8 optimization that improves performance when eventually converting the string to a `Buffer`.

Benchmarks:

Node 6.11.2:

```
JSON.stringify array x 3,944 ops/sec ±1.13% (83 runs sampled)
fast-json-stringify array x 3,638 ops/sec ±2.56% (83 runs sampled)
fast-json-stringify-uglified array x 3,693 ops/sec ±1.75% (82 runs sampled)
JSON.stringify long string x 15,007 ops/sec ±1.13% (90 runs sampled)
fast-json-stringify long string x 14,480 ops/sec ±1.06% (87 runs sampled)
fast-json-stringify-uglified long string x 14,065 ops/sec ±1.22% (87 runs sampled)
JSON.stringify short string x 5,213,486 ops/sec ±1.35% (84 runs sampled)
fast-json-stringify short string x 12,314,153 ops/sec ±1.54% (83 runs sampled)
fast-json-stringify-uglified short string x 11,801,080 ops/sec ±6.65% (83 runs sampled)
JSON.stringify obj x 1,131,672 ops/sec ±16.67% (61 runs sampled)
fast-json-stringify obj x 3,500,095 ops/sec ±5.50% (80 runs sampled)
fast-json-stringify-uglified obj x 4,091,347 ops/sec ±1.33% (89 runs sampled)
```

Node 8.3.0:

```
JSON.stringify array x 4,025 ops/sec ±0.99% (90 runs sampled)
fast-json-stringify array x 6,463 ops/sec ±0.99% (90 runs sampled)
fast-json-stringify-uglified array x 6,314 ops/sec ±1.15% (92 runs sampled)
JSON.stringify long string x 14,648 ops/sec ±1.64% (88 runs sampled)
fast-json-stringify long string x 14,822 ops/sec ±1.09% (88 runs sampled)
fast-json-stringify-uglified long string x 14,963 ops/sec ±0.86% (89 runs sampled)
JSON.stringify short string x 4,724,477 ops/sec ±1.03% (89 runs sampled)
fast-json-stringify short string x 12,484,378 ops/sec ±0.92% (88 runs sampled)
fast-json-stringify-uglified short string x 12,218,181 ops/sec ±1.24% (90 runs sampled)
JSON.stringify obj x 1,898,648 ops/sec ±2.15% (85 runs sampled)
fast-json-stringify obj x 5,714,557 ops/sec ±1.45% (90 runs sampled)
fast-json-stringify-uglified obj x 5,902,021 ops/sec ±1.06% (91 runs sampled)
```

#### Table of contents:
- <a href="#example">`Example`</a>
- <a href="#api">`API`</a>
 - <a href="#fastJsonStringify">`fastJsonStringify`</a>
 - <a href="#specific">`Specific use cases`</a>
 - <a href="#required">`Required`</a>
 - <a href="#missingFields">`Missing fields`</a>
 - <a href="#patternProperties">`Pattern Properties`</a>
 - <a href="#additionalProperties">`Additional Properties`</a>
 - <a href="#anyof">`AnyOf`</a>
 - <a href="#ref">`Reuse - $ref`</a>
 - <a href="#long">`Long integers`</a>
 - <a href="#uglify">`Uglify`</a>
- <a href="#acknowledgements">`Acknowledgements`</a>
- <a href="#license">`License`</a>


<a name="example"></a>
## Example

```js
const fastJson = require('fast-json-stringify')
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    age: {
      description: 'Age in years',
      type: 'integer'
    },
    reg: {
      type: 'string'
    }
  }
})

console.log(stringify({
  firstName: 'Matteo',
  lastName: 'Collina',
  age: 32,
  reg: /"([^"]|\\")*"/
}))
```
<a name="api"></a>
## API
<a name="fastJsonStringify"></a>
### fastJsonStringify(schema)

Build a `stringify()` function based on
[jsonschema](http://json-schema.org/).

Supported types:

 * `'string'`
 * `'integer'`
 * `'number'`
 * `'array'`
 * `'object'`
 * `'boolean'`
 * `'null'`

And nested ones, too.  


Additional Types for more ooomp:
* `'float'`
* `'int'`
* `'date'`
* `'stringDirect'` - use this when you dont have any chars in your string that need to be escaped like " \


<a name="specific"></a>
#### Specific use cases

| Instance   | Serialized as                |
| -----------|------------------------------|
| `Date`     | `string` via `toISOString()` |
| `RegExp`   | `string`                     |

<a name="required"></a>
#### Required
You can set specific fields of an object as required in your schema by adding the field name inside the `required` array in your schema.  
Example:
```javascript
const schema = {
  title: 'Example Schema with required field',
  type: 'object',
  properties: {
    nickname: {
      type: 'string'
    },
    mail: {
      type: 'string'
    }
  },
  required: ['mail']
}
```
If the object to stringify is missing the required field(s), `fast-json-stringify` will throw an error.

<a name="missingFields"></a>
#### Missing fields
If a field *is present* in the schema (and is not required) but it *is not present* in the object to stringify, `fast-json-stringify` will not write it in the final string.  
Example:
```javascript
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    nickname: {
      type: 'string'
    },
    mail: {
      type: 'string'
    }
  }
})

const obj = {
  mail: 'mail@example.com'
}

console.log(stringify(obj)) // '{"mail":"mail@example.com"}'
```

<a name="defaults"></a>
#### Defaults
`fast-json-stringify` supports `default` jsonschema key in order to serialize a value
if it is `undefined` or not present.

Example:
```javascript
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    nickname: {
      type: 'string',
      default: 'the default string'
    }
  }
})

console.log(stringify({})) // '{"nickname":"the default string"}'
console.log(stringify({nickname: 'my-nickname'})) // '{"nickname":"my-nickname"}'
```

<a name="patternProperties"></a>
#### Pattern properties
`fast-json-stringify` supports pattern properties as defined by JSON schema.  
*patternProperties* must be an object, where the key is a valid regex and the value is an object, declared in this way: `{ type: 'type' }`.  
*patternProperties* will work only for the properties that are not explicitly listed in the properties object.  
Example:
```javascript
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    nickname: {
      type: 'string'
    }
  },
  patternProperties: {
    'num': {
      type: 'number'
    },
    '.*foo$': {
      type: 'string'
    }
  }
})

const obj = {
  nickname: 'nick',
  matchfoo: 42,
  otherfoo: 'str'
  matchnum: 3
}

console.log(stringify(obj)) // '{"matchfoo":"42","otherfoo":"str","matchnum":3,"nickname":"nick"}'
```

<a name="additionalProperties"></a>
#### Additional properties
`fast-json-stringify` supports additional properties as defined by JSON schema.  
*additionalProperties* must be an object or a boolean, declared in this way: `{ type: 'type' }`.  
*additionalProperties* will work only for the properties that are not explicitly listed in the *properties* and *patternProperties* objects.

If *additionalProperties* is not present or is set to `false`, every property that is not explicitly listed in the *properties* and *patternProperties* objects,will be ignored, as described in <a href="#missingFields">Missing fields</a>.  
If *additionalProperties* is set to `true`, it will be used by `JSON.stringify` to stringify the additional properties. If you want to achieve maximum performance, we strongly encourage you to use a fixed schema where possible.  
Example:
```javascript
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    nickname: {
      type: 'string'
    }
  },
  patternProperties: {
    'num': {
      type: 'number'
    },
    '.*foo$': {
      type: 'string'
    }
  },
  additionalProperties: {
    type: 'string'
  }
})

const obj = {
  nickname: 'nick',
  matchfoo: 42,
  otherfoo: 'str'
  matchnum: 3,
  nomatchstr: 'valar morghulis',
  nomatchint: 313
}

console.log(stringify(obj)) // '{"matchfoo":"42","otherfoo":"str","matchnum":3,"nomatchstr":"valar morghulis",nomatchint:"313","nickname":"nick"}'
```

#### AnyOf

`fast-json-stringify` supports the anyOf keyword as defined by JSON schema. *anyOf* must be an array of valid JSON schemas. The different schemas will be tested in the specified order. The more schemas `stringify` has to try before finding a match, the slower it will be.

*anyOf* uses [ajv](https://www.npmjs.com/package/ajv) as a JSON schema validator to find the schema that matches the data. This has an impact on performance—only use it as a last resort.

Example:
```javascript
const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    'undecidedType': {
      'anyOf': [{
	type: 'string'
      }, {
	type: 'boolean'
      }]
    }
  }
}
```

<a name="if-then-else"></a>
#### If/then/else
`fast-json-stringify` supports `if/then/else` jsonschema feature. See [ajv documentation](https://ajv.js.org/keywords.html#ifthenelse).

Example:
```javascript
const stringify = fastJson({
  'type': 'object',
  'properties': {
  },
  'if': {
    'properties': {
      'kind': { 'type': 'string', 'enum': ['foobar'] }
    }
  },
  'then': {
    'properties': {
      'kind': { 'type': 'string', 'enum': ['foobar'] },
      'foo': { 'type': 'string' },
      'bar': { 'type': 'number' }
    }
  },
  'else': {
    'properties': {
      'kind': { 'type': 'string', 'enum': ['greeting'] },
      'hi': { 'type': 'string' },
      'hello': { 'type': 'number' }
    }
  }
})

console.log(stringify({
  kind: 'greeting',
  foo: 'FOO',
  bar: 42,
  hi: 'HI',
  hello: 45
})) // {"kind":"greeting","hi":"HI","hello":45}
console.log(stringify({
  kind: 'foobar',
  foo: 'FOO',
  bar: 42,
  hi: 'HI',
  hello: 45
})) // {"kind":"greeting","foo":"FOO","bar":42}
```

**NB:** don't declare the properties twice or you'll print them twice!

<a name="ref"></a>
#### Reuse - $ref
If you want to reuse a definition of a value, you can use the property `$ref`.  
The value of `$ref` must be a string in [JSON Pointer](https://tools.ietf.org/html/rfc6901) format.  
Example:
```javascript
const schema = {
  title: 'Example Schema',
  definitions: {
    num: {
      type: 'object',
      properties: {
        int: {
          type: 'integer'
        }
      }
    },
    str: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    nickname: {
      $ref: '#/definitions/str'
    }
  },
  patternProperties: {
    'num': {
      $ref: '#/definitions/num'
    }
  },
  additionalProperties: {
    $ref: '#/definitions/def'
  }
}

const stringify = fastJson(schema)
```
If you need to use an external definition, you can pass it as an option to `fast-json-stringify`.  
Example:
```javascript
const schema = {
  title: 'Example Schema',
  type: 'object',
  properties: {
    nickname: {
      $ref: 'strings#/definitions/str'
    }
  },
  patternProperties: {
    'num': {
      $ref: 'numbers#/definitions/num'
    }
  },
  additionalProperties: {
    $ref: 'strings#/definitions/def'
  }
}

const externalSchema = {
  numbers: {
    definitions: {
      num: {
        type: 'object',
        properties: {
          int: {
            type: 'integer'
          }
        }
      }
    }
  },
  strings: require('./string-def.json')
}

const stringify = fastJson(schema, { schema: externalSchema })
```

<a name="long"></a>
#### Long integers
Long integers (64-bit) are supported using the [long](https://github.com/dcodeIO/long.js) module.
Example:
```javascript
const Long = require('long')

const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    id: {
      type: 'integer'
    }
  }
})

const obj = {
  id: Long.fromString('18446744073709551615', true)
}

console.log(stringify(obj)) // '{"id":18446744073709551615}'
```

<a name="uglify"></a>
#### Uglify
If you want to squeeze a little bit more performance out of the serialization at the cost of readability in the generated code, you can pass `uglify: true` as an option.
Note that you have to manually install `uglify-es` in order for this to work. Only version 3 is supported.
Example:

Note that if you are using Node 8.3.0 or newer, there are no performance gains from using Uglify. See https://www.nearform.com/blog/node-js-is-getting-a-new-v8-with-turbofan/

```javascript

const stringify = fastJson({
  title: 'Example Schema',
  type: 'object',
  properties: {
    id: {
      type: 'integer'
    }
  }
}, { uglify: true })

// stringify is now minified code
console.log(stringify({ some: 'object' })) // '{"some":"object"}'
```

<a name="acknowledgements"></a>
## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

<a name="license"></a>
## License

MIT
