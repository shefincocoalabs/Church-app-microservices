var server = require('./server.js'); 
var routes = ['pasters'];
var serviceName = "pasters";
server.start(serviceName, routes);