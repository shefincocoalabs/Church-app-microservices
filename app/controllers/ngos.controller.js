var Users = require('../models/user.model');
var Ngos = require('../models/ngo.model');
var config = require('../../config/app.config.js');
var ngosConfig = config.ngos;

exports.details = async (req, res) => {
    var identity = req.identity.data;
    var userId = identity.id;

    var userData = await Users.findOne({
        _id: userId,
        status: 1
    },{
        church : 1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while get user data',
                error: err
            }
        })
    if (userData && (userData.success !== undefined) && (userData.success === 0)) {
        return res.send(userData);
    }
    if(userData){
        let churchId = userData.church;
        let ngoData = await Ngos.findOne({
            churchId,
            status : 1
        })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while get ngo data',
                error: err
            }
        })
    if (ngoData && (ngoData.success !== undefined) && (ngoData.success === 0)) {
        return res.send(ngoData);
    }
    if(ngoData){
        return res.send({
            success : 1,
            imageBase : ngosConfig.imageBase,
            ngo : ngoData
        })

    }else{
        return res.send({
            success: 0,
            message: 'No ngo found'
        });
    }

    }else{
        return res.send({
            success: 0,
            message: 'User not exists'
        });
    }

}