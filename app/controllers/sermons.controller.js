var Sermons = require('../models/post.model');
var Paster = require('../models/paster.model');
var config = require('../../config/app.config.js');
var constant = require('../helpers/constants');
var sermonsType = constant.TYPE_SERMONS;
var sermonsConfig = config.sermons;
var pastersConfig = config.pasters;

// *** Sermons List ***
exports.list = async (req, res) => {
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || sermonsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : sermonsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var search = params.keyword || '.*';
    search = search + '.*';
    try {
        var filter = {
            $or: [{
                postType: {
                    $regex: search,
                    $options: 'i',
                }
            }, {
                postContent: {
                    $regex: search,
                    $options: 'i'
                }
            }],
            contentType: sermonsType,
            status: 1
        };
        var projection = {
            postContent: 1,
            postType: 1,
            fileName: 1,
            textStyle: 1,
            textContent: 1,
            sermonsCreatedBy: 1,
            tsCreatedAt: 1
        };
        var sermonsList = await Sermons.find(filter, projection, pageParams).populate({
            path: 'sermonsCreatedBy',
            select: 'name image'
        }).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Sermons.countDocuments(filter);
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
            sermonsFileBase: sermonsConfig.imageBase,
            pasterImageBase: pastersConfig.imageBase,
            pagination: pagination,
            items: sermonsList
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}