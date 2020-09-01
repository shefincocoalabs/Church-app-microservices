var Urogulf = require('../models/urogulf.model');
var UrogulfLocation = require('../models/urogulfLocations.model');
var UrogulfNearbyLocation = require('../models/urogulfNearby.model');
var Locations = require('../models/locations.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config/app.config.js');
var urogulfConfig = config.urogulf;

// *** Urogulf location list ***
exports.list = async (req, res) => {
    var params = req.query;
    // var page = Number(params.page) || 1;
    // page = page > 0 ? page : 1;
    // var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
    // perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
    // var offset = (page - 1) * perPage;
    // var pageParams = {
    //     skip: offset,
    //     limit: perPage
    // };
    try {
        var filter = {
            status: 1
        };
        // var projection = {
        //     name: 1
        // };
        var locationList = await Locations.distinct('district',filter)

        // .limit(perPage)
        // .skip(offset)
        // .sort({
        //     'tsCreatedAt': -1
        // });
        var districtArray = []
        for(let i = 0; i < locationList.length; i++){
            let name = locationList[i];
            let obj = {};
            obj.id = name;
            obj.name = name;
            districtArray.push(obj)
        }
        // var itemsCount = await Locations.distinct('district',filter).count();
        // totalPages = itemsCount / perPage;
        // totalPages = Math.ceil(totalPages);
        // var hasNextPage = page < totalPages;
        // var pagination = {
        //     page: page,
        //     perPage: perPage,
        //     hasNextPage: hasNextPage,
        //     totalItems: itemsCount,
        //     totalPages: totalPages
        // };
        res.status(200).send({
            success: 1,
            // pagination: pagination,
            items: districtArray
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** List nearby locations ***
exports.nearByLocations = async (req, res) => {
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || urogulfConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : urogulfConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };
    var districtId = req.params.id;
    // var isValidId = ObjectId.isValid(locationId);
    // if (!isValidId) {
    //     var responseObj = {
    //         success: 0,
    //         status: 401,
    //         errors: {
    //             field: "id",
    //             message: "id is invalid"
    //         }
    //     }
    //     res.send(responseObj);
    //     return;
    // }
    try {
        var filter = {
            district: districtId,
            status: 1
        };
        var projection = {
            // name: 1,
            address: 1,
            branch : 1
        };
        var nearbyList = await Locations.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var branchArray = []
        for(let i = 0; i < nearbyList.length; i++){
            let branchObj = nearbyList[i];
            let obj = {};
            obj.id = branchObj.id;
            obj.name = branchObj.branch;
            obj.address = branchObj.address;
            branchArray.push(obj)
        }
        var itemsCount = await Locations.countDocuments(filter);
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
            items: branchArray
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Urogulf create message ***
exports.create = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var location = req.body.location;
    var nearbyLocation = req.body.nearbyLocation;
    var message = req.body.message;
    try {
        const newMessage = new Urogulf({
            location: location,
            nearbyLocation: nearbyLocation,
            message: message,
            userId: userId,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });
        var saveMessage = await newMessage.save();
        res.status(200).send({
            success: 1,
            message: 'Message saved successfully'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}