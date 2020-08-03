var server = require('./server.js'); 
var routes = ['groups'];
var serviceName = "groups";
server.start(serviceName, routes);