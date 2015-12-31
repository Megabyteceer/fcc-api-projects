'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Link = new Schema({
       short: {type: Number, index: true },
       url: {type: String, index: true },

});

module.exports = mongoose.model('Link', Link);
