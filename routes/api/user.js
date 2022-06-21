const router = require('express').Router();
const controller = require('../../controllers/user');

// API to add user
router.post('/login', controller.login);
router.post('/addUser', controller.addUser);
router.post('/bulkaddUsers', controller.bulkaddUsers);
router.get('/', controller.getAllUsers)
router.post('/', controller.getPaginatedUsersWithSearch);
router.get('/:id', controller.getUserById);
router.get('/link/:link', controller.getUserByLink);
router.put('/updateUser/:id', controller.updateUser);
router.post('/bulkUpdate', controller.bulkUpdateUsers);
router.post('/filtered_score', controller.filteredScore);
router.delete('/:id', controller.deleteUser);

module.exports = router;