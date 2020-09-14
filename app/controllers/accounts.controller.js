const Users = require('../models/user.model');
const UserRole = require('../models/userRole.model');
const Otp = require('../models/otp.model');
const Church = require('../models/church.model');
const Parish = require('../models/parish.model');
const ParishWard = require('../models/parishWard.model');
const Post = require('../models/post.model');
const Matrimnoy = require('../models/matrimony.model');
const Donation = require('../models/donation.model');
const PushNotification = require('../models/pushNotification.model');
const superagent = require('superagent');
const config = require('../../config/app.config.js');
var otpConfig = config.otp;
var usersConfig = config.users;
var feedsConfig = config.feeds;
var notificationConfig = config.notifications;
const razorpayConfig = config.razorPay;
const paramsConfig = require('../../config/params.config');
const JWT_KEY = paramsConfig.development.jwt.secret;
var jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const constant = require('../helpers/constants');
const feedType = constant.TYPE_FEEDPOST;
const approvedStatus = constant.APPROVED_PROFILE;
const subAdminType = constant.SUB_ADMIN_USER;
const Razorpay = require('razorpay');

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
      isVerified: true,
      status: 1
    }
    var checkPhone = await Users.findOne(filter);
    if (checkPhone) {
      return res.status(200).send({
        success: 0,
        message: 'Phone number already registered'
      })
    }
    var otpResponse = await otp(phone);
    if (otpResponse == undefined) {
      return res.send({
        success: 0,
        message: 'Something went wrong while sending OTP'
      })
    }
    var newUser = new Users({
      name: name,
      email: email,
      image: '',
      phone: phone,
      address: address,
      church: church,
      parish: parish,
      parishWard: parishWard,
      bloodGroup: bloodGroup,
      isBlocked: false,
      isVerified: false,
      status: 1,
      tsCreatedAt: new Date(),
      tsModifiedAt: null
    });
    var saveUser = await newUser.save();
    res.status(200).send({
      success: 1,
      message: 'OTP is sent to your registered phone number for verification',
      item: otpResponse
    });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
};

//   **** Verify OTP ****  

exports.verifyOtp = async (req, res) => {
  var params = req.body;
  var otp = params.otp;
  var phone = params.phone;
  var apiToken = params.apiToken;
  try {
    var filter = {
      otp: otp,
      phone: phone,
      apiToken: apiToken,
      isUsed: false
    };
    var otpData = await Otp.findOne(filter);

    if (otpData) {
      var currentTime = Date.now();

      var otpData1 = await Otp.findOne({
        phone: phone,
        otp: otp,
        apiToken: apiToken,
        isUsed: false,
        expiry: {
          $gt: currentTime
        }
      });
      if (otpData1 === null) {
        return res.send({
          success: 0,
          message: 'otp expired,please resend otp to get a new one'
        })
      } else {
        var result = await Users.findOne({
          phone: phone
        }).populate([{
          path: 'church',
          select: 'name'
        }, {
          path: 'parish',
          select: 'name'
        }, {
          path: 'parishWard',
          select: 'name'
        }])
        var userId = result._id;
        var matrimonyId;
        var findMatrimony = await Matrimnoy.findOne({
          createdBy: userId,
          status: 1
        });
        if (findMatrimony) {
          matrimonyId = findMatrimony._id;
        } else {
          matrimonyId = null;
        }
        var payload = {
          id: result._id
        };
        var userData = {
          imageBase: usersConfig.imageBase,
          id: result._id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          image: result.image ? result.image : "",
          address: result.address,
          bloodGroup: result.bloodGroup,
          church: result.church,
          parish: result.parish,
          parishWard: result.parishWard,
          matrimonyId: matrimonyId
        };
        var token = jwt.sign({
          data: payload,
        }, JWT_KEY, {
          expiresIn: '30 days'
        });
        var filter = {
          phone: phone,
          otp: otp,
          apiToken: apiToken
        };
        var update = {
          isUsed: true
        };
        var updateOtpData = await Otp.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false
        });

        var updateUserData = await Users.findOneAndUpdate({
          _id: userId
        }, {
          isVerified: true
        }, {
          new: true,
          useFindAndModify: false
        });
        return res.status(200).send({
          success: 1,
          message: 'Otp verified successfully',
          imageBase: usersConfig.imageBase,
          profileData: userData,
          token: token
        })
      }
    } else {
      return res.send({
        success: 0,
        message: 'Otp does not matching'
      })
    }
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
};

//  *** Send OTP for already registered user ***
exports.sendOtp = async (req, res) => {
  var phone = req.body.phone;
  var type = req.query.type;
  try {
    if (type === 'login') {
      var checkPhone = await Users.findOne({
        phone: phone,
        isVerified: true,
        status: 1
      });
      if (!checkPhone) {
        return res.status(200).send({
          success: 0,
          message: 'Phone number is not registered with us'
        })
      }
    }
    var otpResponse = await otp(phone);
    if (otpResponse == undefined) {
      return res.send({
        success: 0,
        message: 'Something went wrong while sending OTP'
      })
    }
    res.status(200).send({
      success: 1,
      message: 'OTP is sent to your registered phone number for verification',
      item: otpResponse
    });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** Profile summary ***

exports.profileSummary = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  try {
    var filter = {
      _id: userId,
      status: 1
    };
    var projection = {
      name: 1,
      email: 1,
      phone: 1,
      image: 1,
      address: 1,
      parish: 1,
      parishWard: 1,
      bloodGroup: 1,
      'familyMembers.relation': 1
    };
    var profileData = await Users.findOne(filter, projection).populate([{
      path: 'church',
      select: 'name'
    }, {
      path: 'parish',
      select: 'name'
    }, {
      path: 'parishWard',
      select: 'name'
    }, {
      path: 'familyMembers.familyMember',
      select: 'name image'
    }]);
    var postedData = await Post.find({
      feedCreatedBy: userId,
      contentType: 'feedpost',
      postType: 'image'
    }, {
      fileName: 1,
      tsCreatedAt: 1
    }).limit(3).sort({
      'tsCreatedAt': -1
    });
    var postImages = [];
    for (var i = 0; i < postedData.length; i++) {
      postImages.push({
        image: postedData[i].fileName,
        createdAt: new Date(postedData[i].tsCreatedAt)
      })
    }
    var profileDataObj = {};
    profileDataObj.imageBase = usersConfig.imageBase;
    profileDataObj.name = profileData.name;
    profileDataObj.email = profileData.email;
    profileDataObj.phone = profileData.phone;
    profileDataObj.image = profileData.image ? profileData.image : "";
    profileDataObj.address = profileData.address;
    profileDataObj.bloodGroup = profileData.bloodGroup
    profileDataObj.church = profileData.church;
    profileDataObj.parish = profileData.parish;
    profileDataObj.parishWard = profileData.parishWard;

    var familyMembers = profileData.familyMembers.slice(0, 10);
    var famliyMembersArray = [];
    if (familyMembers.length > 0) {
      for (var i = 0; i < familyMembers.length; i++) {
        var familyMembersObj = {};
        familyMembersObj.id = familyMembers[i].familyMember.id;
        familyMembersObj.name = familyMembers[i].familyMember.name;
        familyMembersObj.image = familyMembers[i].familyMember.image;
        familyMembersObj.relation = familyMembers[i].relation
        famliyMembersArray.push(familyMembersObj);
      }
    }
    res.status(200).send({
      success: 1,
      userImageBase: usersConfig.imageBase,
      feedImageBase: feedsConfig.imageBase,
      profileData: profileDataObj,
      familyMembers: famliyMembersArray,
      images: postImages
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** Edit profile ***

exports.editProfile = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var file = req.file;
  var params = req.body;
  var name = params.name;
  var email = params.email;
  var phone = params.phone;
  var address = params.address;
  var church = params.church;
  var parish = params.parish;
  var parishWard = params.parishWard;
  var bloodGroup = params.bloodGroup;
  try {
    if ((Object.keys(req.body).length === 0) && (!file)) {
      return res.status(400).send({
        success: 0,
        message: 'Nothing to update'
      })
    }
    var update = {};
    if (file) {
      update.image = file.filename;
    }
    if (name) {
      update.name = name;
    }
    if (email) {
      update.email = email;
    }
    if (phone) {
      update.phone = phone;
    }
    if (address) {
      update.address = address;
    }
    if (church) {
      update.church = church;
    }
    if (parish) {
      update.parish = parish;
    }
    if (parishWard) {
      update.parishWard = parishWard;
    }
    if (bloodGroup) {
      update.bloodGroup = bloodGroup;
    }
    var filter = {
      _id: userId,
      status: 1
    };
    var profileData = await Users.findOneAndUpdate(filter, update, {
        new: true,
        useFindAndModify: false
      })
      .populate([{
        path: 'church',
        select: 'name'
      }, {
        path: 'parish',
        select: 'name'
      }, {
        path: 'parishWard',
        select: 'name'
      }]);
    var profileDataObj = {};
    profileDataObj.imageBase = usersConfig.imageBase;
    profileDataObj.name = profileData.name;
    profileDataObj.email = profileData.email;
    profileDataObj.phone = profileData.phone;
    profileDataObj.image = profileData.image ? profileData.image : "";
    profileDataObj.address = profileData.address;
    profileDataObj.bloodGroup = profileData.bloodGroup
    profileDataObj.church = profileData.church;
    profileDataObj.parish = profileData.parish;
    profileDataObj.parishWard = profileData.parishWard;
    res.status(200).send({
      success: 1,
      profileData: profileDataObj,
      message: 'Profile updated successfully'
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** My posts ***
exports.myPosts = async (req, res) => {
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
  try {
    var filter = {
      feedCreatedBy: userId,
      contentType: feedType,
      status: 1
    };
    var projection = {
      contentType: 1,
      postContent: 1,
      fileName: 1
    };
    var myPosts = await Post.find(filter, projection, pageParams).limit(perPage).sort({
      'tsCreatedAt': -1
    });
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
      imageBase: feedsConfig.imageBase,
      pagination: pagination,
      items: myPosts
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** Add Family memebers ***
exports.addFamilyMembers = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var familyMember = req.body.familyMember;
  var relation = req.body.relation;
  try {
    var filter = {
      _id: userId,
      status: 1
    };
    var updateFamilyMemebers = await Users.update(filter, {
      $push: {
        familyMembers: {
          familyMember: familyMember,
          relation: relation
        }
      }
    })
    res.status(200).send({
      success: 1,
      message: 'Family members added successfully'
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** List family memebers ***
exports.listFamilyMembers = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || usersConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : usersConfig.resultsPerPage;
  try {
    var filter = {
      _id: userId,
      status: 1
    };
    var projection = {
      familyMembers: 1
    };
    var listFamilyMembers = await Users.findOne(filter, projection).populate({
      path: 'familyMembers.familyMember',
      select: 'name image'
    })
    if (!listFamilyMembers) {
      return res.status(400).send({
        success: 0,
        message: 'User not found or deleted'
      })
    }
    var familyMembers = listFamilyMembers.familyMembers;
    var famliyMembersArray = [];
    for (var i = 0; i < familyMembers.length; i++) {
      var familyMembersObj = {};
      familyMembersObj.id = familyMembers[i].familyMember.id;
      familyMembersObj.name = familyMembers[i].familyMember.name;
      familyMembersObj.image = familyMembers[i].familyMember.image;
      familyMembersObj.relation = familyMembers[i].relation
      famliyMembersArray.push(familyMembersObj);
    }
    var itemsCount = familyMembers.length;
    familyMembers = paginate(famliyMembersArray, perPage, page);
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: itemsCount,
      totalPages: totalPages,
    };
    res.status(200).send({
      success: 1,
      imageBase: usersConfig.imageBase,
      pagination: pagination,
      items: familyMembers
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** List all photos ***
exports.listAllPhotos = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || usersConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : usersConfig.resultsPerPage;
  try {
    var postedData = await Post.find({
      feedCreatedBy: userId,
      contentType: 'feedpost',
      postType: 'image'
    }, {
      fileName: 1,
      tsCreatedAt: 1
    }).sort({
      'tsCreatedAt': -1
    });
    var postImages = [];
    for (var i = 0; i < postedData.length; i++) {
      postImages.push({
        image: postedData[i].fileName,
        createdAt: new Date(postedData[i].tsCreatedAt)
      })
    }
    var itemsCount = postImages.length;
    postImages = paginate(postImages, perPage, page);
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
      page: page,
      perPage: perPage,
      hasNextPage: hasNextPage,
      totalItems: itemsCount,
      totalPages: totalPages,
    };
    res.status(200).send({
      success: 1,
      imageBase: feedsConfig.imageBase,
      pagination: pagination,
      items: postImages
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** Create orderId ***
exports.createOrder = (req, res) => {
  var amount = req.body.amount;
  amount = amount * 100;
  if (!amount) {
    return res.status(400).send({
      success: 0,
      param: 'amount',
      message: 'amount cannot be empty'
    })
  }
  var instance = new Razorpay({
    key_id: razorpayConfig.key_id,
    key_secret: razorpayConfig.key_secret,
  });
  try {
    var options = {
      amount: amount,
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: '0'
    };
    instance.orders.create(options, function (err, order) {
      res.status(200).send({
        success: 1,
        item: order,
        message: 'OrderId created'
      })
    });
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** Donation ***

exports.donation = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var params = req.body;
  var transactionId = params.transactionId;
  var amount = params.amount;
  var paidStatus = params.paidStatus;
  var paidOn = params.paidOn;
  try {
    var findUser = await Users.findOne({
      _id: userId,
      status: 1
    });
    var churchId = findUser.church;
    const newPayment = new Donation({
      userId: userId,
      churchId: churchId,
      transactionId: transactionId,
      amount: amount,
      paidStatus: paidStatus,
      paidOn: paidOn,
      status: 1,
      tsCreatedAt: Date.now(),
      tsModifiedAt: null
    });
    var savePayment = await newPayment.save();
    res.status(200).send({
      success: 1,
      message: 'Donation successfull'
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

// *** List all members excluding family members ***
exports.listAllMembers = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || usersConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : usersConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  var pageParams = {
    skip: offset,
    limit: perPage
  };
  try {
    var findUserRole = await UserRole.findOne({
      name: subAdminType,
      status: 1
    });
    var roleId = findUserRole._id;
    var userData = await Users.findOne({
      _id: userId,
      status: 1
    });
    var familyMembers = userData.familyMembers;
    var familyMemberIds = familyMembers.map(function (x) {
      return x.familyMember
    });
    var filter = {
      $and: [{
          _id: {
            $ne: userId
          }
        },
        {
          _id: {
            $nin: familyMemberIds
          }
        },
        {
          roles: {
            $nin: [roleId]
          }
        }, {
          isVerified: true
        },
        {
          status: 1
        }
      ]
    };
    var projection = {
      name: 1,
      email: 1,
      image: 1,
      tsCreatedAt: 1
    };
    var members = await Users.find(filter, projection, pageParams).limit(perPage).sort({
      'tsCreatedAt': -1
    });
    var itemsCount = await Users.countDocuments(filter);
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
      items: members
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}


exports.listNotification = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  // var churchId = identity.church;
  let userData = await Users.findOne({
      _id: userId
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while user data',
        error: err
      }
    })
  if (userData && (userData.success !== undefined) && (userData.success === 0)) {
    return res.send(userData);
  }

  var params = req.query;
  var page = Number(params.page) || 1;
  page = page > 0 ? page : 1;
  var perPage = Number(params.perPage) || notificationConfig.resultsPerPage;
  perPage = perPage > 0 ? perPage : notificationConfig.resultsPerPage;
  var offset = (page - 1) * perPage;
  let findCriteria = {
    churchId: userData.church,
    status: 1
  }
  var pushNotificationList = await PushNotification.find(findCriteria)
    .limit(perPage)
    .skip(offset)
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while list notification data',
        error: err
      }
    })
  if (pushNotificationList && (pushNotificationList.success !== undefined) && (pushNotificationList.success === 0)) {
    return res.send(pushNotificationList);
  }

  var pushNotificationCount = await PushNotification.countDocuments(findCriteria)
    .sort({
      'tsCreatedAt': -1
    })
    .catch(err => {
      return {
        success: 0,
        message: 'Something went wrong while get notification count',
        error: err
      }
    })
  if (pushNotificationCount && (pushNotificationCount.success !== undefined) && (pushNotificationCount.success === 0)) {
    return res.send(pushNotificationCount);
  }
  var totalPages = pushNotificationCount / perPage;
  totalPages = Math.ceil(totalPages);
  var hasNextPage = page < totalPages;
  var pagination = {
    page: page,
    perPage: perPage,
    hasNextPage: hasNextPage,
    totalItems: pushNotificationCount,
    totalPages: totalPages
  }
  return res.status(200).send({
    success: 1,
    pagination: pagination,
    items: pushNotificationList
  });

}

exports.removeFamilyMember = async (req, res) => {
  var identity = req.identity.data;
  var userId = identity.id;
  var id = req.params.id;
  try {
    var removeFamilyMember = await Users.updateOne({
      _id: userId,
      status: 1
    }, {
      $pull: {
        familyMembers: {
          familyMember: id
        }
      }
    });
    res.status(200).send({
      success: 1,
      message: 'Removed successfully'
    })
  } catch (err) {
    res.status(500).send({
      success: 0,
      message: err.message
    })
  }
}

async function otp(phone) {
  var otp = Math.floor(1000 + Math.random() * 9000);
  const apiToken = uuidv4();
  var expiry = Date.now() + (otpConfig.expirySeconds * 1000);
  try {
    const smsurl = await superagent.get(`http://thesmsbuddy.com/api/v1/sms/send?key=zOxsbDOn4iK8MBfNTyqxTlrcqM8WD3Ms&type=1&to=${phone}&sender=INFSMS&message=${otp} is the OTP for login to The Genesis Apostolic Church App&flash=0`);
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
    var otpResponse = {
      phone: saveOtp.phone,
      otp: saveOtp.otp,
      apiToken: saveOtp.apiToken,
    };
    return otpResponse
  } catch (error) {
    console.log(error.response.body);
  }

}

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
};