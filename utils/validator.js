const { body } = require('express-validator');

const Validator = {};

const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
const localDateRegex = new RegExp(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[01])T[0-5]\d:[0-5]\d:[0-5]\d.\d{3}$/);

Validator.registration = [
  body('firstName').notEmpty().withMessage('first name is empty'),
  body('lastName').notEmpty().withMessage('last name is empty'),
  // body('mobile').notEmpty().withMessage('mobile is empty').isMobilePhone(null, { strictMode: true }).withMessage('Invalid mobile'),
  // body('dob').notEmpty().withMessage('dob is empty').isBefore(new Date().toString()).withMessage('Invalid date of birth'),
  // body('address').notEmpty().withMessage('address is empty'),
  // body('city').notEmpty().withMessage('city is empty'),
  // body('state').notEmpty().withMessage('state is empty'),
  // body('zip').notEmpty().withMessage('zip is empty'),
  // body('country').notEmpty().withMessage('country is empty'),
  body('email').notEmpty().withMessage('email is empty').isEmail().withMessage('Invalid email'),
  body('password').custom((value, { req }) => {
    if (!value.match(passwordRegex)) {
      throw new Error('password should be atleast 8 characters and contain atleast one uppercase, lowercase, number and special character');
    }

    if (req.body.confirmPassword !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    return true;
  })
];

Validator.login = [
  body('username').notEmpty().withMessage('username is empty'),
  body('password').notEmpty().withMessage('password is empty')
];

Validator.confirmCode = [
  body('username').notEmpty().withMessage('username is empty'),
  body('code').notEmpty().withMessage('code is empty'),
];

Validator.resendConfirm = [
  body('username').notEmpty().withMessage('username is empty').isEmail().withMessage('Invalid username (email format)'),
];

Validator.updateMember = [
  body('firstName').notEmpty().withMessage('first name is empty'),
  body('lastName').notEmpty().withMessage('last name is empty')
];

Validator.buyReward = [
  body('date').not().isDate().custom((value, { req }) => {
    if (!value.match(localDateRegex)) {
      throw new Error('date should be of local date with format as YYYY-MM-DDTHH:mm:ss.SSS');
    }

    return true;
  }),
  body('rewardName').notEmpty().withMessage('reward name is empty')
];

Validator.forgotPassword = [
  body('username').notEmpty().withMessage('username is empty').isEmail().withMessage('Invalid username (email format)'),
];

Validator.resetPassword = [
  body('username').notEmpty().withMessage('username is empty').isEmail().withMessage('Invalid username (email format)'),
  body('code').notEmpty().withMessage('code is empty'),
  body('password').custom((value, { req }) => {
    if (!value.match(passwordRegex)) {
      throw new Error('password should be atleast 8 characters and contain atleast one uppercase, lowercase, number and special character');
    }

    return true;
  })
];

Validator.addReferral = [
  body('email').notEmpty().withMessage('email is empty').isEmail().withMessage('Invalid email'),
  body('name').notEmpty().withMessage('name is empty'),
];

module.exports = Validator;