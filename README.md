# 🎲 IBI Dice Roller

A two-player push-your-luck dice game, built with Next.js. Roll and bank points round by round — but roll double sixes and your round score busts back to zero. Play head-to-head with a friend over Google Sign-In, or go solo against a built-in AI opponent.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)

## Features

- 🎲 **Push-your-luck dice game** — roll to accumulate a round score, hold to bank it, but two 6s in a single roll wipes the round back to zero
- 🔐 **Google Sign-In** for both players, via Firebase Auth
- 🤖 **Solo mode against an AI opponent** with a fixed hold-at-20 strategy
- 🔊 **Procedurally-generated sound effects**, with a persistent mute toggle
- 🏆 **Win tracking** — game outcomes persist to MongoDB, so tallies survive a refresh

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev) + TypeScript
- CSS Modules for styling (no CSS frameworks)
- [Firebase Authentication](https://firebase.google.com/docs/auth) for Google Sign-In
- [MongoDB](https://www.mongodb.com) for persisting win tallies

## Getting Started

### Prerequisites

- Node.js 20+
- A [Firebase](https://console.firebase.google.com) project with Google Sign-In enabled
- A MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/DavidMarom/ibi-test.git
cd ibi-test
npm install
```

### Environment variables

Create a `.env.local` in the project root:

```bash
# Firebase client config (used by the browser for Google Sign-In)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Server-side Firebase project id (used to verify ID tokens)
PROJECT_ID=your-project-id

# MongoDB connection string (used to persist win tallies)
MONGO_URI=your-mongodb-connection-string
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
```

## How to play

1. Sign in with Google (both players sign in on the same screen, or one player picks "Play vs AI").
2. On your turn, **Roll** to add to your round score, or **Hold** to bank the round score into your total and pass the turn.
3. Roll double sixes and your round score busts to zero — the turn passes immediately.
4. First player to bank enough points to reach the winning score takes the game.
