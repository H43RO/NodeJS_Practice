var db = require('./db');
var template = require('./template');
var qs = require('querystring');
var url = require('url');

exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error, authors) {
            var title = 'Author';
            var list = template.list(topics);
            var html = template.html(title, list,
                `
                ${template.authorTable(authors)}
                <style>
                    td{
                        border: 3px solid black;
                        padding: 5px;
                    }
                    table{
                        border-collapse: collapse;
                    }
                </style>
                <br>
                <form action="/author/create_process" method="post">
                    <p>
                        <input type="text" name="name" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" value="CREATE">
                    </p>
                </form>
                `,
                ``
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}


exports.create_author_process = function(request, response) {
    var body = '';

    //서버쪽에서 데이터 수신할 때마다 function(data) 호출
    // -> data라는 인자를 통해 수신한 데이터 추출
    request.on('data', function(data) {
        body += data;
        //데이터가 너무 크면 연결 해제
        if (body.length > 1e6) {
            request.connection.destroy();
        }
    });
    //더이상 수신할 데이터가 없으면 function() 호출
    request.on('end', function() {
        var post = qs.parse(body);

        db.query(`INSERT INTO author (name,profile)
                VALUES(?, ?)`, [post.name, post.profile],
            function(error, result) {
                if (error) {
                    throw (error);
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            })
    });
}

exports.update = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], function(error3, author) {
                var title = 'Author';
                var list = template.list(topics);
                var html = template.html(title, list,
                    `
                    ${template.authorTable(authors)}
                    <style>
                        td{
                            border: 3px solid black;
                            padding: 5px;
                        }
                        table{
                            border-collapse: collapse;
                        }
                    </style>
                    <br>
                    <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${queryData.id}">
                    </p>
                        <p>
                            <input type="text" name="name" value="${author[0].name}" placeholder="name">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="UPDATE">
                        </p>
                    </form>
                    `,
                    ``
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}


exports.update_process = function(request, response) {
    var body = '';

    //서버쪽에서 데이터 수신할 때마다 function(data) 호출
    // -> data라는 인자를 통해 수신한 데이터 추출
    request.on('data', function(data) {
        body += data;
        //데이터가 너무 크면 연결 해제
        if (body.length > 1e6) {
            request.connection.destroy();
        }
    });
    //더이상 수신할 데이터가 없으면 function() 호출
    request.on('end', function() {
        var post = qs.parse(body);
        var name = post.name;
        var profile = post.profile;
        var id = post.id;

        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`, [name, profile, id],
            function(error, result) {
                if (error) {
                    console.log("error");
                    throw error;
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            }
        );
    });
}


exports.delete_process = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    //더이상 수신할 데이터가 없으면 function() 호출
    db.query(`DELETE FROM author WHERE id=?`, [queryData.id], function(error, result) {
        if (error) {
            console.log("error");
            throw error;
        }
        response.writeHead(302, { Location: `/author` });
        response.end();
    });

}