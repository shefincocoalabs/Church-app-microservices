var Post = require('../models/post.model');
var constant = require('../helpers/constants');
var feedType = constant.TYPE_FEEDPOST;
var config = require('../../config/app.config.js');
var eventsConfig = config.events;
var buyorsellConfig = config.buyorsell;
var feedConfig = config.feeds;
var feedsConfig = config.feeds;

exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var file = req.file;
    if (!file) {
        return res.status(400).send({
            success: 0,
            message: 'file is required'
        })
    }
    var filename = file.filename;
    var feedContent = req.body.feedContent;
    try {
        const newFeed = new Post({
            contentType: feedType,
            postContent: feedContent,
            fileName: filename,
            feedCreatedBy: userId,
            status: 1,
            tsCreatedAt: Date.now(),
            tsCreatedAt: null
        });
        var saveFeed = newFeed.save();
        res.status(200).send({
            success: 1,
            id: saveFeed._id,
            message: 'Feed created successfully'
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
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var search = params.keyword || '.*';
    search = search + '.*';
    var listPosts;
    try {
        var projection = {
            contentType: 1,
            name: 1,
            caption: 1,
            rate: 1,
            image: 1,
            images: 1,
            fileName: 1,
            postContent: 1,
            fileName: 1
        };
        var filter = {
            $or: [{
                    contentType: {
                        $regex: search,
                        $options: 'i',
                    }
                }, {
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    caption: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    rate: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ]
        }
        listPosts = await Post.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var postContentArray = [];
        for (var i = 0; i < listPosts.length; i++) {
            var postContent = {};
            if (listPosts[i].contentType == 'buy/sell') {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.caption = listPosts[i].caption;
                postContent.rate = listPosts[i].rate;
                postContent.images = listPosts[i].images;
            } else if (listPosts[i].contentType == 'events') {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.name = listPosts[i].name;
                postContent.image = listPosts[i].image;
            } else {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.postContent = listPosts[i].postContent;
                postContent.fileName = listPosts[i].fileName;
            }
            postContentArray.push(postContent);
        }
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
            postFeedImageBase: feedsConfig.imageBase,
            buyorsellImageBase: buyorsellConfig.imageBase,
            eventsImageBase: eventsConfig.imageBase,
            pagination: pagination,
            items: postContentArray
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}