var shoe = require('shoe');
var term = require('../')(80, 25);

var stream = shoe('/sock');
stream.on('end', function () {
    window.close();
});
term.pipe(stream).pipe(term);
term.appendTo(document.body);
term.listenTo(document);

function resize () {
    term.resize(window.innerWidth - 5, window.innerHeight - 2);
}
resize();
window.addEventListener('resize', resize);
