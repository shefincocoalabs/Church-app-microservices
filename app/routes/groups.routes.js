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
    app.get('/groups/memberslist', auth, groupsValidator.validator('list-members'), groups.membersList);
    app.get('/groups/:id/detail', auth, groups.groupDetail);
    app.get('/groups/:id/all-members', auth, groups.allMembers);
    app.post('/groups/create', auth ,groupImageUpload.single('image'), groupsValidator.validator('createGroup'), groups.create);
    app.patch('/groups/:id/append-members', auth,groupsValidator.validator('append-members'), groups.appendMembers);
    app.patch('/groups/:id/remove-member', auth, groupsValidator.validator('remove-member'), groups.removeMember);
};