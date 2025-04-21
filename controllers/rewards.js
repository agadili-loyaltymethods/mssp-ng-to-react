const router = require('express').Router();
const axios = require('axios');
const logger = require('log4js').getLogger();
const { validationResult } = require('express-validator');

const { validator } = require('./../utils');
const config = require('./../config');

router.get('/wallet', async (req, res, next) => {
  try {
    const { data: { member } } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.loyaltyId}/profile`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    if (!member) {
      let error = new Error('Invalid loyaltyId');
      error.status = 400;
      throw error;
    }

    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/members/${member._id}/offers?filter=rewards,offers`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/available', async (req, res, next) => {
  try {
    const { data: { member } } = await axios({
      url: `${config.REST_URL}/api/v1/members/${req.loyaltyId}/profile`,
      method: 'get'
    });

    if (!member) {
      let error = new Error('Invalid loyaltyId');
      error.status = 400;
      throw error;
    }

    const currentDate = new Date().toISOString();
    const query = {
      intendedUse: "Reward",
      program: { "$in": [member.program] },
      expirationDate: { "$gte": currentDate },
      effectiveDate: { "$lte": currentDate }
    };

    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/rewardpolicies?query=${JSON.stringify(query)}`,
      method: 'get'
    }).catch(err => {
      throw err.response.data;
    });

    return res.json(data);
  } catch (err) {
    logger.error(err);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/buy', validator.buyReward, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { date, rewardName } = req.body;
    const payload = {
      type: "Redemption",
      date: date,
      srcChannelType: "Mobile",
      loyaltyID: req.loyaltyId,
      couponCode: rewardName,
    };

    const { data } = await axios({
      url: `${config.REST_URL}/api/v1/activity`,
      method: 'post',
      data: payload
    }).catch(err => {
      throw err.response.data;
    });

    return res.json(data);
  } catch (err) {
    logger.error(err);
    let error = err.errors ? err.errors[0] : err;
    return res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;