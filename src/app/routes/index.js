'use strict';

var path = process.cwd();

var host = process.env.SERVER_URL;
var apiKey = process.env.GOOGLE_SEARCH_KEY;

var https = require("https");

module.exports = function(app, passport) {

	app.route('/')
		.get(function(req, res) {
			res.sendFile(path + '/src/public/index.html');
		});


	//microtime service
	app.route('/api-1')
		.get(function(req, res) {
			res.sendFile(path + '/src/public/api-1.html');
		});
	app.route('/api-1/:date')
		.get(function(req, res) {

			var d = req.params.date;
			if (d) {
				var moment = require('moment');
				if (d == parseInt(d)) {
					var date = moment(d, 'X');
				}
				else {
					var date = moment(d, 'MMMM D, YYYY');
				}
				res.json({
					'unix': date.format('X'),
					'natural': date.format('MMMM D, YYYY')
				});
			}
			else {
				res.end('null');
			}
		})

	//whoami service
	app.route('/api-2')
		.get(function(req, res) {



			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			var lang = req.headers['accept-language'].split(',').shift();
			if (!lang) {
				lang = 'en-US';
			}

			res.json({
				'ipaddress': ip,
				'language': lang,
				'software': req.useragent.os

			});
		});

	//URL Shortener
	var Link = require("../models/link.js");
	app.route('/api-3')
		.get(function(req, res) {
			res.sendFile(path + '/src/public/api-3.html');
		});

	app.route('/api-3/new/*')
		.get(function(req, res) {

			var url = req.url.replace('/api-3/new/', '');
			Link.findOne({
					'url': url
				})
				.exec(function(err, link) {

					if (err) throw err;

					if (!link) {
						link = new Link();
						link.url = url;
						Link.count(function(err, c) {

							if (err) throw err;

							link.short = c;
							link.save();
							handleLink(res, link);
						})

					}
					else {
						handleLink(res, link);
					}

				})


		});

	app.route('/api-3/:id')
		.get(function(req, res) {

			var id = req.params.id;
			Link.findOne({
					'short': id
				})
				.exec(function(err, link) {

					if (err) throw err;

					if (link) {
						res.redirect(link.url);
					}
					else {
						res.end('unknown link');
					}
				});

		});


	//search layer
	var RecentRequest = require("../models/recent-request.js");
	app.route('/api-4/recent')
	.get(function(req, res) {
		
		RecentRequest.find({}, function (err, requests) {
			if(err) throw err;
			
			while(requests.length > 30){
				requests.pop().delete();
			}
			var ret =[];
			
			requests.forEach(function(r){
				ret.push({
					'request':r.q,
					'time':r.time.toString()
				})
			})
			
			res.json(ret);
		});
		
	})
	app.route('/api-4/')
		.get(function(req, res) {
		


			var q = req.query.q;
			var start = parseInt(req.query.start);
			if(!start){
				start='';
			} else {
				start = '&start=' + (start * 10);
			}


			if (q) {
				//find books by google API
				
				new RecentRequest({'q':q}).save();
				
				var options = {
					hostname: 'www.googleapis.com',
					port: 443,
					path: '/customsearch/v1?q=' + encodeURIComponent(q) + start+'&count=10&cx=008556373124519553628%3Ab3-4vgdf2ag&searchType=image&key=' + apiKey + '&fields=items/title,items/link,items/image/thumbnailLink,items/image/contextLink',

					method: 'GET'
				};
				var reqs = https.request(options, function(r) {

					var data = '';

					r.on('data', function(d) {
						data += d;
					});

					r.on('end', function() {
						var ret = [];
						data = JSON.parse(data);
						var ret =[];
						if (data.items) {
							data.items.forEach(function(b) {
								ret.push({
									'url': b.link,
									'snippet':b.title,
									'thumbnail':b.image.thumbnailLink,
									'context':b.image.contextLink 
									
									
								})
							});
							
							res.json(ret);
							
						}
						res.end();
					});
					
				
				});
				
				reqs.end();
				reqs.on('error', function(e) {
				  throw e;
				});		
				
			} else {
				res.sendFile(path + '/src/public/api-4.html');
			}










		});
		
		
	//file analyzer
	var multer = require('multer');
	var uploading = multer({
	  dest: path + '/public/uploads/',
	})

	app.route('/api-5')
		.get(function(req, res) {
			res.sendFile(path + '/src/public/api-5.html');
		})
		.post(uploading.single('thefile'), function(req, res){
			res.end('<body style="font-family:Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif;">File <b>'+req.file.originalname+'</b><br>has size: <b>' + req.file.size +'</b> bytes.</body>');
			
		})
		
}

function handleLink(res, link) {

	res.json({
		'original_url': link.url,
		'short_url': host + 'api-3/' + link.short
	})
}
