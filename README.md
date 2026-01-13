# YourCarTRIBE

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black)
![Render](https://img.shields.io/badge/Backend-Render-purple)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

YourCarTRIBE is a full-stack community platform built for automotive enthusiasts. Whether you are into JDM, Euro, or Muscle cars, or you enjoy track days and local meets, the platform connects drivers with experts, events, and each other in one centralized experience.

---

## Features

### Enthusiast Onboarding
- Multi-step onboarding flow to capture driving experience, vehicle interests, and community preferences
- Tribe selection (JDM, Euro, Muscle) to personalize feeds and recommendations
- Persistent authentication state across sessions

---

### Homepage
- Fully responsive layout across mobile, tablet, and desktop
- Fixed hamburger menu behavior at all breakpoints
- Authentication-aware navigation:
  - Logged-out users see Join Tribe / Sign In
  - Logged-in users see Welcome {user} and Sign Out
- Navigation label updated from Marketplace to Experts

---

### License / Driver Profile
- Working photo upload with preview support
- Editable Know-Whats section
- Removed non-functional Driver Settings icon
- Driver Settings separated into clear categories:
  - Vehicle Types: JDM, Euro, Muscle
  - Events: Track Days, Cars and Coffee, Night Drives

---

### Marketplace & Experts
- Expert directory for connecting with mechanics and specialists
- Vehicle and parts listings
- Improved proximity dropdown with custom styling
- Added listing fields:
  - Transmission Type
  - Listing Title
- Seller description template that auto-populates from listing data
- Testimonials section showcasing recommended sellers and experts

---

### Events
- Location displayed directly on event thumbnails
- Support for multiple YouTube links per event
- Full-size image viewing for uploaded photos
- Improved Tech Documents section with separated photo previews
- Highlights text box styled consistently with the rest of the UI

---

### Admin Portal & Security
- Admin Portal is restricted to admin users only
- Non-admin users cannot access admin routes
- Direct URL access is blocked and automatically redirects to the homepage
- Role-based route protection enforced on both frontend and backend

---

## Performance & UI
- Responsive, dark-themed interface optimized for usability
- Smooth animations using Framer Motion
- Real-time auth state synchronization using React hooks and localStorage listeners

---

## Tech Stack

### Frontend
- React.js
- Framer Motion
- Lucide React
- CSS3 (custom variables, mobile-first)

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- CORS configuration for cross-origin deployments

---

## Deployment
- Frontend deployed on Vercel
- Backend deployed on Render
shooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
