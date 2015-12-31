'use strict';

var express = require('express');
var routes = require('./src/app/routes/index.js');

var app = express();

routes(app);
var port = 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});