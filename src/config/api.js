// src/config/api.js

// Dynamically determine backend URL based on where the app is running
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000' // Your active local backend port (change to 10000 if needed)
  : 'https://your-car-tribe.onrender.com'; // Production deployment