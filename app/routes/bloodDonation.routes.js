const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const bloodDonation = require('../controllers/bloodDonation.controller');
    app.get('/bloodDonation/list',auth, bloodDonation.list);
};