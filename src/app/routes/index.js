'use strict';

var path = process.cwd();

var host = process.env.SERVER_URL;

module.exports = function (app, passport) {

	app.route('/')
		.get( function (req, res) {
			res.sendFile(path + '/src/public/index.html');
		});
		
		
	//microtime service
	app.route('/api-1')
		.get( function (req, res) {
			res.sendFile(path + '/src/public/api-1.html');
		});
	app.route('/api-1/:date')
		.get(function(req, res){
		    
		    var d = req.params.date;
		    if(d) {
		        var moment = require('moment');
		        if(d == parseInt(d)){
		            var date = moment(d,'X');
	            } else {
	                var date = moment(d,'MMMM D, YYYY');
	            }
		        res.json({
		            'unix':date.format('X'),
		            'natural':date.format('MMMM D, YYYY')
		        });
		    } else {
		        res.end('null');
		    }
		})
		
	//whoami service
	app.route('/api-2')
		.get( function (req, res) {
		    
		    
		    
		    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		    var lang =  req.headers['accept-language'].split(',').shift();
		    if(!lang){
		        lang = 'en-US';
		    }
		    
			res.json({
			    'ipaddress':ip,
			    'language':lang,
			    'software':req.useragent.os
			    
			});
		});
		
	//URL Shortener
	var Link = require("../models/link.js");
	
	app.route('/api-3')
		.get( function (req, res) {
			res.sendFile(path + '/src/public/api-3.html');
		});
		
	app.route('/api-3/new/*')
		.get(function(req, res) {
		
		var url = req.url.replace('/api-3/new/','');
		Link.findOne({'url':url})
		.exec(function(err, link){
			
			if(err) throw err;
			
			if(!link){
				link = new Link();
				link.url = url;
				Link.count(function(err,c){
					
					if(err) throw err;
					
					link.short = c;
					link.save();
					handleLink(res, link);
				})
				 
			} else {
				handleLink(res, link);
			}
			
		})
		
		
	});
	
	app.route('/api-3/:id')
		.get(function(req, res){
		    
		    var id = req.params.id;
		    Link.findOne({'short':id})
		    .exec(function(err, link) {
		        
		        if(err) throw err;
		        
		        if(link){
		        	res.redirect(link.url);
		        } else {
		        	res.end('unknown link');
		        }
		    });
		    
		});
};

function handleLink(res, link){
	
	res.json({
		'original_url':link.url,
		'short_url':host+'api-3/'+link.short
	})
}