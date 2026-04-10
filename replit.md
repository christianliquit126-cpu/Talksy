# Talksy - Global Chat Platform

## Overview
Talksy is a full-featured global chat platform built with React 18 + Vite, Firebase, and Cloudinary.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Firebase v10 (Auth, Firestore)
- **Media**: Cloudinary (photo/video uploads)
- **Routing**: React Router v6

## Features
1. User Authentication (Google, Facebook, Email, Guest)
2. Global Public Chat Room (real-time)
3. Private 1-on-1 Messaging
4. Moments / Feed (Instagram-style with stories, posts, likes, comments)
5. Users Discovery with filters (country, gender, online status)
6. Profile Pages with edit, cover photo, avatar upload
7. Message Translation (Google Translate API)
8. Typing indicators and online/offline status
9. Media uploads via Cloudinary (images + videos)
10. Report & Block users
11. Settings (password change, dark mode, notifications)
12. Responsive design with bottom navigation (mobile) + sidebar (desktop)

## Project Structure
```
src/
  components/     # Reusable UI components
  contexts/       # React contexts (AuthContext)
  pages/          # Page-level components
  utils/          # Helpers (cloudinary, translate, formatters, countries)
  firebase.js     # Firebase initialization
  App.jsx         # Router & App entry
  main.jsx        # React entry point
  index.css       # Global styles + Tailwind
```

## Environment Variables Required
See `.env.example` for all required environment variables.

Firebase config variables:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Cloudinary:
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_UPLOAD_PRESET

## Firestore Collections
- `users` - User profiles
- `globalChat` - Global chat room messages
- `globalTyping` - Typing status for global chat
- `privateChats/{chatId}/messages` - Private chat messages
- `conversations` - Conversation metadata
- `privateTyping` - Typing status for private chats
- `moments` - Posts/moments feed
- `reports` - User reports

## Running Locally
1. Copy `.env.example` to `.env` and fill in your Firebase + Cloudinary credentials
2. `npm install`
3. `npm run dev`

## Deployment
Compatible with Vercel. Set all environment variables in your Vercel project settings.
