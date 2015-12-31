'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecentRequest = new Schema({
       q: String,
       time: { type : Date, default: Date.now }

});

module.exports = mongoose.model('RecentRequest', RecentRequest);
