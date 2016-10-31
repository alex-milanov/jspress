"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const server = express();

server.use(bodyParser.urlencoded({
	extended: true
}));

server.use(bodyParser.json());
server.use(methodOverride());

server.use(express.static(path.resolve(__dirname, '../dist')));

// include api
require("./api")(server);

server.listen(8080);

console.log("server api listening to port 8080");

// expose the server
exports = module.exports = server;
