var through = require('through');
var Terminal = require('./vendor/term.js');
var charSize = require('char-size');

module.exports = function (cols, rows, handler) {
    var term = new Terminal(cols, rows, handler);
    term.open();
    
    term.on('pm', function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        target.appendChild(div);
        div.style.position = 'absolute';
        div.style.left = term.x * size.width;
        div.style.top = term.y * size.height + 2;
        var s = window.getComputedStyle(div);
        var h = parseInt(s.height, 10);
        var dy = Math.ceil(h / size.height) + 1;
        term.cursorPos([ term.y + dy, 0 ]);
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
