var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i++;
    }
    list = list + '</ul>';

    return list;
}

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;

    if (pathName === '/') {

        if (queryData.id === undefined) {
            //홈 페이지
            fs.readdir('./data', function(err, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js!';
                var list = templateList(filelist);
                var template = templateHTML(title, list,
                    `<h2>${title}</h2> ${description}`,
                    `<a href="/create">CREATE</a>`);
                response.writeHead(200);
                response.end(template);
            });
        } else {
            //쿼리에 따른 다른 페이지
            fs.readdir('./data', function(err, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, data) {
                    var title = queryData.id;
                    var description = data;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list,
                        `<h2>${title}</h2> ${description}`,
                        `<a href="/create">CREATE</a> <a href="/update?id=${title}">UPDATE</a>`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathName === '/create') {
        fs.readdir('./data', function(err, filelist) {
            var title = 'Welcome';
            var description = 'Hello, Node.js!';
            var list = templateList(filelist);
            var template = templateHTML(title, list,
                `<form action="/create_process" method="post">
                <p> <input type="text" name="title" placeholder="제목을 입력하세요"> </p>
                <p>
                    <textarea name="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>`, '');
            response.writeHead(200);
            response.end(template);
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
            var title = post.title;
            var description = post.description;

            fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            })
        });

    } else if (pathName === '/update') {
        fs.readdir('./data', function(err, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, data) {
                var title = queryData.id;
                var description = data;
                var list = templateList(filelist);
                var template = templateHTML(title, list,
                    //hidden 타입을 통해, 어떤 문서를 수정해야할지 구분하기위해 원래 title 값을 저장
                    `<form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}>"
                        <p> <input type="text" name="title" placeholder="title" value="${title}"> </p>
                        <p>
                            <textarea name="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>`, `'${title}' 문서 수정하기`);
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathName === '/update_process') {
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
            var id = post.id;
            var title = post.title;
            var description = post.description;
            //${id} 라는 파일을 ${title} 이라는 파일로 이름을 변경
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                });
            });
        });


    } else {
        response.writeHead(400);
        response.end('404 not found');
    }
});
app.listen(3000);