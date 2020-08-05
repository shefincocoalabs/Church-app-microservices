var Group = require('../models/group.model');
var User = require('../models/user.model');
var config = require('../../config/app.config.js');
var groupConfig = config.groups;
var usersConfig = config.users;

exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var file = req.file;
    if (!file) {
        return res.status(400).send({
            success: 0,
            message: 'image is required'
        })
    }
    var fileName = file.filename;
    var name = req.body.name;
    var memebers = req.body.memebers;

    try {
        if (!Array.isArray(memebers)) {
            return res.status(400).send({
                success: 0,
                message: 'members param should be an array of memberIds'
            })
        }
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
            imageBase: groupConfig.imageBase,
            items: groupsList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.membersList = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || groupConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : groupConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    try {
        var filter = {
            status: 1
        };
        var projection = {
            name: 1,
            image: 1,
            email: 1
        };
        var listMembers = await User.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await User.countDocuments(filter);
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page: page,
            perPage: perPage,
            hasNextPage: hasNextPage,
            totalItems: itemsCount,
            totalPages: totalPages
        }
        res.status(200).send({
            success: 1,
            imageBase: usersConfig.imageBase,
            pagination: pagination,
            items: listMembers
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}