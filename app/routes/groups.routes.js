const auth = require('../middleware/auth.js');
const groupsValidator = require('../validators/groups-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var groupConfig = config.groups;
var storage = multer.diskStorage({
    destination: groupConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var groupImageUpload = multer({ storage: storage });
module.exports = (app) => {
    const groups = require('../controllers/groups.controller');
    app.get('/groups/list', auth, groups.list);
    app.post('/groups/create', auth ,groupImageUpload.single('image'), groupsValidator.validator('createGroup'), groups.create);
};