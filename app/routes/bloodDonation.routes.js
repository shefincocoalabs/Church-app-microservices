const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const bloodDonation = require('../controllers/bloodDonation.controller');
    app.get('/bloodDonation/list',auth, bloodDonation.list);
    app.get('/bloodDonation/:id/detail',auth, bloodDonation.detail);
};