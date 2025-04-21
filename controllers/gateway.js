const router = require('express').Router();

router.use('/rewards', require('./rewards'));
router.use('/member', require('./member'));
router.use('/utils', require('./utils'));

module.exports = router;