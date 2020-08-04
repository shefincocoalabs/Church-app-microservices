const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const events = require('../controllers/events.controller');
    app.get('/events/list', auth, events.list);
    app.get('/events/:id/detail', auth, events.detail);
};