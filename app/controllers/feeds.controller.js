var Post = require('../models/post.model');
var constant = require('../helpers/constants');
var feedType = constant.TYPE_FEEDPOST;
var buySellType = constant.TYPE_BUYORSELL;
var eventsType = constant.TYPE_EVENT
var config = require('../../config/app.config.js');
var eventsConfig = config.events;
var buyorsellConfig = config.buyorsell;
var feedsConfig = config.feeds;
var usersConfig = config.users;

exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var files = req.files;
    var type;
    var fileName;
    var feedContent = req.body.feedContent;
    var textContent = req.body.textContent
    var textStyle = req.body.textStyle;
    if (files) {
        if (files.image && !files.video) {
            type = "image";
            fileName = files.image[0].filename
        }
        if (!req.files.images && req.files.video) {
            type = "video";
            fileName = files.video[0].filename;
        }
    }
    if (textContent) {
        type = "text";
        if (!textStyle) {
            return res.status(400).send({
                success: 0,
                param: 'textStyle',
                message: 'Text style is required'
            })
        }
    }
    try {
        const newFeed = new Post({
            contentType: feedType,
            postContent: feedContent,
            postType: type,
            fileName: fileName,
            textContent: textContent || null,
            textStyle: textStyle || null,
            feedCreatedBy: userId,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
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
            postType: 1,
            fileName: 1,
            textContent: 1,
            textStyle: 1
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
        listPosts = await Post.find(filter, projection, pageParams).populate([{
            path: 'userId',
            select: 'name image'
        }, {
            path: 'feedCreatedBy',
            select: 'name image'
        }]).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var postContentArray = [];
        for (var i = 0; i < listPosts.length; i++) {
            var postContent = {};
            if (listPosts[i].contentType == buySellType) {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.caption = listPosts[i].caption;
                postContent.rate = listPosts[i].rate;
                postContent.images = listPosts[i].images;
                postContent.user = listPosts[i].userId;
            } else if (listPosts[i].contentType == eventsType) {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.name = listPosts[i].name;
                postContent.image = listPosts[i].image;
            } else if(listPosts[i].contentType == feedType) {
                postContent.id = listPosts[i].id;
                postContent.contentType = listPosts[i].contentType;
                postContent.postContent = listPosts[i].postContent;
                postContent.postType = listPosts[i].postType;
                postContent.fileName = listPosts[i].fileName;
                postContent.textContent = listPosts[i].textContent,
                postContent.textStyle = listPosts[i].textStyle;
                postContent.user = listPosts[i].feedCreatedBy;
            }
            else {
                continue;
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
            userImageBase: usersConfig.imageBase,
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