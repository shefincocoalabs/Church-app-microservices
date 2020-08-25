var Church = require('../models/church.model');
var User = require('../models/user.model');
var Parish = require('../models/parish.model');
var ParishWard = require('../models/parishWard.model');

exports.churchList = async (req, res) => {
    try {
        var filter = {
            status: 1
        };
        var projection = {
            name: 1
        };
        var listChurch = await Church.find(filter, projection).sort({
            'tsCreatedAt': -1
        });
        res.status(200).send({
            success: 1,
            items: listChurch
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.parishList = async (req, res) => {
    var churchId = req.params.id;
    try {
        var filter = {
            churchId: churchId,
            status: 1
        };
        var projection = {
            name: 1
        };
        var listParish = await Parish.find(filter, projection).sort({
            "tsCreatedAt": -1
        });
        res.status(200).send({
            success: 1,
            items: listParish
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.parishWardList = async (req, res) => {
    var parishId = req.params.id;
    try {
        var filter = {
            parishId: parishId,
            status: 1
        };
        var projection = {
            name: 1
        };
        var listParishWards = await ParishWard.find(filter, projection).sort({
            'tsCreatedAt': -1
        })
        res.status(200).send({
            success: 1,
            items: listParishWards
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.getKey = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;

    let userData = await User.findOne({
        _id: userId,
        status: 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if (userData) {
        let churchId = userData.church;
        let churchData = await Church.findOne({
            _id: churchId,
            status: 1
        })
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while getting user data',
                    error: err
                }
            })
        if (churchData && (churchData.success !== undefined) && (churchData.success === 0)) {
            return res.send(churchData);
        }
        if (churchData) {
            let paymentGatewayKey = churchData.paymentGatewayKey;
            if(paymentGatewayKey){
            return res.send({
                success : 1,
                paymentGatewayKey,
                message : 'Payment gateway key '
            })
        }else{
            return res.send({
                success: 0,
                message: 'Online payement not enabled'
            })
        }
        } else {
            return res.send({
                success: 0,
                message: 'Church not found'
            })
        }
    } else {
        return res.send({
            success: 0,
            message: 'User not found'
        })
    }
}