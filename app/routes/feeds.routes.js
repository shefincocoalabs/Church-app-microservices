const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var feedConfig = config.feeds;
var storage = multer.diskStorage({
    destination: feedConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var feedFileUpload = multer({ storage: storage });
module.exports = (app) => {
    const feeds = require('../controllers/feeds.controller');
    app.post('/feeds/create', auth ,feedFileUpload.single('image'), feedsValidator.validator('createFeed'), feeds.create);
    app.get('/feeds/list', auth , feeds.list);
};