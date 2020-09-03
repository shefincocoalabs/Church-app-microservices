var Matrimony = require('../models/matrimony.model');
var OutgoingRequest = require('../models/outgoingRequests.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var matrimonyConfig = config.matrimony;

// *** Create Profile ***
exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var file = req.file;
    var params = req.body;
    if (!params.name || !params.gender || !params.age || !params.height ||
        !params.weight || !params.education || !params.profession ||
        !params.address || !params.nativePlace || !params.workPlace ||
        !params.preferredgroomOrBrideAge || !params.preferredgroomOrBrideHeight ||
        !params.description || !params.phone || !file) {
        var errors = [];
        if (!params.name) {
            errors.push({
                'field': 'name',
                'message': 'name required',
            })
        }
        if (!params.gender) {
            errors.push({
                'field': 'gender',
                'message': 'gender required',
            })
        }
        if (!params.age) {
            errors.push({
                'field': 'age',
                'message': 'age required',
            })
        }
        if (!params.height) {
            errors.push({
                'field': 'height',
                'message': 'height required',
            })
        }
        if (!params.weight) {
            errors.push({
                'field': 'weight',
                'message': 'weight required',
            })
        }
        if (!params.education) {
            errors.push({
                'field': 'education',
                'message': 'education required',
            })
        }
        if (!params.profession) {
            errors.push({
                'field': 'profession',
                'message': 'profession required',
            })
        }
        if (!params.address) {
            errors.push({
                'field': 'address',
                'message': 'address required',
            })
        }
        if (!params.nativePlace) {
            errors.push({
                'field': 'nativePlace',
                'message': 'nativePlace required',
            })
        }
        if (!params.workPlace) {
            errors.push({
                'field': 'workPlace',
                'message': 'workPlace required',
            })
        }
        if (!params.preferredgroomOrBrideAge) {
            errors.push({
                'field': 'preferredgroomOrBrideAge',
                'message': 'preferredgroomOrBrideAge required',
            })
        }
        if (!params.preferredgroomOrBrideHeight) {
            errors.push({
                'field': 'preferredgroomOrBrideHeight',
                'message': 'preferredgroomOrBrideHeight required',
            })
        }
        if (!params.description) {
            errors.push({
                'field': 'description',
                'message': 'description required',
            })
        }
        if (!params.phone) {
            errors.push({
                'field': 'phone',
                'message': 'phone required',
            })
        }
        if (!file) {
            errors.push({
                'field': 'image',
                'message': 'image required',
            })
        }
        return res.send({
            success: 0,
            errors
        })
    }
    var name = params.name;
    var gender = params.gender;
    var age = params.age;
    var height = params.height;
    var weight = params.weight;
    var education = params.education;
    var profession = params.profession;
    var address = params.address;
    var nativePlace = params.nativePlace;
    var workPlace = params.workPlace;
    var preferredgroomOrBrideAge = params.preferredgroomOrBrideAge;
    var preferredgroomOrBrideHeight = params.preferredgroomOrBrideHeight;
    var description = params.description;
    var phone = params.phone;
    try {
        var checkAccount = await Matrimony.findOne({
            createdBy: userId,
            status: 1
        });
        if (checkAccount) {
            return res.status(200).send({
                success: 0,
                message: 'You have already an account'
            })
        }
        const newMatrimony = new Matrimony({
            name: name,
            gender: gender,
            age: age,
            image: file.filename,
            height: height,
            weight: weight,
            education: education,
            profession: profession,
            address: address,
            nativePlace: nativePlace,
            workPlace: workPlace,
            preferredgroomOrBrideAge: preferredgroomOrBrideAge,
            preferredgroomOrBrideHeight: preferredgroomOrBrideHeight,
            description: description,
            phone: phone,
            createdBy: userId,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });
        var saveMatrimony = await newMatrimony.save();
        res.status(200).send({
            success: 1,
            id: newMatrimony._id,
            message: 'Data saved successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Get profile details ***
exports.getProfile = async (req, res) => {
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
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
            _id: id,
            status: 1
        };
        var projection = {
            name: 1,
            gender: 1,
            age: 1,
            height: 1,
            weight: 1,
            education: 1,
            profession: 1,
            address: 1,
            nativePlace: 1,
            workPlace: 1,
            image: 1,
            description: 1,
            subImages: 1,
            preferredgroomOrBrideAge: 1,
            preferredgroomOrBrideHeight: 1,
            phone: 1
        };
        var profileData = await Matrimony.findOne(filter, projection);
        res.status(200).send({
            success: 1,
            imageBase: matrimonyConfig.imageBase,
            item: profileData
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Edit Profile ***
exports.editProfile = async (req, res) => {
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
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
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.body;
    var name = params.name;
    var gender = params.gender;
    var age = params.age;
    var height = params.height;
    var weight = params.weight;
    var education = params.education;
    var profession = params.profession;
    var address = params.address;
    var nativePlace = params.nativePlace;
    var workPlace = params.workPlace;
    var preferredgroomOrBrideAge = params.preferredgroomOrBrideAge;
    var preferredgroomOrBrideHeight = params.preferredgroomOrBrideHeight;
    var description = params.description;
    var phone = params.phone;
    var file = req.file;
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({
                success: 0,
                message: 'Nothing to update'
            })
        }
        var update = {};
        if (file) {
            update.image = file.filename;
        }
        if (name) {
            update.name = name;
        }
        if (gender) {
            update.gender = gender;
        }
        if (age) {
            update.age = age;
        }
        if (height) {
            update.height = height;
        }
        if (weight) {
            update.weight = weight;
        }
        if (education) {
            update.education = education;
        }
        if (profession) {
            update.profession = profession;
        }
        if (address) {
            update.address = address;
        }
        if (nativePlace) {
            update.nativePlace = nativePlace;
        }
        if (workPlace) {
            update.workPlace = workPlace;
        }
        if (preferredgroomOrBrideAge) {
            update.preferredgroomOrBrideAge = preferredgroomOrBrideAge;
        }
        if (preferredgroomOrBrideHeight) {
            update.preferredgroomOrBrideHeight = preferredgroomOrBrideHeight;
        }
        if (description) {
            update.description = description;
        }
        if (phone) {
            update.phone = phone;
        }
        update.tsModifiedAt = Date.now();
        var filter = {
            _id: id,
            createdBy: userId,
            status: 1
        };
        var updateProfile = await Matrimony.updateOne(filter, update, {
            new: true,
            useFindAndModify: false
        });
        res.status(200).send({
            success: 1,
            message: 'Profile data updated successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Get Matches List ***
exports.getMatches = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var matrimonyId = params.matrimonyId;
    try {
        var findGender = await Matrimony.findOne({
            _id: matrimonyId,
            status: 1
        });
        if (!findGender) {
            return res.status(200).send({
                success: 0,
                message: 'Matrimony profile not found'
            })
        }
        var gender = findGender.gender;
        console.log(gender);
        if (gender == 'Female') {
            gender = 'Male'
        } else {
            gender = 'Female'
        }
        var findSentRequests = await OutgoingRequest.find({
            $or: [{
                    userMatrimonyId: matrimonyId,
                },
                {
                    senderMatrimonyId: matrimonyId,
                }
            ],
            status: 1
        }, {
            senderMatrimonyId: 1,
            userMatrimonyId: 1
        });
        console.log(findSentRequests);
        var texts = await findSentRequests.map(function (el) {
            return [el.senderMatrimonyId, el.userMatrimonyId];
        });
        console.log(texts[0]);
        var filter = {
            _id: {
                $nin: texts[0]
            },
            gender: gender,
            status: 1
        };
        console.log(filter);
        var projection = {
            name: 1,
            image: 1,
            subImages: 1,
            profession: 1,
            workPlace: 1,
            age: 1,
            height: 1,
            nativePlace: 1
        };
        var matchesList = await Matrimony.find(filter, projection, pageParams)
            .limit(perPage)
            .sort({
                'tsCreatedAt': -1
            });
        var itemsCount = await Matrimony.countDocuments(filter);
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
            imageBase: matrimonyConfig.imageBase,
            pagination: pagination,
            items: matchesList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Send request ***
exports.sendRequest = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var userMatrimonyId = req.body.userMatrimonyId;
    var senderMatrimonyId = req.body.senderMatrimonyId;
    try {
        const newRequestSent = new OutgoingRequest({
            userId: userId,
            userMatrimonyId: userMatrimonyId,
            senderMatrimonyId: senderMatrimonyId,
            isAccepted: false,
            isRejected: false,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });
        var saveNewRequestSent = await newRequestSent.save();
        res.status(200).send({
            success: 1,
            message: 'Your interest has been sent successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** My Received Requests ***
exports.myRequests = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var matrimonyId = params.matrimonyId;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    if (!matrimonyId) {
        return res.status(400).send({
            success: 0,
            message: 'matrimonyId is required'
        })
    }
    try {
        var filter = {
            senderMatrimonyId: matrimonyId,
            status: 1
        };
        var projection = {
            matrimonyId: 1,
            isAccepted: 1,
            isRejected: 1
        };
        var myRequestsList = await OutgoingRequest.find(filter, projection, pageParams).populate({
            path: 'userMatrimonyId',
            select: 'name address profession age image height nativePlace workPlace'
        }).limit(perPage);
        var itemsArray = [];
        for (var i = 0; i < myRequestsList.length; i++) {
            var itemObj = {};
            itemObj.id = myRequestsList[i].userMatrimonyId.id;
            itemObj.name = myRequestsList[i].userMatrimonyId.name;
            itemObj.age = myRequestsList[i].userMatrimonyId.age;
            itemObj.addres = myRequestsList[i].userMatrimonyId.address;
            itemObj.image = myRequestsList[i].userMatrimonyId.image;
            itemObj.height = myRequestsList[i].userMatrimonyId.height;
            itemObj.profession = myRequestsList[i].userMatrimonyId.profession;
            itemObj.nativePlace = myRequestsList[i].userMatrimonyId.nativePlace;
            itemObj.workPlace = myRequestsList[i].userMatrimonyId.workPlace;
            itemObj.isAccepted = myRequestsList[i].isAccepted;
            itemObj.isRejected = myRequestsList[i].isRejected;
            itemsArray.push(itemObj)
        };
        var itemsCount = await OutgoingRequest.countDocuments(filter);
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
            imageBase: matrimonyConfig.imageBase,
            pagination: pagination,
            items: itemsArray
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** My send Requests ***
exports.sentRequestsList = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var matrimonyId = params.matrimonyId;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || matrimonyConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : matrimonyConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    if (!matrimonyId) {
        return res.status(400).send({
            success: 0,
            message: 'matrimonyId is required'
        })
    }
    try {
        var filter = {
            userMatrimonyId: matrimonyId,
            status: 1
        };
        var projection = {
            matrimonyId: 1,
            isAccepted: 1,
            isRejected: 1
        };
        var myRequestsList = await OutgoingRequest.find(filter, projection, pageParams).populate({
            path: 'senderMatrimonyId',
            select: 'name address profession age image height nativePlace workPlace'
        }).limit(perPage);
        var itemsArray = [];
        for (var i = 0; i < myRequestsList.length; i++) {
            var itemObj = {};
            itemObj.id = myRequestsList[i].senderMatrimonyId.id;
            itemObj.name = myRequestsList[i].senderMatrimonyId.name;
            itemObj.age = myRequestsList[i].senderMatrimonyId.age;
            itemObj.address = myRequestsList[i].senderMatrimonyId.address;
            itemObj.image = myRequestsList[i].senderMatrimonyId.image;
            itemObj.height = myRequestsList[i].senderMatrimonyId.height;
            itemObj.profession = myRequestsList[i].senderMatrimonyId.profession;
            itemObj.nativePlace = myRequestsList[i].senderMatrimonyId.nativePlace;
            itemObj.workPlace = myRequestsList[i].senderMatrimonyId.workPlace;
            itemObj.isAccepted = myRequestsList[i].isAccepted;
            itemObj.isRejected = myRequestsList[i].isRejected;
            itemsArray.push(itemObj)
        };
        var itemsCount = await OutgoingRequest.countDocuments(filter);
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
            imageBase: matrimonyConfig.imageBase,
            pagination: pagination,
            items: itemsArray
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Accept Request ***
exports.acceptRequest = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var userMatrimonyId = req.body.userMatrimonyId;
    var senderMatrimonyId = req.body.senderMatrimonyId;
    try {
        var updateSendRequest = await OutgoingRequest.update({
            userMatrimonyId: senderMatrimonyId,
            senderMatrimonyId: userMatrimonyId,
            status: 1
        }, {
            isAccepted: true
        }, {
            new: true,
            useFindAndModify: false
        });
        res.status(200).send({
            success: 1,
            message: 'Request accepted successfully'
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Ignore Request ***
exports.ignoreRequest = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var userMatrimonyId = req.body.userMatrimonyId;
    var senderMatrimonyId = req.body.senderMatrimonyId;
    try {
        var updateSendRequest = await OutgoingRequest.update({
            userMatrimonyId: senderMatrimonyId,
            senderMatrimonyId: userMatrimonyId,
            status: 1
        }, {
            isRejected: true
        }, {
            new: true,
            useFindAndModify: false
        });
        res.status(200).send({
            success: 1,
            message: 'Request ignored successfully'
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}


exports.appendImages = async (req, res) => {
    var matrimonyId = req.params.id;
    var files = req.files;
    if (files == undefined) {
        return res.status(400).send({
            success: 0,
            message: 'array of subImages required'
        })
    }
    try {
        var filter = {
            _id: matrimonyId,
            status: 1
        };
        var promiseArray = [];
        for (var i = 0; i < files.length; i++) {
            promiseArray.push(files[i]);
            var update = {
                $push: {
                    subImages: files[i].filename
                }
            }
            var updateSubImages = await Matrimony.updateOne(filter, update);
        }
        Promise.all(promiseArray).then(result => {
            res.status(200).send({
                success: 1,
                message: 'Added successfully'
            })
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }

}

exports.removeImage = async (req, res) => {
    var matrimonyId = req.params.id;
    var image = req.body.image;
    try {
        var filter = {
            _id: matrimonyId,
            status: 1
        };
        var update = {
            $pullAll: {
                subImages: [image]
            }
        };
        var rempveImage = await Matrimony.updateOne(filter, update);
        res.status(200).send({
            success: 1,
            message: 'image removed successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.myRequestsDetail = async (req, res) => {
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
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
            userMatrimonyId: id,
            status: 1
        };
        var myRequestsDetail = await OutgoingRequest.findOne(filter).populate({
            path: 'userMatrimonyId',
            select: 'name gender phone education address profession age image subImages height weight nativePlace workPlace preferredgroomOrBrideAge preferredgroomOrBrideHeight description'
        });
        var itemObj = {};
        itemObj.id = myRequestsDetail.userMatrimonyId.id;
        itemObj.name = myRequestsDetail.userMatrimonyId.name;
        itemObj.gender = myRequestsDetail.userMatrimonyId.gender;
        itemObj.phone = myRequestsDetail.userMatrimonyId.phone;
        itemObj.age = myRequestsDetail.userMatrimonyId.age;
        itemObj.education = myRequestsDetail.userMatrimonyId.education;
        itemObj.address = myRequestsDetail.userMatrimonyId.address;
        itemObj.image = myRequestsDetail.userMatrimonyId.image;
        itemObj.subImages = myRequestsDetail.userMatrimonyId.subImages;
        itemObj.height = myRequestsDetail.userMatrimonyId.height;
        itemObj.weight = myRequestsDetail.userMatrimonyId.weight;
        itemObj.profession = myRequestsDetail.userMatrimonyId.profession;
        itemObj.nativePlace = myRequestsDetail.userMatrimonyId.nativePlace;
        itemObj.workPlace = myRequestsDetail.userMatrimonyId.workPlace;
        itemObj.preferredgroomOrBrideAge = myRequestsDetail.userMatrimonyId.preferredgroomOrBrideAge;
        itemObj.preferredgroomOrBrideHeight = myRequestsDetail.userMatrimonyId.preferredgroomOrBrideHeight;
        itemObj.description = myRequestsDetail.userMatrimonyId.description;
        itemObj.isAccepted = myRequestsDetail.isAccepted;
        itemObj.isRejected = myRequestsDetail.isRejected;
        res.status(200).send({
            success: 1,
            imageBase: matrimonyConfig.imageBase,
            item: itemObj
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.sentRequestDetail = async (req, res) => {
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
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
            senderMatrimonyId: id,
            status: 1
        };
        var myRequestsDetail = await OutgoingRequest.findOne(filter).populate({
            path: 'senderMatrimonyId',
            select: 'name gender phone education address profession age image subImages height weight nativePlace workPlace preferredgroomOrBrideAge preferredgroomOrBrideHeight description'
        });
        var itemObj = {};
        itemObj.id = myRequestsDetail.senderMatrimonyId.id;
        itemObj.name = myRequestsDetail.senderMatrimonyId.name;
        itemObj.phone = myRequestsDetail.senderMatrimonyId.phone;
        itemObj.gender = myRequestsDetail.senderMatrimonyId.gender;
        itemObj.age = myRequestsDetail.senderMatrimonyId.age;
        itemObj.education = myRequestsDetail.senderMatrimonyId.education;
        itemObj.address = myRequestsDetail.senderMatrimonyId.address;
        itemObj.image = myRequestsDetail.senderMatrimonyId.image;
        itemObj.subImages = myRequestsDetail.senderMatrimonyId.subImages;
        itemObj.height = myRequestsDetail.senderMatrimonyId.height;
        itemObj.weight = myRequestsDetail.senderMatrimonyId.weight;
        itemObj.profession = myRequestsDetail.senderMatrimonyId.profession;
        itemObj.nativePlace = myRequestsDetail.senderMatrimonyId.nativePlace;
        itemObj.workPlace = myRequestsDetail.senderMatrimonyId.workPlace;
        itemObj.preferredgroomOrBrideAge = myRequestsDetail.senderMatrimonyId.preferredgroomOrBrideAge;
        itemObj.preferredgroomOrBrideHeight = myRequestsDetail.senderMatrimonyId.preferredgroomOrBrideHeight;
        itemObj.description = myRequestsDetail.senderMatrimonyId.description;
        itemObj.isAccepted = myRequestsDetail.isAccepted;
        itemObj.isRejected = myRequestsDetail.isRejected;
        res.status(200).send({
            success: 1,
            imageBase: matrimonyConfig.imageBase,
            item: itemObj
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.matchesDetail = async (req, res) => {
    var id = req.params.id;
    var isValidId = ObjectId.isValid(id);
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
            _id: id,
            status: 1
        };
        var projection = {
            name: 1,
            age: 1,
            phone: 1,
            gender: 1,
            image: 1,
            subImages: 1,
            height: 1,
            weight: 1,
            education: 1,
            profession: 1,
            address: 1,
            nativePlace: 1,
            workPlace: 1,
            preferredgroomOrBrideAge: 1,
            preferredgroomOrBrideHeight: 1,
            description: 1,
        };
        var matchesDetail = await Matrimony.findOne(filter, projection);
        res.status(200).send({
            success: 1,
            imageBase: matrimonyConfig.imageBase,
            item: matchesDetail
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}