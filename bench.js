'use strict'

const benchmark = require('benchmark')
const suite = new benchmark.Suite()

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


const schemaunforgiving = {
	'title': 'Example unforgiving Schema',
	'type': 'object',
	'properties': {
		'firstName': {
			'type': 'hardString'
		},
		'lastName': {
			'type': 'hardString'
		},
		'age': {
			'description': 'Age in years',
			'type': 'hardInt'
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


const HW = require('.')
const stringify = HW(schema)
const stringifyUgly = HW(schema, { uglify: true })

const stringifyArray = HW(arraySchema)
const stringifyArrayUgly = HW(arraySchema, { uglify: true })

const stringifyArrayunforgiving = HW(schemaunforgiving)
const stringifyArrayUglyunforgiving = HW(schemaunforgiving, { uglify: true })

const stringifyString = HW({ type: 'string' })
const stringifyStringUgly = HW({ type: 'string', uglify: true })
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

suite.add('HW creation', function () {
	HW(schema)
})

suite.add('JSON.stringify array', function () {
	JSON.stringify(multiArray)
})

suite.add('json-hardwire array', function () {
	stringifyArray(multiArray)
})

suite.add('json-hardwire-uglified array', function () {
	stringifyArrayUgly(multiArray)
})

suite.add('json-hardwire array-unforgiving', function () {
	stringifyArrayunforgiving(multiArray)
})

suite.add('json-hardwire-uglified-unforgiving array', function () {
	stringifyArrayUglyunforgiving(multiArray)
})



suite.add('JSON.stringify BIG array', function () {
	JSON.stringify(multiArrayBig)
})

suite.add('json-hardwire BIG array', function () {
	stringifyArray(multiArrayBig)
})

suite.add('json-hardwire-uglified BIG array', function () {
	stringifyArrayUgly(multiArrayBig)
})

suite.add('json-hardwire-unforgiving BIG array', function () {
	stringifyArrayunforgiving(multiArrayBig)
})

suite.add('json-hardwire-uglified-unforgiving BIG array', function () {
	stringifyArrayUglyunforgiving(multiArrayBig)
})





suite.add('JSON.stringify long string', function () {
	JSON.stringify(str)
})

suite.add('json-hardwire long string', function () {
	stringifyString(str)
})

suite.add('json-hardwire-uglified long string', function () {
	stringifyStringUgly(str)
})

suite.add('JSON.stringify short string', function () {
	JSON.stringify('hello world')
})

suite.add('json-hardwire short string', function () {
	stringifyString('hello world')
})

suite.add('json-hardwire-uglified short string', function () {
	stringifyStringUgly('hello world')
})

suite.add('JSON.stringify obj', function () {
	JSON.stringify(obj)
})

suite.add('json-hardwire obj', function () {
	stringify(obj)
})

suite.add('json-hardwire-uglified obj', function () {
	stringifyUgly(obj)
})




suite.on('cycle', cycle)

suite.run()

function cycle (e) {
	console.log(e.target.toString())
}
