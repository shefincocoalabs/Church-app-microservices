var BloodDonation = require('../models/bloodDonation.model');
var Users = require('../models/user.model');
var config = require('../../config/app.config.js');
var userConfig = config.users;
exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    try {
        var filter = {
            status: 1
        };
        var projection = {
            neededDate: 1,
            bloodGroup: 1,
            place: 1
        };
        var bloodDonationList = await BloodDonation.find(filter, projection).sort({
            'tsCreatedAt': -1
        });
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