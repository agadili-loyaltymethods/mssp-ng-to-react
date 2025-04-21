const config = require('../config');
const router = require('express').Router();
const logger = require('log4js').getLogger();
const axios = require('axios');
const { validationResult } = require('express-validator');

const { validator } = require('./../utils');

const {
  register: cognitoRegister,
  confirmCode: cognitoConfirmCode,
  login: cognitoLogin,
  getUser: cognitoGetUser,
  resendConfirmation: cognitoResendConfirmation,
  forgotPassword: cognitoForgotPassword,
  resetPassword: cognitoResetPassword,
  updateAttributes: cognitoUpdateAttributes
} = require('./../modules/cognito');

router.route('/register')
  .post(validator.registration, async (req, res, next) => {
    const payload = req.body;
    // TODO:: Refactor this to add in validator only instaed of repeating here for each request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      if (payload.country) {
        const activityPayload = {
          type: 'PR Enroll Check',
          program: config.DEFAULT_PROGRAM,
          srcChannelID: 'Corporate',
          srcChannelType: 'Web',
          loyaltyID: 'sysenrollcheck',
          date: new Date(),
          ext: {
            enrollCountry: payload.country
          }
        };
        try {
          let response = await axios({
            url: `${config.REST_URL}/api/v1/activity?persist=false`,
            method: 'post',
            data: activityPayload
          });
          let {data: actRes} = response;
          if (actRes && actRes.data && actRes.data.enrollmentRestricted) {
            return res.status(400).json({
              error: actRes.data.enrollErrorMessage || 'Enrollment is not allowed from this country'
            });
          }
        } catch(err) {
          logger.error((err && err.response && err.response.data) || (err && err.message));
        }
      }
      const newUser = await cognitoRegister(payload);

      return res.json({ status: 'success' });
    } catch (err) {
      logger.error(err);
      return res.status(err.status || 500).json({ error: err.message });
    }
  });

router.route('/confirm-registration')
  .post(validator.confirmCode, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const user = {
      username: req.body.username,
      code: req.body.code
    }

    try {
      let result = await cognitoConfirmCode(user);
      return res.json(result);
    } catch (err) {
      logger.error(err);
      return res.status(400).json({ error: err.message });
    }
  });

router.route('/login')
  .post(validator.login, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const { username, password } = req.body;

    try {
      const login = {
        username,
        password
      };
      let result = await cognitoLogin(login);

      let { attributes, cognitoUser } = await cognitoGetUser(result);
      let loyaltyId = attributes['custom:loyaltyId'];

      if (!loyaltyId) {
        logger.info(`Member enrollment triggering for ${username}`);
        const memberPayload = {
          "member": {
            "enrollDate": new Date().toISOString(),
            "enrollChannel": "Mobile",
            "enrollSource": "Unknown",
            "status": "Active",
            "program": config.DEFAULT_PROGRAM,
            "type": "Individual",
            "firstName": attributes['custom:firstname'],
            "lastName": attributes['custom:lastname'],
            "acquisitionChannel": "Mobile",
            "dob": attributes['custom:dob'],
            "gender": attributes['custom:gender'],
            "address": attributes['custom:address'],
            "city": attributes['custom:city'],
            "country": attributes['custom:country'],
            "email": attributes.email,
            "zipCode": attributes['custom:zipcode'],
            "state": attributes['custom:state'],
            "cardBankChannel": "Digital Card",
            "cellPhone": attributes['custom:cellphone'],
            "referralCode": attributes['custom:referralCode'],
            "lastActivityDate": new Date().toISOString()
          },
          "program": config.DEFAULT_PROGRAM,
          "assignCard": true,
          "channel": "Mobile",
          "cardType": "Digital Card",
          "loyaltyIds": [{
            "name": config.cardName,
            "primary": true,
            "status": "Active"
          }],
          "preferences": [
            {
              category: 'T&C',
              name: attributes['custom:country'] === 'China' ? 'China Terms Accepted' : 'Terms Accepted',
              optedInDate: new Date().toISOString(),
              value: attributes['custom:tnc'] === 'Yes' ? 'Yes' : 'No'
            }
          ]
        };

        // TODO:: Will abstract axios with headers and all and revert member enroll if signup fails
        const { data: memberEnrollRes } = await axios({
          url: `${config.REST_URL}/api/v1/members/enroll`,
          method: 'post',
          data: memberPayload
        }).catch(err => {
          throw err.response.data;
        });

        loyaltyId = memberEnrollRes.loyaltyIds[0].loyaltyId;

        await cognitoUpdateAttributes(
          cognitoUser, {
          loyaltyId,
          orgId: memberEnrollRes.member.org
        }
        );
      }

      const { data: { member } } = await axios({
        url: `${config.REST_URL}/api/v1/members/${loyaltyId}/profile`,
        method: 'get'
      }).catch(err => {
        throw err.toJSON();
      });

      member.loyaltyId = loyaltyId;

      result = await cognitoLogin(login);

      result.member = member;
      return res.json(result);
    } catch (err) {
      logger.error(err);
      if (err.code && err.code === 'NotAuthorizedException') {
        return res.status(401).json({ error: err.message });
      } else {
        return res.status(500).json({ error: err.message });
      }
    }
  });

router.route('/resend-confirmation-code')
  .post(validator.resendConfirm, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      await cognitoResendConfirmation(req.body.username);
      return res.json({ status: 'success' });
    } catch (err) {
      logger.error(err);
      return res.status(err.status || 400).json({ error: err.message });
    }
  });

router.route('/forgot-password')
  .post(validator.forgotPassword, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      await cognitoForgotPassword(req.body.username);
      return res.json({ status: 'success' });
    } catch (err) {
      logger.error(err);
      return res.status(err.status || 400).json({ error: err.message });
    }
  });

router.route('/reset-password')
  .post(validator.resetPassword, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      await cognitoResetPassword(req.body);
      return res.json({ status: 'success' });
    } catch (err) {
      logger.error(err);
      return res.status(err.status || 400).json({ error: err.message });
    }
  });

router.route('/countries')
  .get(async (req, res, next) => {
    try {
        let url = 'https://restcountries.com/v3.1/all?fields=name';
        console.log(`Getting ${url}`);
        const { data } = await axios({
        url,
        method: 'get'
        }).catch(err => {
            throw err.response.data;
        });
        return res.json(data);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
});

module.exports = router;
