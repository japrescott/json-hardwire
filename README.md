###json-hardwire:

this is a fork of __fast-json-stringify__ that is highly optimized for speed and unforgiving if your json doesnt match the schema. it is also json-schema incompatible as it adds new types for more optimizations

I made this for because fast-json-stringify is not very fast when it comes to long strings and horrible, when they are nested. If you know your data, you can let json-hardwire boost the creation of the stringified object.

see the benchmarks named `unforgiving` to see the boost


Unforgiving types:

 * `'hardString'`
 * `'hardInt'`
 * `'hardFloat'`
 * `'hardDate'`




Benchmarks of json-hardwire:

Node 10.2.1:

```
JSON.stringify array x 2,759 ops/sec ±0.63% (89 runs sampled)
json-hardwire array x 4,467 ops/sec ±1.13% (89 runs sampled)
json-hardwire-uglified array x 4,365 ops/sec ±1.35% (88 runs sampled)
json-hardwire array-unforgiving x 9,437,977 ops/sec ±0.80% (88 runs sampled)
json-hardwire-uglified-unforgiving array x 9,554,308 ops/sec ±0.67% (93 runs sampled)

JSON.stringify BIG array x 736 ops/sec ±0.56% (92 runs sampled)
json-hardwire BIG array x 361 ops/sec ±0.48% (89 runs sampled)
json-hardwire-uglified BIG array x 358 ops/sec ±0.88% (88 runs sampled)
json-hardwire-unforgiving BIG array x 9,648,266 ops/sec ±0.54% (94 runs sampled)
json-hardwire-uglified-unforgiving BIG array x 9,652,775 ops/sec ±0.34% (94 runs sampled)

JSON.stringify long string x 8,173 ops/sec ±0.66% (94 runs sampled)
json-hardwire long string x 8,279 ops/sec ±0.31% (94 runs sampled)
json-hardwire-uglified long string x 8,234 ops/sec ±0.59% (92 runs sampled)

JSON.stringify short string x 3,296,906 ops/sec ±0.49% (92 runs sampled)
json-hardwire short string x 28,084,944 ops/sec ±0.34% (87 runs sampled)
json-hardwire-uglified short string x 28,143,012 ops/sec ±0.31% (94 runs sampled)

JSON.stringify obj x 1,301,020 ops/sec ±0.55% (91 runs sampled)
json-hardwire obj x 4,497,715 ops/sec ±0.57% (91 runs sampled)
json-hardwire-uglified obj x 4,469,555 ops/sec ±0.60% (92 runs sampled)


```













###OLD DOCUMENTATION:


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
