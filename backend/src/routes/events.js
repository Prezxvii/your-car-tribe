const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// 1. GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ 'date.fullDate': 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CREATE a new event
router.post('/', async (req, res) => {
  try {
   
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. POST RSVP (The "I'm Going" Toggle)
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Toggle attendance
    const userIndex = event.attendeesList.indexOf(userId);
    let joined = false;

    if (userIndex > -1) {
      event.attendeesList.splice(userIndex, 1);
    } else {
      event.attendeesList.push(userId);
      joined = true;
    }

    event.attendeesCount = event.attendeesList.length;
    await event.save();

    res.json({ 
      attendeesCount: event.attendeesCount, 
      isJoined: joined 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE an event (Scrub from Dossier)
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

   

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event successfully scrubbed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;