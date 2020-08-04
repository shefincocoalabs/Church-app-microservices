const auth = require('../middleware/auth.js');
const matrimonyValidator = require('../validators/matrimonies-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var matrimonyConfig = config.matrimony;
var storage = multer.diskStorage({
    destination: matrimonyConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var imageUpload = multer({ storage: storage });
module.exports = (app) => {
    const matrimony = require('../controllers/matrimonies.controller');
    app.post('/matrimony/create', auth, matrimonyValidator.validator('create'), matrimony.create);
    app.get('/matrimony/:id/get-profile', auth, matrimony.getProfile);
    app.patch('/matrimony/:id/edit-profile', auth, imageUpload.single('image'), matrimony.editProfile);
};