const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/masters/church/list', masters.churchList);
    app.get('/masters/:id/parish/list', masters.parishList);
    app.get('/masters/:id/parish-ward/list', masters.parishWardList);
    app.get('/masters/payment-gatway/key',auth, masters.getKey);
};