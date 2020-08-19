const auth = require('../middleware/auth.js');

module.exports = (app) => {
    const livePrayer = require('../controllers/livePrayer.controller');
    app.get('/livePrayer/list', auth, livePrayer.list);
};