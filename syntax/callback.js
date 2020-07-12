//익명 함수 (함수를 값으로 취급)
var a = function() {
    console.log('A');
}

function slowfunc(callback) {
    callback();
}

showfunc(a);