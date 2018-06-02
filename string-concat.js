const benchmark = require('benchmark')
const suite = new benchmark.Suite()

let N = 100;

function simpleConcat() {
    let str = '';
    for (let i = 0; i < N; i++) {
        str += 'longerText to make sure no funky stuff is happening';
    }
    return str;
}

function joinConcat() {
    let arr = [];
    for (let i = 0; i < N; i++) {
        arr.push('longerText to make sure no funky stuff is happening');
    }
    return arr.join('');
}

const M = 12;

function bufferedConcat() {
    let str = '';
    let buf = '';

    for (let i = 0; i < N; i++) {
        buf += 'longerText to make sure no funky stuff is happening';
        if (buf.length >= M) {
            str += buf;
            buf = '';
        }
    }
    str += buf;

    return str;
}


function bufferedConcat2() {
    let buffs = [];
    let buf = Buffer.from('','utf8');
    let len=0;

    for (let i = 0; i < N; i++) {

        buffs.push(Buffer.from('longerText to make sure no funky stuff is happening'));
        // len+='longerText to make sure no funky stuff is happening'.length;
    }
    return Buffer.concat(buffs).toString("utf8")
}

// warmup
let str1 = simpleConcat();
let str2 = joinConcat();
let str3 = bufferedConcat();
let str4 = bufferedConcat2();

console.log("Str4?", str4);

if (str3 !== str1) throw new Error('Bad buffered concat.');
if (str4 !== str1) throw new Error('Bad buffered2 concat.');

/*console.time('+=');
for (let i = 0; i < 10; i++) str1 = simpleConcat();
console.timeEnd('+=');

console.time('push/join');
for (let i = 0; i < 10; i++) str2 = joinConcat();
console.timeEnd('push/join');

console.time('buffered +=');
for (let i = 0; i < 10; i++) str3 = bufferedConcat();
console.timeEnd('buffered +=');

console.time('buffered2 +=');
for (let i = 0; i < 10; i++) str4 = bufferedConcat2();
console.timeEnd('buffered2 +=');*/



suite.add('+=', function () {
	str1 = simpleConcat();
})
suite.add('push(/join', function () {
	str2 = joinConcat();
})
suite.add('buffered', function () {
	str3 = bufferedConcat();
})
suite.add('buffered2', function () {
	str4 = bufferedConcat2();
})


suite.add('+=', function () {
    N = 1000000;
	str1 = simpleConcat();
})
suite.add('push(/join', function () {
    N = 1000000;
	str2 = joinConcat();
})
suite.add('buffered', function () {
    N = 1000000;
	str3 = bufferedConcat();
})
suite.add('buffered2', function () {
    N = 1000000;
	str4 = bufferedConcat2();
})



  
suite.on('cycle', cycle)

suite.run()

function cycle (e) {
console.log(e.target.toString())
}
  