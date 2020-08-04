const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const masters = require('../controllers/masters.controller');
    app.get('/church/list', masters.churchList);
    app.get('/:id/parish/list', masters.parishList);
    app.get('/:id/parish-ward/list', masters.parishWardList);
};