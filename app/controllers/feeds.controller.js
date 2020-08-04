var Post = require('../models/post.model');
var constant = require('../helpers/constants');
var feedType = constant.TYPE_FEEDPOST;

exports.create = async (req, res) => {
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
            fileName: filename
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
    try {
        var projection = {
            contentType: 1,
            name: 1,
            caption: 1,
            rate: 1,
            image: 1,
            postContent: 1,
            fileName: 1
        };
        var listPosts = await Post.find({}, projection);
        res.status(200).send({
            success: 1,
            items: listPosts
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}