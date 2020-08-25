const mongoose = require('mongoose');

const DonationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    transactionId: String,
    amount: String,
    paidStatus: Boolean,
    paidOn: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('Donation', DonationSchema, 'Donations');