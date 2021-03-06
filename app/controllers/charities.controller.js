var Charity = require('../models/charity.model');
var CharityPayment = require('../models/charityPayments.model');
var config = require('../../config/app.config.js');
var ObjectId = require('mongoose').Types.ObjectId;
var charityConfig = config.charity;

exports.list = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.query;
    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || charityConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : charityConfig.resultsPerPage;
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
            caption: 1,
            trustName: 1,
            title: 1,
            images: 1,
            fund: 1
        };
        var listCharities = await Charity.find(filter, projection, pageParams).limit(perPage).sort({
            'tsCreatedAt': -1
        });
        var itemsCount = await Charity.countDocuments(filter);
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
            imageBase: charityConfig.imageBase,
            items: listCharities
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
            caption: 1,
            trustName: 1,
            title: 1,
            images: 1,
            fund: 1,
            about: 1,
            phone: 1,
            address: 1
        };
        var charityDetail = await Charity.findOne(filter, projection);
        var percentageObj = await getCalculatePercentage(id, parseFloat(charityDetail.fund));
        charityDetail = JSON.parse(JSON.stringify(charityDetail));
        charityDetail.percentage = percentageObj.percentage;
        charityDetail.neededAmount = percentageObj.neededAmount;
        res.status(200).send({
            success: 1,
            imageBase: charityConfig.imageBase,
            item: charityDetail
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

// *** Charity payments ***
exports.payments = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;
    var params = req.body;
    var charityId = params.charityId;
    var transactionId = params.transactionId;
    var amount = params.amount;
    var paidStatus = params.paidStatus;
    var paidOn = params.paidOn;
    try {
        const newPayment = new CharityPayment({
            userId: userId,
            charityId: charityId,
            transactionId: transactionId,
            amount: amount,
            paidStatus: paidStatus,
            paidOn: paidOn,
            status: 1,
            tsCreatedAt: Date.now(),
            tsModifiedAt: null
        });
        var savePayment = await newPayment.save();
        var saveToCharity = await Charity.update({
            _id: charityId,
            status: 1
        }, {
            $push: {
                charityPayments: savePayment._id
            }
        });
        res.status(200).send({
            success: 1,
            message: 'Payment successfully added'
        })
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

async function getCalculatePercentage(charityId, totalFund) {
    var percentageObj = {};
    let charityPaymentData = await CharityPayment.find({
            charityId,
            paidStatus: true,
            status: 1
        }, {
            amount: 1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while getting charity payment data',
                error: err
            }
        })
    if (charityPaymentData && (charityPaymentData.success !== undefined) && (charityPaymentData.success === 0)) {
        return res.send(charityPaymentData);
    }
    if (charityPaymentData) {
        var totalReceivedAmount = 0;
        for (let i = 0; i < charityPaymentData.length; i++) {
            var amount = charityPaymentData[i].amount;
            totalReceivedAmount = totalReceivedAmount + parseFloat(amount);
        }
        var percentage = (totalReceivedAmount / totalFund);
        var percentageData = percentage * 100;
        percentageObj.percentage = Math.round(percentageData * 10) / 10;
        percentageObj.neededAmount = (totalFund - totalReceivedAmount);


    } else {
        percentageObj.percentage = 0;
        percentageObj.neededAmount = totalFund;
    }
    return percentageObj;
}