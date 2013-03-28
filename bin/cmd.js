#!/usr/bin/env node

var shoe = require('shoe');
var http = require('http');
var shux = require('shux')();
var spawn = require('child_process').spawn;
var argv = require('optimist').argv;
var os = require('os');
var path = require('path');
var fs = require('fs');
var through = require('through');
var duplexer = require('duplexer');

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

if (argv.viewer && argv.app === undefined) argv.app = true;
if (argv.port && argv.app === undefined) argv.app = false;
if (argv.viewer && !argv.address) {
    argv.address = '0.0.0.0';
}

var ecstatic = require('ecstatic')(__dirname + '/../static');
var server = http.createServer(function (req, res) {
    if (req.url === '/shell') {
        req.pipe(getShell()).pipe(res);
    }
    else ecstatic(req, res)
});
server.listen(argv.port || 0, argv.address || '127.0.0.1');

function getShell () {
    var hasShells = Object.keys(shux.shells).length > 0;
    if (argv.viewer && viewShell) {
        return duplexer(through(), viewShell);
    }
    else if (!argv.port && hasShells) {
        var tr = through();
        process.nextTick(function () {
            tr.end('shell already opened');
        });
        return tr;
    }
    else if (argv.viewer) {
        viewShell = shux.createShell();
        return viewShell;
    }
    else return shux.createShell();
}

var sock = shoe(function (stream) {
    var sh = getShell();
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

var ps, viewShell;
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
