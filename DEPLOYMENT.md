# Deployment Guide — Technician Application

This document provides the steps to move from local development to a live production environment.

---

## 1. Backend Deployment (Node.js/Express)

Your server is ready to be hosted on platforms like **Vercel**, **Render**, or **Railway**.

### Prerequisites

- A MongoDB Atlas connection string (`MONGODB_URI`).
- A JWT secret key for authentication (`JWT_SECRET`).
- A 2Factor.in API key for OTP authentication (`TWOFACTOR_API_KEY`).

### Environment Variables

Set **all** of the following on your hosting platform:

| Variable            | Required | Example                             |
| ------------------- | -------- | ----------------------------------- |
| `PORT`              | No       | `3000` (host usually provides this) |
| `MONGODB_URI`       | Yes      | `mongodb+srv://...`                 |
| `JWT_SECRET`        | Yes      | `your_random_secure_string`         |
| `JWT_EXPIRES_IN`    | No       | `7d`                                |
| `TWOFACTOR_API_KEY` | Yes      | `your_2factor_api_key`              |
| `NODE_ENV`          | Yes      | `production`                        |
| `ALLOWED_ORIGINS`   | No       | `https://your-frontend.com`         |

### Steps for [Render](https://render.com)

1. **New Web Service**: Connect your GitHub repository.
2. **Build Settings**:
   - Runtime: `Node`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node ./bin/www.js`
3. **Environment Variables**: Add the variables listed above in the Render dashboard.

### Steps for [Vercel](https://vercel.com)

1. Import your GitHub repository into Vercel.
2. Set the **Root Directory** to `server`.
3. Add all environment variables in the Vercel project settings.
4. Deploy — Vercel will auto-detect the Node.js project.

### Verify Deployment

After deploying, test the health endpoint:

```bash
curl https://your-deployed-url.com/api/v1/health
# Expected: {"status":"ok","message":"Server is healthy"}
```

---

## 2. Mobile Deployment (Local Automated Build)

### Set the Production API URL

The production URL is read from an environment variable — never hardcoded. Create `mobile/.env` and set:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-server.com/api/v1
```

Make sure `mobile/.env` is listed in `.gitignore` so it is never committed.

### Generating Native Folders

Run the prebuild command to sync your `app.json` configuration into native code:

```bash
cd mobile
npm run prebuild:android
npm run prebuild:ios
```

### Build for Android (Local Binaries)

- **Build APK (Side-loading)**:
  `npm run android-build:apk`
- **Build AAB (Play Store)**:
  `npm run android-build:aab`
- **Release on device**:
  `npm run android-release`

Output locations:

- APK → `android/app/build/outputs/apk/release/`
- AAB → `android/app/build/outputs/bundle/release/`

### Build for iOS (Local IPA)

1. Run `npm run prebuild:ios`.
2. Open the `/ios` folder in **Xcode**.
3. Select your team under **Signing & Capabilities**.
4. Select `Product` → `Archive` to generate your IPA.

---

## 3. Production Checklist

### Database Security

- Ensure your MongoDB Atlas **Network Access** IP Whitelist includes `0.0.0.0/0` (if using Render/Vercel) or your specific server IPs.
- Enable **authentication** and use a strong database password.

### API URL Sync

- Confirm `mobile/src/config/apiConfig.js` points to your **live backend URL** for production builds.
- Confirm `ALLOWED_ORIGINS` on the server includes your mobile app's origin (or leave it unset to allow mobile clients with no `Origin` header).

### Final Verification

- [ ] Run `npm run lint` in both `mobile/` and `server/` directories.
- [ ] Test OTP login end-to-end on the live server.
- [ ] Verify job creation, editing, and status updates.
- [ ] Verify dashboard stats update correctly (including paid/unpaid).
- [ ] Test PDF invoice generation and sharing on a real device.
- [ ] Confirm push notifications arrive for scheduled reminders.

---

## 4. Branding Assets

Replace the following files in `mobile/assets/` with your custom branding:

| File                | Purpose                       |
| ------------------- | ----------------------------- |
| `icon.png`          | App icon (1024×1024)          |
| `adaptive-icon.png` | Android adaptive icon         |
| `splash-icon.png`   | Splash screen logo            |
| `splash.png`        | Full splash screen background |

After replacing, run `npm run prebuild:android` and/or `npm run prebuild:ios` to regenerate native assets.
