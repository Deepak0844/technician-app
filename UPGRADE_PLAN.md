# Dependency Upgrade Plan

Status snapshot taken 2026-10-18 from `npm outdated` in `mobile/` and `server/`.
Items marked **(verify)** depend on release notes that have not been read yet.

## Task 1: Mobile (Expo, React Native and other packages)

### Current state
- Expo SDK 55 (`expo` 55.0.25, `react-native` 0.83.4, `react` 19.2.0).
- Latest SDK is 58 (`expo@58.0.14`). SDK 57 is at 57.0.30.
- `mobile/android/` and `mobile/ios/` are gitignored and generated with `expo prebuild`.
- Navigation uses `@react-navigation/*` directly (no expo-router).
- One import of `expo-file-system/legacy`.
- `targetSdkVersion` is 34 in `app.json`, likely too low for Google Play now **(verify)**.

### Rules from the expo-upgrade skill
- Upgrading from SDK 55 or earlier: skip SDK 56, go to 57 or later.
- SDK 55, SDK 56, and `expo` 57.0.8 or below have a Hermes memory regression with `react-native-reanimated` / `react-native-worklets` (both used here). Use `expo@57.0.9` or later.

### Phase 0: Prep
- [ ] Create branch `chore/upgrade-expo-58` from `release/0.0.5` or `develop`.
- [ ] Run `npx expo-doctor` and record the baseline.
- [ ] Smoke test and note what works: login/OTP, dashboard, create customer, add job, change job date, invoice preview and PDF export, notifications, contacts, location, image picker.
- [ ] Confirm a working local dev build (`npm run android` / `npm run ios`). No `eas.json` exists, so builds appear to be local Gradle/Xcode, not EAS.
- [ ] Record baselines (react-native-best-practices): release bundle size (`npx react-native bundle ... --minify true`, then `ls -lh`), cold-start time, and scroll FPS on the job list. Re-measure after each phase.
- [ ] Remove nothing yet; check for `expo.install.exclude` (none found) and a `patches/` dir (none found).

### Phase 1: Patch updates inside SDK 55
- [ ] `npx expo install expo@~55.0.31 && npx expo install --fix`
- [ ] Bump safe minors: `@react-navigation/*` (7.21 / 7.5), `@reduxjs/toolkit` 2.13, `axios` 1.20, `nativewind` 4.2.7, `react-aria` 3.53, `react-stately` 3.51, `@types/react` 19.2.x.
- [ ] Smoke test, then commit (rollback point).

### Phase 2: SDK 55 to 57.0.30
- [ ] `npx expo install expo@57 && npx expo install --fix` (do not hand-edit Expo-pinned versions).
- [ ] `npx expo-doctor`; restore any missing required peer (e.g. `expo-constants`).
- [ ] Read the SDK 56 and 57 changelogs (https://expo.dev/changelog). Review:
  - `expo-file-system/legacy` still exists? **(verify)**
  - `@react-navigation` imports: the expo-router skill says to use `expo-router/react-navigation` instead of `@react-navigation/*` in SDK 56+, but that rule is written for Expo Router apps. This app does not use Expo Router, so direct imports are likely fine **(verify in the SDK 56-58 notes)**.
  - Deprecated packages table: `expo-linear-gradient` is listed as deprecated (CSS gradients via `experimental_backgroundImage`). Not required for the upgrade; track separately.
  - Config plugins: `expo-notifications`, `expo-contacts`, `expo-location`, `expo-image-picker`, `expo-build-properties`.
  - `expo-print` and `expo-sharing` (invoice export).
- [ ] Keep `babel.config.js` (module-resolver, nativewind, worklets plugin) and `metro.config.js` (withNativeWind). Check whether the worklets plugin entry is still required **(verify)**.
- [ ] `npx expo prebuild --clean`, build dev clients for iOS and Android.
- [ ] Full smoke test, focusing on animations, bottom sheet, Reanimated screens.

### Phase 3: SDK 57 to 58.0.14 (latest)
- [ ] Read the SDK 58 release notes first (not covered by the skill).
- [ ] Repeat the Phase 2 steps with `expo@latest`.
- [ ] Optional, separate PR: enable React Compiler (`"experiments": {"reactCompiler": true}`).

### Phase 4: Non-Expo packages (one commit each)

| Package | Current to latest | Plan |
|---|---|---|
| `tailwindcss` | 3.4 to 4.3 | Hold at v3. NativeWind 4 needs Tailwind 3. |
| `nativewind` | 4.2.4 to 4.2.7 | Safe patch. |
| `lucide-react-native` | 0.510 to 1.59 | Check changelog for renamed icons or API changes, fix imports. |
| `@gluestack-ui/core`, `utils` | 3.x to 5.x | `src/components/ui/*` depends on these. Do last, read migration guide. Optional. |
| `tailwind-variants` | 0.1 to 3.3 | Only together with gluestack/Tailwind work. |
| `@babel/core` | 7 to 8 | Hold. Expo's babel preset targets 7. |
| `typescript` | 5.9 to 7.0 | Use the version `expo install` recommends. |
| `eslint` | 9 to 10 | Hold until `eslint-config-expo` supports it. |
| `react-native-calendars` | check | Verify support for the new React Native version. |

### Phase 5: Verify and release
- [ ] `npx expo-doctor`, `npm run lint`, `npx tsc --noEmit`, clean install (`rm -rf node_modules && npm install`).
- [ ] Release builds on both platforms (local Gradle/Xcode, or EAS if you adopt it); test on real devices.
- [ ] Re-run the Phase 0 baselines (bundle size, cold start, FPS) and compare.
- [ ] Android: confirm third-party native libs are 16 KB page-size aligned (react-native-best-practices marks this CRITICAL for Google Play).
- [ ] Raise `targetSdkVersion` to 35 or 36 for Google Play **(verify deadline)**.
- [ ] `expo-updates` is installed but `app.json` has no `updates`/`runtimeVersion` and there is no `eas.json`, so OTA is probably not active. Decide: if unused, drop `expo-updates`; if wanted, run `eas update:configure` (do not hand-write it). If OTA is used, an SDK upgrade needs a new native build first, and SDK 55+ publishing needs `--environment`.
- [ ] Bump versioned Expo docs links in any agent/instruction files.
- [ ] Release hygiene (git-workflow skill): bump app version (currently 0.0.4 / branch release/0.0.5), tag the release, add a human-readable changelog entry.

Rollback: keep Phases 1, 2 and 3 as separate commits/PRs.

## Task 2: Server (Express and packages)

### Current state
- Express already on v5 (5.2.1), ESM, Node 22 locally (22.21.1).
- Everything is a minor/patch update except `dotenv` and `eslint` majors.
- No test script, so a baseline smoke test comes first.

### Phase 0: Prep
- [ ] Create branch `chore/server-deps`.
- [ ] Confirm production Node version; add `"engines": {"node": ">=22"}` to `package.json`.
- [ ] Write a smoke test for `/auth`, `/customers`, `/jobs`, `/dashboard`, file upload (multer), rate limiting, helmet headers. Prefer automated (`node --test` + `supertest`) over manual Postman so it can be re-run after every bump. Run it before any change.
- [ ] Check against nodejs-backend-patterns: a health-check route exists, graceful shutdown closes the server and Mongo connection, CORS is not `*` in production.
- [ ] Note: `package-lock.json` is gitignored in this repo (both `mobile/` and `server/`), so installs are not reproducible and rollback cannot rely on the lockfile. Either commit the lockfiles (recommended, own commit first) or pin exact versions in `package.json`.

### Phase 1: Minor and patch updates (`npm update`)

| Package | Current to target |
|---|---|
| `express` | 5.2.1 to 5.3.0 |
| `express-rate-limit` | 8.3.1 to 8.7.1 |
| `helmet` | 8.1.0 to 8.3.0 |
| `mongoose` | 9.3.2 to 9.11.2 |
| `multer` | 2.1.1 to 2.4.0 |
| `pino` | 10.3.1 to 10.4.0 |
| `pino-pretty` | 13.1.3 to 13.2.0 |
| `zod` | 4.3.6 to 4.6.7 |
| `dotenv` | 17.3.1 to 17.4.2 |
| `eslint` | 9.39.4 to 9.39.5 |

- [ ] Skim changelogs for `mongoose` (8 minors) and `express-rate-limit` (option and header changes).
- [ ] `npm audit`, then the smoke test.

### Phase 2: Majors (separate commits)
- [ ] `dotenv` 18: read release notes first **(verify)**, then bump.
- [ ] `eslint` 10: hold until `eslint.config.js` and plugins support it.

### Phase 3: Verify and deploy
- [ ] `npm run lint`, `npm start`, watch startup logs for deprecation warnings.
- [ ] Test against staging MongoDB, deploy to staging, then production.
- [ ] Rollback: revert the commit and reinstall (works only once lockfiles are committed or versions are pinned, see Phase 0).

## Git workflow for both tasks
- Short-lived branches (`chore/...`), merged within 1-3 days; do not let the SDK upgrade branch live for weeks.
- One commit per phase, and one per major package. Never mix the Expo Router migration (a refactor) into the upgrade branch.
- Commit messages: `chore: <short description>`, short, no Claude attribution trailer (project preference).
- Before each commit: `git diff --staged`, no secrets, `npm run lint`, `npx tsc --noEmit` (mobile).

## Out of scope (separate tasks)
- Migrating to Expo Router (needs `app/` routes, kebab-case files, new entry point; replaces `navigationRef`).
- React Compiler, `expo-linear-gradient` replacement, gluestack v5.

## Suggested order
1. Task 2 (small, low risk).
2. Mobile Phase 1, then 2, then 3, testing and committing after each.
3. Mobile Phase 4, one package at a time.
