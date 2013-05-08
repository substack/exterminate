#!/usr/bin/env node

var shoe = require('shoe');
var http = require('http');
var shux = require('shux')();
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');

var through = require('through');
var duplexer = require('duplexer');
var hyperquest = require('hyperquest');

var argv = require('optimist').argv;

if (argv._[0] === 'show') {
    var args = [ __dirname + '/show.js' ].concat(process.argv.slice(3));
    return spawn(process.execPath, args, { stdio: 'inherit' });
}

if (argv.h || argv.help || argv._[0] === 'help') {
    return fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
}

require('../')(argv).listen(argv.port || 0, argv.address || '127.0.0.1');
