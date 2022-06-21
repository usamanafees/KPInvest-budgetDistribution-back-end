const router = require('express').Router();
const controller = require('../../controllers/teams');

router.get('/', controller.getAllTeams);
router.post('/addTeam', controller.addTeam);
router.put('/updateTeam/:id', controller.editTeam);
router.delete('/deleteTeam/:id', controller.deleteTeam);
module.exports = router;