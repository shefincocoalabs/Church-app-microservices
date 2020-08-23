const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsModifiedAt;
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};
const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    image: String,
    phone: String,
    address: String,
    church: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    parish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parish'
    },
    parishWard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParishWard'
    },
    bloodGroup: String,
    isVerified: Boolean,
    familyMembers: [{
        familyMember: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        relation: String
    }],
    userType: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserRole'
    }],
    isBlocked: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('User', UserSchema, 'Users');