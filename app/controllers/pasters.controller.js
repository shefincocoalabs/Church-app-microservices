var Paster = require('../models/paster.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var pasterConfig = config.pasters;

// *** Pasters List ***
exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || pasterConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : pasterConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    try {
        var pastersList = await Paster.find({}, {}, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Paster.countDocuments();
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
            imageBase: pasterConfig.imageBase,
            items: pastersList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Paster Detail ***
exports.detail = async(req, res) => {
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
        var pasterDetail = await Paster.findOne(filter);
        res.status(200).send({
            success: 1,
            imageBase: pasterConfig.imageBase,
            item: pasterDetail
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}