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
    app.post('/matrimonies/create', auth, matrimonyValidator.validator('create'), matrimony.create);
    app.get('/matrimonies/:id/get-profile', auth, matrimony.getProfile);
    app.patch('/matrimonies/:id/edit-profile', auth, imageUpload.single('image'), matrimony.editProfile);
    app.get('/matrimonies/matches', auth, matrimony.getMatches);
    app.post('/matrimonies/send-request', auth, matrimony.sendRequest);
    app.get('/matrimonies/my-requests', auth, matrimony.myRequests);
    app.patch('/matrimonies/requeest/accept', auth, matrimony.acceptRequest);
    app.patch('/matrimonies/request/ignore', auth, matrimony.ignoreRequest);
};