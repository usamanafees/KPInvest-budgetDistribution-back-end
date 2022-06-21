const router = require('express').Router();
const controller = require('../../controllers/comments');

router.get('/', controller.getAllComments);
router.post('/sendFeedback', controller.sendFeedback);

module.exports = router;
