var db = require('./db');
var url = require('url');
var template = require('./template');
var qs = require('querystring');

exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js!';
        var list = template.list(topics);
        var html = template.html(title, list,
            `<h2>${title}</h2> ${description}`,
            `<a href="/create">CREATE</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    db.query(`SELECT * FROM topic`, function(error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) {
            if (error2) {
                throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.html(title, list,
                `<h2>${title}</h2> ${description}
                <p>by ${topic[0].name}</p>`,
                `<a href="/create">CREATE</a> <a href="/update?id=${queryData.id}">UPDATE</a>
                  <form action="delete_process" method="post">
                   <input type="hidden" name="id" value="${queryData.id}">
                   <input type="submit" value="DELETE">
                  </form>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create = function(request, response) {

    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error, authors) {
            var title = 'Create';
            var list = template.list(topics);
            var html = template.html(title, list,
                `<form action="/create_process" method="post">
                    <p> <input type="text" name="title" placeholder="제목을 입력하세요"> </p>
                    <p>
                        <textarea name="description" placeholder="내용을 입력하세요"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>`,
                `<a href="/create">CREATE</a>`
            );
            response.writeHead(200);
            response.end(html);
        });

    });
}

exports.create_process = function(request, response) {
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

        db.query(`INSERT INTO topic (title,description, created, author_id)
                VALUES(?, ?, NOW(), ?)`, [post.title, post.description, post.author],
            function(error, result) {
                if (error) {
                    throw (error);
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            })
    });
}

exports.update = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    db.query('SELECT * FROM topic', function(error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id],
            function(error2, topic) {
                if (error2) {
                    throw error2;
                }
                db.query(`SELECT * FROM author`, function(error, authors) {
                    var id = topic[0].id;
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.html(title, list,
                        //hidden 타입을 통해, 어떤 문서를 수정해야할지 구분하기위해 원래 title 값을 저장
                        `<form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${id}">
                        <p> <input type="text" name="title" placeholder="title" value="${title}"> </p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            ${template.authorSelect(authors, topic[0].author_id)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>`, `'${title}' 문서 수정하기`);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        var _url = request.url;
        var queryData = url.parse(_url, true).query;

    });
}

exports.update_process = function(request, response) {
    var body = '';

    //서버쪽에서 데이터 수신할 때마다 function(data) 호출
    // -> data라는 인자를 통해 수신한 데이터 추출
    request.on('data', function(data) {
        body += data;
    });
    //더이상 수신할 데이터가 없으면 function() 호출
    request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;

        db.query(`UPDATE topic SET title=?,description=?,author_id=? WHERE id=?`, [title, description, post.author, id],
            function(error, result) {
                if (error) {
                    console.log("error");
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${id}` });
                response.end();
            }
        );
    });
}

exports.delete = function(request, response) {
    var body = '';

    //서버쪽에서 데이터 수신할 때마다 function(data) 호출
    // -> data라는 인자를 통해 수신한 데이터 추출
    request.on('data', function(data) {
        body += data;
    });
    //더이상 수신할 데이터가 없으면 function() 호출
    request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;

        db.query(`DELETE FROM topic WHERE id=?`, [id], function(error, result) {
            if (error) {
                throw error;
            }
            response.writeHead(302, { Location: `/` });
            response.end();
        });
    });
}