const auth = require('../middleware/auth.js');
const urogulfValidator = require('../validators/urogulf-validator');

module.exports = (app) => {
    const urogulf = require('../controllers/urogulf.controller');
    app.get('/urogulf/locations', urogulf.list);
    app.get('/urogulf/locations/:id/near-by', urogulf.nearByLocations);
    app.post('/urogulf/create',auth, urogulfValidator.validator('createMessage'), urogulf.create);
};