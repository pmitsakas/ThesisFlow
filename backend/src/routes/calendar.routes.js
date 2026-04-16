const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, calendarController.getMyEvents);
router.get('/dissertation/:dissertationId', protect, calendarController.getDissertationEvents);
router.post('/', protect, calendarController.createEvent);
router.patch('/:id/respond', protect, calendarController.respondToEvent);
router.patch('/:id/complete', protect, calendarController.completeEvent);
router.delete('/:id', protect, calendarController.deleteEvent);

module.exports = router;