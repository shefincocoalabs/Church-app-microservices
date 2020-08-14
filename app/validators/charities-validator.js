const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'payments': {
            return [
                check('charityId', 'ChariryId is required').notEmpty(),
                check('transactionId', 'TransactionId(String) is required').notEmpty(),
                check('amount', 'Amount(String) is required').notEmpty(),
                check('paidStatus', 'Paid status(Boolean) is required').notEmpty(),
                check('paidOn', 'Paid on(Date) is required').notEmpty(),
                (req, res, next) => {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(422).json({
                            success: 0,
                            errors: errors.array()
                        })
                    }
                    next()
                }
            ]
        }
    }
}