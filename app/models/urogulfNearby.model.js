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
const UrogulfLocationSchema = mongoose.Schema({
    name: String,
    urogulfLocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UrogulfLocation'
    },
    address: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('UrogulfNearby', UrogulfLocationSchema, 'UrogulfNearby');