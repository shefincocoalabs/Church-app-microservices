const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'createGroup': {
            return [
                check('name', 'Name is required').notEmpty(),
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