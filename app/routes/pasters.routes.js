const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const pasters = require('../controllers//pasters.controller');
    app.get('/pasters/list', auth, pasters.list);
    app.get('/pasters/:id/detail', auth, pasters.detail);
};