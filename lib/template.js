module.exports = {
    html: function(title, list, body, control) {
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
    },
    list: function(topics) {
        var list = '<ul>';
        var i = 0;
        while (i < topics.length) {
            //쿼리데이터는 SQL 데이터의 id를 기반으로 한다 (1, 2, 3... 중복 없음)
            list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`
            i++;
        }
        list = list + '</ul>';

        return list;
    },
    authorSelect: function(authors, author_id) {
        var tag = '';
        var i = 0;
        while (i < authors.length) {
            var selected = '';
            if (authors[i].id === author_id) {
                selected = ' selected';
            }
            tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`
            i++;
        }
        return `<select name="author">
                    ${tag}
                </select>`;
    }
}