const router = require('express').Router();
const controller = require('../../controllers/settings');

router.get('/bonus_pool/:id', controller.getBonusPoolById);
router.put('/update_bonus/:id', controller.updateBonusPool);

module.exports = router;
