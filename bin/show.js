#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var http = require('http');
var VERSION = require('../package.json').version;

var file = path.resolve(process.argv[2]);
var ecstatic = require('ecstatic')(path.dirname(file));

var server = http.createServer(function (req, res) {
    res.setHeader('exterminate', VERSION);
    ecstatic(req, res);
});
server.listen(0, function () {
    process.stdout.write(Buffer([ 0x1b, '^'.charCodeAt(0) ]));
    var src = 'http://localhost:'
        + server.address().port
        + '/' + path.basename(file)
    ;
    process.stdout.write('<iframe src="/' + src + '">');
    process.stdout.write(Buffer([ 0x1b, '\\'.charCodeAt(0) ]));
});
