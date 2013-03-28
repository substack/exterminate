var through = require('through');
var Terminal = require('../vendor/term.js');
var charSize = require('char-size');

module.exports = function (cols, rows, handler) {
    var term = new Terminal(cols, rows, handler);
    term.open();
    
    term.on('pm', function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        term.element.appendChild(div);
        div.style.position = 'absolute';
        div.style.left = term.x * size.width;
        div.style.top = term.y * size.height + 2;
        
        var iframe = div.querySelector('iframe');
        if (iframe) {
            iframe.style.width = window.innerWidth - 10;
            var dy = 0;
            var onload = function () {
                var doc = iframe.contentDocument;
                doc.body.style.margin = '0';
                if (!doc.body.style.color) doc.body.style.color = 'white';
                
                var style = window.getComputedStyle(doc.body);
                iframe.style.height = parseInt(style.height, 10) + 10;
                dy = parseInt(iframe.style.height, 10) - dy;
                term.cursorPos([ term.y + Math.ceil(dy / size.height) + 1, 0 ]);
                drawCursor();
            };
            iframe.addEventListener('load', onload);
            onload();
        }
        
        term.once('erase', function (w) {
            if (w === 'all') term.element.removeChild(div);
        });
    });
    
    var tr = through(function (buf) {
        term.write(buf);
        drawCursor();
    });
    term.on('key', function (key) { tr.queue(key) });
    
    var target = null, size = null;
    tr.appendTo = function (t) {
        if (typeof t === 'string') {
            t = document.querySelector(t);
        }
        target = t;
        t.appendChild(term.element);
        term.element.style.position = 'relative';
        tr.emit('target', t);
    };
    
    tr.geometry = function (cols, rows) {
        if (cols !== undefined) {
            term.resize(cols, rows);
        }
        return {
            cols: term.cols,
            rows: term.rows
        };
    };
    
    tr.resize = function (width, height) {
        tr.width = width;
        tr.height = height;
        
        if (!target) {
            return tr.once('target', function () {
                tr.resize(width, height);
            });
        }
        
        size = charSize(target);
        tr.emit('size', size);
        return tr.geometry(
            Math.floor(width / size.width),
            Math.floor(height / size.height)
        );
    };
    
    tr.listenTo = function (elem) {
        elem.addEventListener('keydown', function (ev) {
            term.keyDown(ev)
        }, true);
        
        elem.addEventListener('keypress', function (ev) {
            term.keyPress(ev)
        }, true);
    };
    
    var cursor = null;
    function drawCursor () {
        if (!size) return tr.once('size', drawCursor);
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.style.position = 'absolute';
            cursor.style['background-color'] = 'rgba(255,255,255,0.5)';
            term.element.appendChild(cursor);
        }
        cursor.style.width = size.width;
        cursor.style.height = size.height;
        cursor.style.left = term.x * size.width;
        cursor.style.top = term.y * size.height;
    }
    
    return tr;
};
