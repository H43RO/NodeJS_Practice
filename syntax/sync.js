var fs = require('fs');

//readFileSync
console.log('A');
var result = fs.readFileSync('sample.txt', 'utf-8')
console.log(result);
console.log('C');
//A B C

//readFile(Async)
console.log('A');
fs.readFile('sample.txt', 'utf-8', function(err, result) {
    console.log(result);
});
console.log('C');
//A C B