const router = require('express').Router();
const controller = require('../../controllers/ratings');

router.post('/', controller.getRatingByIds);
router.get('/all', controller.getAllRatings);
router.post('/update_score', controller.updateScore);

module.exports = router;
