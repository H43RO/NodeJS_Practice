var mysql = require('mysql');

//MySQL 서버 접속을 위한 객체
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rlaguswns5',
    database: 'opentutorials'
});

//MySQL 서버 접속
db.connect();

module.exports = db;