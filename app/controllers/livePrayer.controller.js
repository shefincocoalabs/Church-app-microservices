var LivePrayer = require('../models/livePrayer.model');
var config = require('../../config/app.config.js');
var livePrayerConfig = config.livePrayers;

exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || livePrayerConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : livePrayerConfig.resultsPerPage;
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

        };
        var listLivePrayers = await LivePrayer.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await LivePrayer.countDocuments(filter);
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
            items: listLivePrayers
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}