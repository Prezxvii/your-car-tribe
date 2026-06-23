const express = require('express');
const router = express.Router();
const Mechanic = require('../models/Mechanic');
const jwt = require('jsonwebtoken');

// GET ALL MECHANICS
router.get('/all', async (req, res) => {
  try {
    const shops = await Mechanic.find().sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expert directory' });
  }
});

// SUBMIT A NEW MECHANIC SHOP
router.post('/submit', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Please sign in to add a shop.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, specialty, location, phone, about, services, projects } = req.body;

    const newShop = new Mechanic({
      name,
      specialty,
      location,
      phone,
      about,
      services: services ? services.split(',').map(s => s.trim()) : [],
      projects: projects ? projects.split(',').map(p => p.trim()) : [],
      submittedBy: decoded.id
    });

    await newShop.save();
    res.status(201).json({ success: true, shop: newShop });
  } catch (err) {
    res.status(500).json({ error: 'Server validation failed', message: err.message });
  }
});

module.exports = router;