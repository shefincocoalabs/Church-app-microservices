var Group = require('../models/group.model');
var User = require('../models/user.model');
var UserRole = require('../models/userRole.model');
var GroupMessage = require('../models/groupMessage.model');
var config = require('../../config/app.config.js');
var ObjectId = require('mongoose').Types.ObjectId;
var groupConfig = config.groups;
var usersConfig = config.users;
var constant = require('../helpers/constants');
var subAdminType = constant.SUB_ADMIN_USER;

// *** Create Group ***
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
    var members = req.body.members;

    try {
        if (!Array.isArray(members)) {
            return res.status(400).send({
                success: 0,
                message: 'members param should be an array of memberIds'
            })
        }
        const newGroup = new Group({
            name: name,
            image: fileName,
            members: members,
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

// *** List group ***
exports.list = async (req, res) => {
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
            $or: [{
                createdBy: userId
            },
            {
                members: {
                    $in: userId
                }
            }
            ],
            status: 1
        };
        var projection = {
            name: 1,
            image: 1,
            tsCreatedAt: 1
        };
        var groupsList = await Group.find(filter, projection, pageParams).populate({
            path: 'createdBy',
            select: 'name'
        }).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Group.countDocuments(filter);
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
            imageBase: groupConfig.imageBase,
            pagination: pagination,
            items: groupsList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Members list ***
exports.membersList = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var groupId = params.groupId;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || groupConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : groupConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var findCriteria;
    try {
        var filter = {
            name: subAdminType,
            status: 1
        };
        var findUserRole = await UserRole.findOne(filter);
        var roleId = findUserRole._id;
        if (groupId != '') {
            var findGroup = await Group.findOne({
                _id: groupId,
                status: 1
            });
            if (!findGroup) {
                return res.status(200).send({
                    success: 0,
                    message: 'Group not found'
                })
            }
            var groupMembers = findGroup.members;
            findCriteria = {
                $and: [{
                    _id: {
                        $ne: userId
                    }
                }, {
                    _id: {
                        $nin: groupMembers
                    }
                }, {
                    roles: {
                        $nin: [roleId]
                    }
                }]
            };
        } else {
            findCriteria = {
                $and: [{
                    _id: {
                        $ne: userId
                    }
                }, {
                    roles: {
                        $nin: [roleId]
                    }
                }]
            };
        }

        var projection = {
            name: 1,
            image: 1,
            email: 1
        };
        var listMembers = await User.find(findCriteria, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await User.countDocuments(findCriteria);
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page: page,
            perPage: perPage,
            hasNextPage: hasNextPage,
            totalItems: itemsCount,
            totalPages: totalPages
        };
        res.status(200).send({
            success: 1,
            imageBase: usersConfig.imageBase,
            pagination: pagination,
            items: listMembers
        })
    } catch (err) {
        // res.status(500).send({
        //     success: 0,
        //     message: err.message
        // })
        console.log(err);
    }
}

// *** Group detail ***
exports.groupDetail = async (req, res) => {
    var groupId = req.params.id;
    var isValidId = ObjectId.isValid(groupId);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    }
    try {
        var filter = {
            _id: groupId,
            status: 1
        };
        var groupDetail = await Group.findOne(filter).populate([{
            path: 'createdBy',
            select: 'name'
        }, {
            path: 'members',
            select: 'name email'
        }]).slice('members', 10)
        res.status(200).send({
            success: 1,
            imageBase: groupConfig.imageBase,
            item: groupDetail
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Append members to a group ****
exports.appendMembers = async (req, res) => {
    var members = req.body.members;
    var groupId = req.params.id;
    var isValidId = ObjectId.isValid(groupId);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    }
    if (!Array.isArray(members)) {
        return res.status(400).send({
            success: 0,
            message: 'members param should be an array of memberIds'
        })
    }
    try {
        var filter = {
            _id: groupId,
            status: 1
        };
        var promiseArray = [];
        for (var i = 0; i < members.length; i++) {
            promiseArray.push(members[i]);
            var appendMembers = await Group.updateOne(filter, {
                $push: {
                    members: members[i]
                }
            })
        }
        Promise.all(promiseArray).then(result => {
            res.status(200).send({
                success: 1,
                message: 'Members added successfully'
            })
        })

    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Remove member from group ***
exports.removeMember = async (req, res) => {
    var groupId = req.params.id;
    var memberId = req.body.memberId;
    var isValidId = ObjectId.isValid(groupId);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    }
    try {
        var filter = {
            _id: groupId,
            status: 1
        };
        var removeMember = await Group.updateOne(filter, {
            $pullAll: {
                members: [memberId]
            }
        });
        res.status(200).send({
            success: 1,
            message: 'Member removed successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** List all members in a group ***
exports.allMembers = async (req, res) => {
    var groupId = req.params.id;
    var isValidId = ObjectId.isValid(groupId);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    }
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || groupConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : groupConfig.resultsPerPage;
    try {
        var filter = {
            _id: groupId,
            status: 1
        };
        var projection = {
            members: 1
        };
        var findGroup = await Group.findOne(filter, projection).populate({
            path: 'members',
            select: 'name image email'
        })
        var members = findGroup.members;
        var itemsCount = members.length;
        members = paginate(members, perPage, page);
        var totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page: page,
            perPage: perPage,
            hasNextPage: hasNextPage,
            totalItems: itemsCount,
            totalPages: totalPages,
        };
        res.status(200).send({
            success: 1,
            imageBase: usersConfig.imageBase,
            pagination: pagination,
            items: members
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.chatsList = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var groupId = req.params.id;
    var groupData = await Group.findOne({
        _id: groupId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting group data',
                error: err
            }
        })
    if (groupData && (groupData.success !== undefined) && (groupData.success === 0)) {
        return res.send(groupData);
    }
    if (groupData) {
        var page = Number(params.page) || 1;
        page = page > 0 ? page : 1;
        var perPage = Number(params.perPage) || groupConfig.resultsPerPage;
        perPage = perPage > 0 ? perPage : groupConfig.resultsPerPage;
        var offset = (page - 1) * perPage;
        var findCriteria = {
            groupId,
            status: 1
        };
        
        var chatList = await GroupMessage.find(findCriteria)
            .limit(perPage)
            .skip(offset)
            .sort({
                'tsCreatedAt': -1
            })

        var totalMessageCount = await GroupMessage.countDocuments(findCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting totalMessageCount',
                    error: err
                }
            })
        if (totalMessageCount && (totalMessageCount.success !== undefined) && (totalMessageCount.success === 0)) {
            return res.send(totalMessageCount);
        }
        var totalPages = totalMessageCount / perPage;
        totalPages = Math.ceil(totalPages);
        var hasNextPage = page < totalPages;
        var pagination = {
            page,
            perPage,
            hasNextPage,
            totalItems: totalMessageCount,
            totalPages
        }
        return res.status(200).send({
            success: 1,
            pagination,
            items: chatList,
            message: 'List group chats'
        })

    } else {
        return res.send({
            success: 0,
            message: 'Invalid group ID'
        })
    }

}


function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
};