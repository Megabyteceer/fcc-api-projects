'use strict';

var path = process.cwd();

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
		
		

};
