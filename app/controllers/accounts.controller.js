  const Users = require('../models/user.model');
  const Otp = require('../models/otp.model');
  const config = require('../../config/app.config.js');
  var otpConfig = config.otp;
  const paramsConfig = require('../../config/params.config');
  const JWT_KEY = paramsConfig.development.jwt.secret;
  var moment = require('moment');
  var jwt = require('jsonwebtoken');
  const uuidv4 = require('uuid/v4');


  //   **** Sign-up **** 
  exports.signUp = async (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var church = req.body.church;
    var parish = req.body.parish;
    var parishWard = req.body.parishWard;
    var bloodGroup = req.body.bloodGroup;
    try {
      var filter = {
        phone: phone,
        status: 1
      }
      var checkPhone = await Users.findOne(filter);
      if (checkPhone) {
        return res.status(400).send({
          success: 0,
          message: 'Phone number already registered'
        })
      }

      var otp = Math.floor(1000 + Math.random() * 9000);
      const apiToken = uuidv4();
      var expiry = Date.now() + (otpConfig.expirySeconds * 1000);

      const newOtp = new Otp({
        phone: phone,
        isUsed: false,
        otp: otp,
        apiToken: apiToken,
        expiry: expiry,
        status: 1,
        tsCreatedAt: new Date(),
        tsModifiedAt: null
      });

      var saveOtp = await newOtp.save();
      var otpGenerateResponse = {
        phone: saveOtp.phone,
        userToken: saveOtp.userToken,
        apiToken: saveOtp.apiToken,
      };
      var newUser = new Users({
         name: name,
         email: email,
         phone: phone,
         address: address,
         church: church,
         parish: parish,
         parishWard: parishWard,
         bloodGroup: bloodGroup,
         isVerified: false,
         status: 1,
         tsCreatedAt: new Date(),
         tsModifiedAt: null
      });
      var saveUser = await newUser.save();
      res.status(200).send({
        success: 1,
        message: 'OTP is sent to your registered phone number for verification',
        otpGenerateResponse: otpGenerateResponse
      });
    } catch (err) {
      res.status(500).send({
        success: 0,
        message: err.message
      })
    }
  };

  //   **** Login ****  

  exports.login = async (req, res) => {

  };

  exports.testAuth = (req, res) => {
    console.log('yes');
  }

  exports.testUser = (req, res) => {
    console.log('test');
  }