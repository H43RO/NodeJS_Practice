//익명 함수 (함수를 값으로 취급)
var a = function() {
    console.log('A');
}

//Call Back (slowfunc 작업이 끝났을 때 호출)
function slowfunc(callback) {
    callback();
}

showfunc(a);