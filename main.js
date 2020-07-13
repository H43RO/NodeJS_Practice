var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
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

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;
    if (pathName === '/') {
        if (queryData.id === undefined) {
            //홈 페이지
            // fs.readdir('./data', function(err, filelist) {
            //     var title = 'Welcome';
            //     var description = 'Hello, Node.js!';
            //     var list = template.list(filelist);
            //     var html = template.html(title, list,
            //         `<h2>${title}</h2> ${description}`,
            //         `<a href="/create">CREATE</a>`);
            //     response.writeHead(200);
            //     response.end(html);
            // });
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

        } else {
            // //쿼리에 따른 다른 페이지 (데이터)
            // fs.readdir('./data', function(err, filelist) {
            //         var filteredId = path.parse(queryData.id).base;
            // fs.readFile(`data/${filteredId}`, 'utf-8', function(err, data) {
            //         var title = queryData.id;
            //         var sanitizeTitle = sanitizeHtml(title);
            //         var sanitizeDescription = sanitizeHtml(data, {
            //             allowedTags: ['h1']
            //         });
            //         var description = data;
            //         var list = template.list(filelist);
            //         var html = template.html(title, list,
            //             `<h2>${sanitizeTitle}</h2> ${sanitizeDescription}`,
            //             `<a href="/create">CREATE</a> <a href="/update?id=${sanitizeTitle}">UPDATE</a>
            //              <form action="delete_process" method="post">
            //               <input type="hidden" name="id" value="${sanitizeTitle}">
            //               <input type="submit" value="DELETE">
            //              </form>`
            //         );
            //         response.writeHead(200);
            //         response.end(html);
            //     });
            // });
            // }

            db.query(`SELECT * FROM topic`, function(error, topics) {
                if (error) {
                    throw error;
                }
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic) {
                    if (error2) {
                        throw error2;
                    }
                    // console.log(topic);
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.html(title, list,
                        `<h2>${title}</h2> ${description}`,
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
    } else if (pathName === '/create') {
        // fs.readdir('./data', function(err, filelist) {
        //     var title = 'Welcome';
        //     var description = 'Hello, Node.js!';
        //     var list = template.list(filelist);
        //     var html = template.html(title, list,
        //         `<form action="/create_process" method="post">
        //         <p> <input type="text" name="title" placeholder="제목을 입력하세요"> </p>
        //         <p>
        //             <textarea name="description" placeholder="description"></textarea>
        //         </p>
        //         <p>
        //             <input type="submit">
        //         </p>
        //     </form>`, '');
        //     response.writeHead(200);
        //     response.end(html);
        // });

        db.query(`SELECT * FROM topic`, function(error, topics) {
            var title = 'Create';
            var list = template.list(topics);
            var html = template.html(title, list,
                `<form action="/create_process" method="post">
                    <p> <input type="text" name="title" placeholder="제목을 입력하세요"> </p>
                    <p>
                        <textarea name="description" placeholder="내용을 입력하세요"></textarea>
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

    } else if (pathName === '/create_process') {
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
            // var title = post.title;
            // var description = post.description;

            // fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
            //     response.writeHead(302, { Location: `/?id=${title}` });
            //     response.end();
            // })

            db.query(`INSERT INTO topic (title,description, created, author_id)
                VALUES(?, ?, NOW(), ?)`, [post.title, post.description, 1],
                function(error, result) {
                    if (error) {
                        throw (error);
                    }
                    response.writeHead(302, { Location: `/?id=${result.insertId}` });
                    response.end();
                })
        });

    } else if (pathName === '/update') {
        // fs.readdir('./data', function(err, filelist) {
        //     var filteredId = path.parse(queryData.id).base;
        //     //보안 이슈 방지
        //     fs.readFile(`data/${filteredId}`, 'utf-8', function(err, description) {
        //         var title = queryData.id;
        //         var list = template.list(filelist);
        //         var html = template.html(title, list,
        //             //hidden 타입을 통해, 어떤 문서를 수정해야할지 구분하기위해 원래 title 값을 저장
        //             `<form action="/update_process" method="post">
        //                 <input type="hidden" name="id" value="${title}">
        //                 <p> <input type="text" name="title" placeholder="title" value="${title}"> </p>
        //                 <p>
        //                     <textarea name="description" placeholder="description">${description}</textarea>
        //                 </p>
        //                 <p>
        //                     <input type="submit">
        //                 </p>
        //             </form>`, `'${title}' 문서 수정하기`);
        //         response.writeHead(200);
        //         response.end(html);
        //     });
        // });

        db.query('SELECT * FROM topic', function(error, topics) {
            if (error) {
                throw error;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id],
                function(error2, topic) {
                    if (error2) {
                        throw error2;
                    }
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
                                <input type="submit">
                            </p>
                        </form>`, `'${title}' 문서 수정하기`);
                    response.writeHead(200);
                    response.end(html);

                });
        });
    } else if (pathName === '/update_process') {
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

            // //${id} 라는 파일을 ${title} 이라는 파일로 이름을 변경
            // fs.rename(`data/${id}`, `data/${title}`, function(error) {
            //     fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            //         response.writeHead(302, { Location: `/?id=${title}` });
            //         response.end();
            //     })
            // });

            db.query(`UPDATE topic SET title=?,description=? WHERE id=?`, [title, description, id],
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
    } else if (pathName === '/delete_process') {
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
            // var filteredId = path.parse(id).base;
            // //지정한 파일 삭제
            // fs.unlink(`data/${filteredId}`, function(err) {
            //     //홈 페이지로 리다이렉션
            //     response.writeHead(302, { Location: `/` });
            //     response.end();
            // });

            db.query(`DELETE FROM topic WHERE id=?`, [id], function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(400);
        response.end('404 not found');
    }
});
app.listen(3000);