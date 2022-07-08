// server.js
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
var express = require('express');
var http = require('http');
var https = require('https');
var storage = require('node-sessionstorage')

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

var app = express();
var port = process.env.PORT || 4200;
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/]));

var compression = require('compression');
app.use(compression()); //use compression

// Run the app by serving the static files
// in the dist directory
var path = require('path');
var rootPath = path.normalize(__dirname + '/');
app.use("/", express.static(rootPath + '/dist'));
//app.use(gzippo.staticGzip(__dirname + "/dist", { maxAge: 31557600 }))

// ...
// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

//added by me should be tested and if does not work remove
app.get('/*', function (req, res) {
    res.setHeader('Cache-Control', 'dist, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.render('index.html');
});


// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS

// Instruct the app
// to use the forceSSL

// Start the app by listening on the default
// Heroku port


app.listen(port, function (err) {
    console.log('running server on port ' + port);
});
