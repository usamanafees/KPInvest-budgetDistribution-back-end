const router = require('express').Router();
// Route for users
router.use('/user', require('./user'));

// Route for teams
router.use('/teams', require('./teams'));

// Route for settings
router.use('/settings', require('./settings'));

// Route for settings
router.use('/feedback', require('./comments'));

// Route for ratings
router.use('/rating', require('./ratings'));

module.exports = router;
