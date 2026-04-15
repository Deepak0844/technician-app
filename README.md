# Technician App

A full-stack mobile application for field technicians to manage service jobs, customers, invoices, and schedules — built with **React Native (Expo)** and **Node.js/Express**.

---

## Tech Stack

### Mobile (`/mobile`)

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | React Native 0.83 via **Expo SDK 55**           |
| Navigation    | React Navigation 7 (native-stack + bottom-tabs) |
| State         | Redux Toolkit + RTK Query                       |
| Persistence   | expo-secure-store (token + theme)               |
| Styling       | NativeWind 4 (Tailwind CSS) + Gluestack UI      |
| Notifications | expo-notifications                              |
| Location      | expo-location                                   |
| Invoices      | expo-print + expo-sharing                       |

### Server (`/server`)

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js (ES Modules)               |
| Framework  | Express 5                          |
| Database   | MongoDB via Mongoose 9             |
| Auth       | JWT (jsonwebtoken) + OTP (2Factor) |
| Validation | Zod 4                              |
| Security   | Helmet, CORS, express-rate-limit   |
| Logging    | Pino + pino-pretty                 |

---

## Project Structure

```
technician-app/
├── mobile/                   # React Native (Expo) app
│   ├── src/
│   │   ├── components/       # Reusable UI & feature components
│   │   ├── config/           # API base URL configuration
│   │   ├── constants/        # Route names, colors, API tags
│   │   ├── hooks/            # Custom hooks (location, theme, job submission)
│   │   ├── navigation/       # App navigator, auth stack, main tabs
│   │   ├── screens/          # All app screens
│   │   ├── services/         # RTK Query API slices (auth, customer, job, dashboard)
│   │   ├── store/            # Redux store & slices (auth, theme)
│   │   └── utils/            # Formatting, export, notification, storage helpers
│   ├── assets/               # Icons, splash screens
│   ├── android/              # Native Android project (auto-generated via prebuild)
│   └── app.json              # Expo configuration
│
├── server/                   # Express API server
│   ├── bin/www.js            # HTTP server entry point
│   ├── app.js                # Express app setup (middleware, routes)
│   ├── config/               # DB connection & environment variable loader
│   ├── constants/            # HTTP status codes & general constants
│   ├── controllers/          # Route controllers (auth, customer, job, dashboard)
│   ├── middlewares/          # Auth, validation, async handler
│   ├── models/               # Mongoose models (User, Customer, Job)
│   ├── routes/               # Express route definitions
│   ├── schemas/              # Zod validation schemas
│   ├── services/             # Business logic layer
│   └── utils/                # Error, response, token, & logging utilities
│
├── DEPLOYMENT.md             # Production deployment guide
└── README.md                 # ← You are here
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Expo CLI** (`npx expo`)
- **Android Studio** (for Android emulator/builds) or a physical device
- A [2Factor.in](https://2factor.in/) API key for OTP authentication

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/technician-app.git
cd technician-app
```

### 2. Server Setup

```bash
cd server
npm install
```

Create an environment file at `server/.env` (or `server/env/.env`):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
JWT_SECRET=your_random_secure_string
JWT_EXPIRES_IN=7d
TWOFACTOR_API_KEY=your_2factor_api_key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,exp://localhost:8081
```

Start the development server:

```bash
npm run dev          # nodemon with hot-reload
# or
npm start            # plain node
```

The API will be available at `http://localhost:3000/api/v1`.

### 3. Mobile Setup

```bash
cd mobile
npm install
```

The dev URL is resolved automatically from the Expo server — no manual IP needed. For production, create `mobile/.env` with your deployed server URL:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-server.com/api/v1
```

> Keep `mobile/.env` out of version control — it contains your private backend URL.

Start the Expo dev server:

```bash
npm start            # expo start --dev-client
```

Run on a device/emulator:

```bash
npm run android      # expo run:android
npm run ios          # expo run:ios
```

---

## Available Scripts

### Server (`/server`)

| Script  | Command                | Description                |
| ------- | ---------------------- | -------------------------- |
| `dev`   | `nodemon ./bin/www.js` | Dev server with hot-reload |
| `start` | `node ./bin/www.js`    | Production server          |
| `lint`  | `eslint .`             | Lint server code           |

### Mobile (`/mobile`)

| Script              | Command                                                  | Description                     |
| ------------------- | -------------------------------------------------------- | ------------------------------- |
| `start`             | `expo start --dev-client`                                | Start Expo dev server           |
| `android`           | `expo run:android`                                       | Run on Android                  |
| `android-prebuild`  | `prebuild:android && expo run:android`                   | Prebuild + run Android          |
| `android-release`   | `prebuild:android && expo run:android --variant release` | Release build on device         |
| `android-build:apk` | `cd android && ./gradlew assembleRelease`                | Build release APK               |
| `android-build:aab` | `cd android && ./gradlew bundleRelease`                  | Build release AAB (Play Store)  |
| `ios`               | `expo run:ios`                                           | Run on iOS                      |
| `prebuild:android`  | `expo prebuild -p android`                               | Generate native Android project |
| `prebuild:ios`      | `expo prebuild -p ios`                                   | Generate native iOS project     |
| `lint`              | `expo lint`                                              | Lint mobile code                |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint            | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/`                 | Health check (root)        |
| GET    | `/api/v1/health`    | API health status          |
| POST   | `/api/v1/auth/...`  | Authentication (OTP login) |
| GET    | `/api/v1/customers` | Customer management        |
| GET    | `/api/v1/jobs`      | Job management             |
| GET    | `/api/v1/dashboard` | Dashboard statistics       |

---

## Key Features

- **OTP-based Authentication** — Passwordless login via SMS OTP (2Factor.in)
- **Job Management** — Create, edit, view, and track service jobs with timelines
- **Customer Management** — Customer CRUD with contact import from device
- **Invoice Generation** — PDF invoices via expo-print with share support
- **Calendar View** — Visualize scheduled jobs on a calendar
- **Push Notifications** — Reminders for upcoming jobs
- **Location Capture** — Capture technician location per job
- **Dark/Light Theme** — Toggle via system or manual preference
- **Dashboard** — At-a-glance stats (jobs, revenue, pending)

---

## Environment Variables Reference

### Server

| Variable            | Required | Default       | Description                          |
| ------------------- | -------- | ------------- | ------------------------------------ |
| `PORT`              | No       | `3000`        | Server listening port                |
| `MONGODB_URI`       | Yes      | —             | MongoDB connection string            |
| `JWT_SECRET`        | Yes      | —             | Secret key for JWT signing           |
| `JWT_EXPIRES_IN`    | No       | `7d`          | Token expiration duration            |
| `TWOFACTOR_API_KEY` | Yes      | —             | 2Factor.in API key for OTP           |
| `NODE_ENV`          | No       | `development` | Environment mode                     |
| `ALLOWED_ORIGINS`   | No       | —             | Comma-separated CORS allowed origins |

---

## License

ISC
