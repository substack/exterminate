var through = require('through');
var Terminal = require('./vendor/term.js');
var charSize = require('char-size');

module.exports = function (cols, rows, handler) {
    var term = Terminal(cols, rows, handler);
    term.open();
    
    var tr = through(function (buf) { term.write(buf) });
    term.on('key', function (key) { tr.queue(key) });
    
    var target = null;
    tr.appendTo = function (t) {
        if (typeof t === 'string') {
            t = document.querySelector(t);
        }
        target = t;
        t.appendChild(term.element);
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
        
        var size = charSize(target);
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
    
    return tr;
};
