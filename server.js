'use strict';

require('dotenv').load();

var express = require('express');
var routes = require('./src/app/routes/index.js');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);



var app = express();
var useragent = require('express-useragent');
app.use(useragent.express());

routes(app);

var port = process.env.PORT || 8080;

app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});