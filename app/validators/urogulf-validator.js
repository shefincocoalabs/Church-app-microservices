const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'createMessage': {
            return [
                check('countryId', 'Country(id) is required').notEmpty(),
                check('stateId', 'State(id) is required').notEmpty(),
                check('districtId', 'District(id) is required').notEmpty(),
                check('branchId', 'Branch(id) is required').notEmpty(),
                check('message', 'message is required').notEmpty(),
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