const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const sermons = require('../controllers/sermons.controller');
    app.get('/sermons/list', auth, sermons.list);
};