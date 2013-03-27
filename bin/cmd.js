#!/usr/bin/env node

var shoe = require('shoe');
var http = require('http');
var shux = require('shux')();
var spawn = require('child_process').spawn;
var argv = require('optimist').argv;
var os = require('os');
var path = require('path');
var fs = require('fs');

if (argv._[0] === 'render') {
    var file = argv._[1];
    var s = fs.createReadStream(file);
    process.stdout.write(Buffer([ 0x1b, '^'.charCodeAt(0) ]));
    s.pipe(process.stdout, { end: false });
    s.on('end', function () {
        process.stdout.write(Buffer([ 0x1b, '\\'.charCodeAt(0) ]));
    });
    return;
}

if (argv.port && argv.app === undefined) argv.app = false;

var ecstatic = require('ecstatic')(__dirname + '/../static');
var server = http.createServer(function (req, res) {
    if (req.url === '/shell') {
        if (!argv.port && Object.keys(shux.shells).length > 0) {
            return res.end('shell already opened');
        }
        req.pipe(shux.createShell()).pipe(res);
    }
    else ecstatic(req, res)
});
server.listen(argv.port || 0, '127.0.0.1');

var sock = shoe(function (stream) {
    if (!argv.port && Object.keys(shux.shells).length > 0) {
        return stream.end('shell already opened');
    }
    var sh = shux.createShell();
    if (ps) {
        stream.on('end', sh.emit.bind(sh, 'end'));
        sh.on('end', function () {
            ps.kill();
            setTimeout(function () { process.exit() }, 100);
        });
    }
    stream.pipe(sh).pipe(stream);
});
sock.install(server, '/sock');

var ps;
server.on('listening', function () {
    var port = server.address().port;
    
    var bin = 'google-chrome';
    var args = [ '--app=http://localhost:' + port ];
    
    if (os.platform() === 'darwin') {
        var userDataDir = path.join(process.env.HOME, '.exterminate')
        bin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        args.push('--user-data-dir=' + userDataDir);
    }
    
    if (argv.app !== false) {
        ps = spawn(bin, args);
        ps.stderr.pipe(process.stderr);
    }
});
