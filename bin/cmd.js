#!/usr/bin/env node

var shoe = require('shoe');
var http = require('http');
var shux = require('shux')();
var spawn = require('child_process').spawn;
var opts  = require('optimist').argv;

var ecstatic = require('ecstatic')(__dirname + '/../static');
var server = http.createServer(function (req, res) {
    if (req.url === '/shell') {
        req.pipe(shux.createShell()).pipe(res);
    }
    else ecstatic(req, res)
});
server.listen(opts.port || 0, '127.0.0.1');

var sock = shoe(function (stream) {
    stream.pipe(shux.createShell()).pipe(stream);
});
sock.install(server, '/sock');

server.on('listening', function () {
    var port = server.address().port;
    if (opts.app !== false) {
        var appPath = (typeof opts.app == 'string' && opts.app !== '') ? opts.app : 'google-chrome';
        spawn(appPath, [ '--app=http://localhost:' + port ]);
    }
});

