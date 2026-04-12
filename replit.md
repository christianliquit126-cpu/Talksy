# Talksy - Gen Z Social Chat App

## Overview
Talksy is a real-time Gen Z social chat app built with React 18 + Vite, Firebase, and Cloudinary. Inspired by Litmatch. Dark mode always-on with purple/pink/blue gradients.

## Tech Stack
- **Frontend**: React 18 + Vite (port 5000)
- **Styling**: Tailwind CSS with custom dark design system (glassmorphism, gradients)
- **Backend**: Firebase v10 (Auth, Firestore)
- **Media**: Cloudinary (photo/video uploads)
- **Routing**: React Router v6

## Design System
- **Background**: `#0d0d1a` always-on dark
- **Gradient**: `linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)` (violet → pink)
- **Cards**: glassmorphism `rgba(255,255,255,0.04)` bg + `rgba(255,255,255,0.08)` border
- **Font**: Inter (body) + Poppins (display/headings)
- Dark class is set on `<html>` in `main.jsx`

## Features
1. **Landing Page** — hero with animated chat preview, feature grid, mood chips
2. **Random Chat** — matchmaking queue, anonymous 1-on-1, like/match system, typing indicator, Next button
3. **Private Messaging** — real-time private 1-on-1 with unread counts, online status
4. **User Discovery** — filter by country, gender, online status
5. **Moments Feed** — Instagram-style posts with likes/comments
6. **Profile Setup** — random username generator, IP-based country detection, birthday/age calc
7. **Auth** — Google, Facebook, Email/Password, Guest (anonymous)
8. **Dashboard** — online users, mood selector, quick actions, recent chats

## Routing
- `/` → LandingPage (unauthed) or redirect to `/dashboard`
- `/auth` → AuthPage
- `/setup` → SetupProfilePage
- `/dashboard` → DashboardPage (home)
- `/random` → RandomChatPage
- `/chat` → ChatPage (conversations list)
- `/chat/:chatId` → ChatPage (with selected conversation)
- `/users` → UsersPage (discover)
- `/moments` → MomentsPage
- `/profile` → ProfilePage
- `/profile/:userId` → UserProfilePage
- `/settings` → SettingsPage
- `/private/:userId` → PrivateChatPage

## Firestore Collections
- `users/{uid}` — user profiles (displayName, country, age, gender, bio, online, etc.)
- `conversations/{chatId}` — private chat metadata (lastMessage, unread counts)
- `conversations/{chatId}/messages/{id}` — private messages
- `globalChat/{id}` — global chat messages
- `moments/{id}` — moments/posts
- `randomQueue/{uid}` — matchmaking queue for random chat
- `randomChats/{chatId}` — random chat rooms (liked map, participants)
- `randomChats/{chatId}/messages/{id}` — random chat messages
- `randomTyping/{chatId}_{uid}` — typing indicators for random chat
- `privateTyping/{docId}` — typing indicators for private chat
- `reports/{id}` — user reports

## Random Chat Architecture
- `chatId = [uid1, uid2].sort().join('_rc_')`
- Queue: user is added to `randomQueue/{uid}`, listener waits for `randomChats` match
- Match: first user creates chat doc, removes both from queue
- Like/Match: `liked` map on chat doc; popup shown when both like each other
- Typing: `randomTyping/{chatId}_{uid}` document with `typing: bool`

## Setup Required
Copy `.env.example` to `.env` and fill in:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Also enable in Firebase Console:
- Authentication: Google, Facebook, Email/Password, Anonymous
- Add Replit domain to Firebase Auth authorized domains
- Deploy `firestore.rules`
