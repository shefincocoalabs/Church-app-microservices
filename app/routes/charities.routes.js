const auth = require('../middleware/auth.js');
const charityValidator = require('../validators/charities-validator');

module.exports = (app) => {
    const charities = require('../controllers/charities.controller');
    app.get('/charities/list',auth, charities.list);
    app.get('/charities/:id/detail',auth, charities.detail);
    app.post('/charities/payments',auth, charityValidator.validator('payments'), charities.payments);
};