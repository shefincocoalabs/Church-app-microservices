var BloodDonation = require('../models/bloodDonation.model');
var Users = require('../models/user.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var userConfig = config.users;
var bloodDonationConfig = config.bloodDonation;

// *** Blood donation list ***
exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || bloodDonationConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : bloodDonationConfig.resultsPerPage;
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
            neededDate: 1,
            bloodGroup: 1,
            place: 1,
            tsCreatedAt: 1
        };
        var bloodDonationList = await BloodDonation.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await BloodDonation.countDocuments(filter);
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
        var userData = await Users.findOne({
            _id: userId,
            status: 1
        }, {
            name: 1,
            image: 1,
            email: 1,
            bloodGroup: 1
        });
        res.status(200).send({
            success: 1,
            imageBase: userConfig.imageBase,
            pagination: pagination,
            userData: userData,
            items: bloodDonationList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Blood donation detail ***
exports.detail = async (req, res) => {
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
            neededDate: 1,
            hospitalName: 1,
            address: 1,
            phone: 1,
            description: 1,
            bloodGroup: 1
        };
        var detail = await BloodDonation.findOne(filter, projection);
        res.status(200).send({
            success: 1,
            item: detail
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}