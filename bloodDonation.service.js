var server = require('./server.js'); 
var routes = ['bloodDonation'];
var serviceName = "bloodDonation";
server.start(serviceName, routes);