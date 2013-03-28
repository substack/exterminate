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
    var src = 'http://localhost:'
        + server.address().port
        + '/' + path.basename(file)
        + (/\?/.test(fullpath)
            ? '?' + fullpath.split('?').slice(1).join('?')
            : ''
        )
    ;
    process.stdout.write(Buffer([ 0x1b, '^'.charCodeAt(0) ]));
    process.stdout.write('<iframe src="/' + src + '">');
    process.stdout.write(Buffer([ 0x1b, '\\'.charCodeAt(0) ]));
});
