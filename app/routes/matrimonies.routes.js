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
    // app.post('/matrimonies/create', auth, imageUpload.single('image'), matrimonyValidator.validator('create'), matrimony.create);
    app.post('/matrimonies/create', auth, imageUpload.single('image'),matrimony.create);
    app.get('/matrimonies/:id/get-profile', auth, matrimony.getProfile);
    app.patch('/matrimonies/:id/edit-profile', auth, imageUpload.single('image'), matrimony.editProfile);
    app.get('/matrimonies/matches', auth, matrimonyValidator.validator('getMatches'), matrimony.getMatches);
    app.get('/matrimonies/matches/:id/detail', auth, matrimony.matchesDetail);
    app.post('/matrimonies/send-request', auth, matrimonyValidator.validator('sendRequest'), matrimony.sendRequest);
    app.get('/matrimonies/my-requests', auth, matrimony.myRequests); 
    app.get('/matrimonies/my-requests/:id/detail',auth, matrimony.myRequestsDetail);
    app.get('/matrimonies/sent-requests', auth, matrimony.sentRequestsList);
    app.get('/matrimonies/sent-requests/:id/detail', auth, matrimony.sentRequestDetail);
    app.patch('/matrimonies/request/accept', auth, matrimonyValidator.validator('accept'), matrimony.acceptRequest);
    app.patch('/matrimonies/request/ignore', auth, matrimonyValidator.validator('reject'), matrimony.ignoreRequest);
    app.patch('/matrimonies/:id/append-images', auth,imageUpload.array('images'),matrimony.appendImages);
    app.patch('/matrimonies/:id/remove-image', auth,matrimonyValidator.validator('remove-image'),imageUpload.array('images'),matrimony.removeImage);
};