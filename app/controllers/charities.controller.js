var Charity = require('../models/charity.model');
var config = require('../../config/app.config.js');
var ObjectId = require('mongoose').Types.ObjectId;
var charityConfig = config.charity;

exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    try {
        var filter = {

        };
        var projection = {
            caption: 1,
            trustName: 1,
            title: 1,
            images: 1,
            fund: 1
        };
        var listCharities = await Charity.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Charity.countDocuments(filter);
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
            pagination: pagination,
            imageBase: charityConfig.imageBase,
            items: listCharities
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

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
            caption: 1,
            trustName: 1,
            title: 1,
            images: 1,
            fund: 1,
            about: 1,
            phone: 1
        };
        var charityDetail = await Charity.findOne(filter, projection);
        res.status(200).send({
            success: 1,
            imageBase: charityConfig.imageBase,
            item: charityDetail
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}