const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const ngos = require('../controllers/ngos.controller');
    app.get('/ngos/details',auth, ngos.details);
};