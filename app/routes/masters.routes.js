const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/masters/church/list', masters.churchList);
    app.get('/masters/:id/parish/list', masters.parishList);
    app.get('/masters/:id/parish-ward/list', masters.parishWardList);
    app.get('/masters/payment-gateway/key',auth, masters.getKey);

    app.get('/masters/country/list', masters.countryList);
    app.get('/masters/state/:id/list', masters.stateList);
    app.get('/masters/district/:id/list', masters.districtList);
};