'use strict';

const Hapi = require('hapi');
require('dotenv').config(); 

var routes = require('./routes.js');

const server = new Hapi.Server();

server.connection({  
  port: process.env.NODE_APP_PORT,
  routes: { cors: { origin: ['*'], credentials: true} }
});


server.register([
	/*{
		register: CookieXsrfTokenAuthStrategy
	}*/
], function (err) {
	if (err) {
		console.log('error', 'failed to install plugins')

	    throw err
	}

	console.log('Plugins Registered');

	server.route(routes); //register routes

	console.log('Routes Registered');

	server.start(function(err) {  
		if (err) {
			throw err
		}

	  	console.log('Server running at: ', server.info.uri)
	});
});
