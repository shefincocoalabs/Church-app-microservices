var Post = require('../models/post.model');
var constant = require('../helpers/constants');
var eventType = constant.TYPE_EVENT;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var eventConfig = config.events;

exports.list = async (req, res) => {
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || eventConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : eventConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    try {
        var filter = {
            contentType: eventType,
            status: 1
        };
        var projection = {
            name: 1,
            image: 1,
            timing: 1,
            venue: 1
        };
        var listEvents = await Post.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Post.countDocuments(filter);
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
            pagination: pagination,
            items: listEvents
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
            name: 1,
            detail: 1,
            image: 1,
            timing: 1,
            venue: 1,
            entryFees: 1,
            participants: 1,
            categoryAndType: 1,
        };
        var eventDetail = await Post.findOne(filter, projection);
        res.status(200).send({
            success: 1,
            item: eventDetail
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}