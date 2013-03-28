#!/usr/bin/env node

var shoe = require('shoe');
var http = require('http');
var shux = require('shux')();
var spawn = require('child_process').spawn;
var argv = require('optimist').argv;
var os = require('os');
var path = require('path');
var through = require('through');
var duplexer = require('duplexer');
var hyperquest = require('hyperquest');

if (argv._[0] === 'show') {
    var args = [ __dirname + '/show.js' ].concat(process.argv.slice(3));
    return spawn(process.execPath, args, { stdio: 'inherit' });
}

if (argv.viewer && argv.app === undefined) argv.app = true;
if (argv.port && argv.app === undefined) argv.app = false;
if (argv.viewer && !argv.address) {
    argv.address = '0.0.0.0';
}

var ecstatic = require('ecstatic')(__dirname + '/../static');
var server = http.createServer(function (req, res) {
    if (RegExp('^/shell(/|$)').test(req.url)) {
        req.pipe(getShell()).pipe(res);
    }
    else if (RegExp('^/http:').test(req.url)) {
        var href = req.url.slice(1);
        var r = hyperquest(req.url.slice(1));
        r.on('error', function (err) {
            res.statusCode = 500;
            res.end(String(err));
        });
        r.on('response', function (resp) {
            if (!resp.headers.exterminate) {
                res.statusCode = 401;
                res.end('not an exterminate server');
            }
            else {
                res.setHeader('content-type', resp.headers['content-type']);
            }
        });
        r.pipe(res);
    }
    else ecstatic(req, res)
});
server.listen(argv.port || 0, argv.address || '127.0.0.1');

function getShell () {
    var hasShells = Object.keys(shux.shells).length > 0;
    if (argv.viewer && viewShell) {
        return duplexer(through(), shux.attach(viewShell.id));
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
    var args = [ '--app=http://localhost:' + port + '/?' + Math.random() ];
    
    if (os.platform() === 'darwin') {
        var userDataDir = path.join(process.env.HOME, '.exterminate')
        bin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        args.push('--user-data-dir=' + userDataDir);
    }
    
    if (argv.app !== false && argv.app !== 'false') {
        ps = spawn(bin, args);
        ps.stderr.pipe(process.stderr);
    }
});
