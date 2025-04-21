const router = require('express').Router();
const axios = require('axios');
const { getUser: cognitoGetUser, updateAttributes: cognitoUpdateAttributes } = require('../modules/cognito');
const logger = require('log4js').getLogger();
const { validationResult } = require('express-validator');

const config = require('./../config');
const { validator } = require('./../utils');

router.get('/info', async (req, res, next) => {
  try {
    const { data: { member } } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.loyaltyId}/profile`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    member.loyaltyId = req.loyaltyId;

    return res.json(member);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/policyinfo', async (req, res, next) => {
  try {
    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/pursepolicies?query=${req.query.query}`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/tierinfo', async (req, res, next) => {
  try {
    const url = `${config.REST_URL}/api/v1/tierpolicies?query=${req.query.query}`;
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

router.get('/preferences', async (req, res, next) => {
  try {
    const url = `${config.REST_URL}/api/v1/memberpreferences?query=${req.query.query}`;
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

router.post('/tiermsg', async (req, res, next) => {
  try {
    const { date } = req.body;
    const payload = {
      type: "Personalize Message",
      date: date,
      srcChannelType: "Mobile",
      loyaltyID: req.loyaltyId
    };
    const url =  `${config.REST_URL}/api/v1/activity?persist=false`;
    const { data } = await axios({
      url,
      method: 'post',
      data: payload
    }).catch(err => {
      throw err.response.data;
    });
    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/lifetimestats', async (req, res, next) => {
  try {
    const { date } = req.body;
    const payload = {
      type: "PR Lifetime Status",
      date: date,
      srcChannelType: "Mobile",
      loyaltyID: req.loyaltyId
    };
    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/activity?persist=false`,
      method: 'post',
      data: payload
    }).catch(err => {
      throw err.response.data;
    });
    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});



router.post('/streaksinfo', async (req, res, next) => {
  try {
    const { date } = req.body;
    const payload = {
      type: "PR Streaks",
      date: date,
      srcChannelType: "Mobile",
      loyaltyID: req.loyaltyId
    };
    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/activity?persist=false`,
      method: 'post',
      data: payload
    }).catch(err => {
      throw err.response.data;
    });
    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/setpreferences', async (req, res, next) => {
  try {
    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.body.memberId}/setpreferences`,
      method: 'post',
      data: req.body.payload
    }).catch(err => {
      throw err.response.data;
    });
    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});


router.put('/', validator.updateMember, async (req, res, next) => {
  const payload = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { data: { member } } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.loyaltyId}/profile`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    let updateObject = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      cellPhone: payload.cellPhone,
      dob: payload.dob,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      country: payload.country
    };

    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/crmprofiles/${member._id}`,
      method: 'put',
      data: updateObject
    }).catch(err => {
      throw err.response.data;
    });

    const { cognitoUser } = await cognitoGetUser(req, { isReq: true });
    await cognitoUpdateAttributes(
      cognitoUser, {
      firstname: payload.firstName,
      lastname: payload.lastName,
      dob: payload.dob
    }
    );

    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/referral', validator.addReferral, async (req, res, next) => {
  const payload = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { data: { member } } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.loyaltyId}/profile`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    let newReferral = {
      referredMemberContact: payload.email,
      referredMemberHandle: '',
      referredMemberName: payload.name,
      referrer: member._id,
      ext: ''
    };

    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/referrals`,
      method: 'post',
      data: newReferral
    }).catch(err => {
      throw err.response.data;
    });

    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }

});

module.exports = router;