var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathName = url.parse(_url, true).pathname;

    if (pathName === '/') {
        fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, data) {
            var description = data;

            var template = `
            <!doctype html>
            <html>
            <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
            </head>
            <body>
            <h1><a href="/">WEB</a></h1>
            <ul>
                <li><a href="/?id=HTML">HTML</a></li>
                <li><a href="/?id=CSS">CSS</a></li>
                <li><a href="/?id=JavaScript">JavaScript</a></li>
            </ul>
            <h2>${title}</h2>
            <p> ${description}</p>
            </body>
            </html>
            `;

            response.writeHead(200);
            response.end(template);
        });
    } else {
        response.writeHead(400);
        response.end('404 not found');
    }

});
app.listen(3000);