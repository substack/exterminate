var through = require('through');
var Terminal = require('../vendor/term.js');
var charSize = require('char-size');

module.exports = function (cols, rows, handler) {
    var term = new Terminal(cols, rows, handler);
    term.open();
    
    term.on('pm', function (html) {
        var div = document.createElement('div');
        div.className = 'container';
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
                var e = doc.head || doc.documentElement;
                var styleTag = document.createElement('style');
                
                styleTag.appendChild(document.createTextNode(
                    'body { margin: 0px; color: white; }'
                ));
                e.insertBefore(styleTag, e.childNodes[0]);
                
                var style = window.getComputedStyle(doc.body);
                var ww = parseInt(iframe.contentWindow.innerWidth);
                var wh = parseInt(iframe.contentWindow.innerHeight);
                var wa = ww / wh;
                
                var bw = parseInt(style.height);
                var bh = parseInt(style.width);
                var ba = bw / bh;
                
                if (ww && wh && (bw > ww || bh > wh)) {
                    if (wa > ba) { // limiting: height
                        doc.body.style.zoom = wh / bh;
                    }
                    else { // limiting: width
                        doc.body.style.zoom = ww / bw;
                    }
                }
                
                dy = parseInt(iframe.style.height, 10) - dy;
                term.cursorPos([ term.y + Math.ceil(dy / size.height) + 1, 0 ]);
            };
            iframe.addEventListener('load', onload);
            onload();
        }
        
        term.on('erase', function onerase (w) {
            if (w === 'all') {
                term.element.removeChild(div);
                div.removeChild(iframe);
                term.removeListener('erase', onerase);
            }
        });
    });
    
    var tr = through(function (buf) {
        term.write(buf);
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
    
    tr.terminal = term;
    
    return tr;
};
