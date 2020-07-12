var members = ['h43ro', 'hello', 'god'];
console.log(members[1]); //hello
var i = 0;
while (i < members.length) {
    console.log(members[i]);
    i++;
}

var roles = {
    'programmer': 'haero',
    'designer': 'hello',
    'manager': 'god'
}
console.log(roles.designer); //hello

for (var name in roles) {
    console.log('object => ', name, '\tvalue => ', roles[name]);
}