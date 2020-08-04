const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const charities = require('../controllers/charities.controller');
    app.get('/charities/list',auth, charities.list);
    app.get('/charities/:id/detail',auth, charities.detail);
};