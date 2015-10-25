"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var server = express();

server.use(bodyParser.urlencoded({
	extended: true
}));

server.use(bodyParser.json());
server.use(methodOverride());

server.use(express.static(__dirname+"/../dist"));

server.use(require('connect-livereload')({
	port: 35729
}));

// include api
require("./api")(server);

server.listen(8080);

console.log("server api listening to port :8080")

// expose the server
exports = module.exports = server;
