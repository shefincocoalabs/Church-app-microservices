var Group = require('../models/group.model');
var User = require('../models/user.model');
exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var file = req.file;
    var fileName = file.filename;
    var name = req.body.name;
    var memebers = req.body.memebers;

    try {
        // if (!Array.isArray(memebers)) {
        //     return res.status(400).send({
        //         success: 0,
        //         message: 'members param should be an array of memberIds'
        //     })
        // }
        const newGroup = new Group({
            name: name,
            image: fileName,
            memebers: memebers,
            createdBy: userId,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });

        var saveGroup = await newGroup.save();
        res.status(200).send({
            success: 1,
            id: saveGroup._id,
            message: 'Group created successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;

    try {
        var filter = {
            createdBy: userId,
            status: 1
        };
        var projection = {
            name: 1,
            image: 1
        };
        var groupsList = await Group.find(filter, projection).populate({
            path: 'createdBy',
            select: 'name'
        })
        res.status(200).send({
            success: 1,
            items: groupsList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}