'use strict'

const HW = require('../');
const jsonFastify = require("fast-json-stringify")

const benchmark = require('benchmark')

const schema = {
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
		}
	}
}
const schemaHard = {
	title: 'Example Schema',
	type: 'object',
	properties: {
		firstName: {
			type: 'hardString'
		},
		lastName: {
			type: 'hardString'
		},
		age: {
			description: 'Age in years',
			type: 'hardInt'
		}
	}
}

const schemaComplex = {
	title: 'Example Complex Schema',
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
		houses: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					street: {type:'string'},
					nr: {type:'number'},
					city: {type:'string'},
					lat: {type:'number'},
					long: {type:'number'}
				}
			}
		}
	}
}

const schemaComplexHard = {
	title: 'Example Complex Schema',
	type: 'object',
	properties: {
		firstName: {
			type: 'hardString'
		},
		lastName: {
			type: 'hardString'
		},
		age: {
			description: 'Age in years',
			type: 'hardInt'
		},
		accounts: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					iban: {type:'hardString'},
					ccy: {type:'hardString'}
				}
			}
		},
		houses: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					street: {type:'hardString'},
					nr: {type:'hardInt'},
					city: {type:'hardString'},
					lat: {type:'hardFloat'},
					long: {type:'hardFloat'}
				}
			}
		}
	}
}



const arraySchema = {
	title: 'array schema',
	type: 'array',
	items: schema
}

const arraySchemaHard = {
	title: 'array schema hard',
	type: 'array',
	items: schemaHard
}


const arraySchemaComplex = {
	title: 'array complex schema',
	type: 'array',
	items: schemaComplex
}

const arraySchemaComplexHard = {
	title: 'array complex schema hard',
	type: 'array',
	items: schemaComplexHard
}






//Prepare DataSets..
const obj = {
	firstName: 'Matteo',
	lastName: 'Collina',
	age: 32
}

const objComplex = {
	firstName: 'Matteo',
	lastName: 'Collina',
	age: 32,
	accounts: [
		{
			iban: 'CH56 0483 5012 3456 7800 9',
			ccy: 'CHF'
		},
		{
			iban: 'CH56 0483 5012 3456 7800 8',
			ccy: 'EUR'
		}
	],
	houses: [
		{
			name: 'House 1',
			location: {
				street: 'Bhfstrasse',
				nr: 1,
				city: 'Zurich',
				lat: 47.36667,
				long: 8.55
			}
		},
		{
			name: 'House 2',
			location: {
				street: 'Bhfstrasse',
				nr: 1,
				city: 'Zurich',
				lat: 47.36667,
				long: 8.55
			}
		},
		{
			name: 'House 3',
			location: {
				street: 'Bhfstrasse',
				nr: 1,
				city: 'Zurich',
				lat: 47.36667,
				long: 8.55
			}
		}
	]
}


const objLongString = {
	firstName: 'MatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteoMatteo',
	lastName: 'CollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollinaCollina',
	age: 32
}



const multiArray = []
const multiArrayLongString = []
const multiArrayComplex = []



var str = ''

for (var i = 0; i < 10000; i++) {
	str += i
	if (i % 100 === 0) {
		str += '"'
	}
}


for (i = 0; i < 1000; i++) {
	multiArray.push(obj)
	multiArrayLongString.push(objLongString)
	multiArrayComplex.push(objComplex)
}



// prepare schemas
const HWSchema = {
	stringify:  HW(schemaHard),
	stringifyUgly:  HW(schemaHard, { uglify: true }),
	
	stringifyArray:  HW(arraySchemaHard),
	stringifyArrayUgly:  HW(arraySchemaHard, { uglify: true }),

	stringifyArrayComplex:  HW(arraySchemaComplexHard),
	stringifyArrayComplexUgly:  HW(arraySchemaComplexHard, { uglify: true }),
	
	stringifyString:  HW({ type: 'hardString' }),
	stringifyStringUgly:  HW({ type: 'hardString', uglify: true })
};


const fastifySchema = {
	stringify:  jsonFastify(schema),
	stringifyUgly:  jsonFastify(schema, { uglify: true }),
	
	stringifyArray:  jsonFastify(arraySchema),
	stringifyArrayUgly:  jsonFastify(arraySchema, { uglify: true }),

	stringifyArrayComplex:  jsonFastify(arraySchemaComplex),
	stringifyArrayComplexUgly:  jsonFastify(arraySchemaComplex, { uglify: true }),
	
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

/*suites.array.add('json-hardwire-uglified array', function () {
	HWSchema.stringifyArrayUgly(multiArray)
})*/

suites.array.add('json-fastify-json array', function () {
	fastifySchema.stringifyArray(multiArray)
})

/*suites.array.add('json-fastify-json-uglified array', function () {
	fastifySchema.stringifyArrayUgly(multiArray)
})*/



suites.arrayBig = new benchmark.Suite('arrayLongString');
suites.arrayBig.add('JSON.stringify longString array', function () {
	JSON.stringify(multiArrayLongString)
})

suites.arrayBig.add('json-hardwire longString array', function () {
	HWSchema.stringifyArray(multiArrayLongString)
})

/*suites.arrayBig.add('json-hardwire-uglified longString array', function () {
	HWSchema.stringifyArrayUgly(multiArrayLongString)
})*/

suites.arrayBig.add('json-fastify-json longString array', function () {
	fastifySchema.stringifyArray(multiArrayLongString)
})

/*suites.arrayBig.add('json-fastify-json-uglified longString array', function () {
	fastifySchema.stringifyArrayUgly(multiArrayLongString)
})*/




suites.arrayComplex = new benchmark.Suite('arrayComplex');
suites.arrayComplex.add('JSON.stringify complex array', function () {
	JSON.stringify(multiArrayComplex)
})

suites.arrayComplex.add('json-hardwire complex array', function () {
	HWSchema.stringifyArray(multiArrayComplex)
})

/*suites.arrayComplex.add('json-hardwire-uglified complex array', function () {
	HWSchema.stringifyArrayUgly(multiArrayComplex)
})*/

suites.arrayComplex.add('json-fastify-json complex array', function () {
	fastifySchema.stringifyArray(multiArrayComplex)
})

/*suites.arrayComplex.add('json-fastify-json-uglified complex array', function () {
	fastifySchema.stringifyArrayUgly(multiArrayComplex)
})*/




suites.stringLong = new benchmark.Suite('stringLong');
suites.stringLong.add('JSON.stringify long string', function () {
	JSON.stringify(str)
})

suites.stringLong.add('json-hardwire long string', function () {
	HWSchema.stringifyString(str)
})

/*suites.stringLong.add('json-hardwire-uglified long string', function () {
	HWSchema.stringifyStringUgly(str)
})*/

suites.stringLong.add('json-fastify-json long string', function () {
	fastifySchema.stringifyString(str)
})

/*suites.stringLong.add('json-fastify-json-uglified long string', function () {
	fastifySchema.stringifyStringUgly(str)
})*/



suites.stringShort = new benchmark.Suite('stringShort');
suites.stringShort.add('JSON.stringify short string', function () {
	JSON.stringify('hello world')
})

suites.stringShort.add('json-hardwire short string', function () {
	HWSchema.stringifyString('hello world')
})

/*suites.stringShort.add('json-hardwire-uglified short string', function () {
	HWSchema.stringifyStringUgly('hello world')
})*/

suites.stringShort.add('json-fastify-json short string', function () {
	fastifySchema.stringifyString('hello world')
})

/*suites.stringShort.add('json-fastify-json-uglified short string', function () {
	fastifySchema.stringifyStringUgly('hello world')
})*/



suites.object = new benchmark.Suite('object');
suites.object.add('JSON.stringify obj', function () {
	JSON.stringify(obj)
})

suites.object.add('json-hardwire obj', function () {
	HWSchema.stringify(obj)
})

/*suites.object.add('json-hardwire-uglified obj', function () {
	HWSchema.stringifyUgly(obj)
})*/

suites.object.add('json-fastify-json obj', function () {
	fastifySchema.stringify(obj)
})

/*suites.object.add('json-fastify-json-uglified obj', function () {
	fastifySchema.stringifyUgly(obj)
})*/




function getHz(bench) {
	return 1 / (bench.stats.mean + bench.stats.moe);
}

async function run(suite){
	let reference = null;
	return new Promise( (resolve, reject) => {

		suite
		.on("start", function() {
			console.log(`Running benchmark "${this.name}"\n${"=".repeat(this.name.length + 20)}`);
		})
		.on("cycle", function(event) {

			reference = reference || event.target;


			let refHz = getHz(reference);

			let hz = getHz(event.target);


			let times  = hz / refHz;


			console.log(`${String(event.target)} ${times}x ` );
		})
		.on('complete', function () {

			let fastest = this.filter('fastest');
			let slowest = this.filter('slowest');


			let fastestHz = getHz(fastest[0]);

			
			console.log(`Fastest is ${fastest.map('name')}
			`);


			let hz = getHz(slowest[0]);
			let percent = (1 - (hz / fastestHz)) * 100;

			console.log(`slowest is ${slowest.map('name')} is ${percent.toFixed(3)}%slower`);
			
			//console.log(`Fastest is ${ JSON.stringify(fastest ) }`);
			resolve();	
		})
		.run({async:true});
		//.run();
	})
}


async function runAll(){

	for (let suite in suites){
		await run(suites[suite]);
	}
}
runAll();