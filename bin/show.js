#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var http = require('http');
var VERSION = require('../package.json').version;

var fullpath = process.argv[2];
var file = path.resolve(fullpath.split('?')[0]);
var ecstatic = require('ecstatic')(path.dirname(file));

var server = http.createServer(function (req, res) {
    res.setHeader('exterminate', VERSION);
    ecstatic(req, res);
});
server.listen(0, function () {
    var src = '/http://localhost:'
        + server.address().port
        + '/' + path.basename(file)
        + (/\?/.test(fullpath)
            ? '?' + fullpath.split('?').slice(1).join('?')
            : ''
        )
    ;
    if (/^https?:/.test(fullpath)) src = fullpath;
    
    process.stdout.write(Buffer([ 0x1b, '^'.charCodeAt(0) ]));
    process.stdout.write('<iframe src="' + src + '">');
    process.stdout.write(Buffer([ 0x1b, '\\'.charCodeAt(0) ]));
});

function onexit () {
    process.stdout.write(chars([ 0x1b, '[H', 0x1b, '[2J' ]));
    process.exit();
}
[ 'exit', 'SIGTERM', 'SIGINT', 'SIGHUP' ].forEach(function (ev) {
    process.on(ev, onexit);
});

function chars (xs) {
    return new Buffer(xs.reduce(function (bytes, x) {
        if (typeof x === 'string') {
            for (var i = 0; i < x.length; i++) {
                bytes.push(x.charCodeAt(i));
            }
        }
        else bytes.push(x);
        return bytes;
    }, []));
}
