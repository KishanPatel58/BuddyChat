# BuddyChat Client

This folder contains the mobile client for BuddyChat, built with **Expo** and **React Native**.

## Prerequisites

- Node.js 18+
- npm
- Expo Go app (optional, for device testing)

## Install dependencies

```bash
npm install
```

## Run the app

```bash
npm run start
```

You can also run platform-specific commands:

```bash
npm run android
npm run ios
npm run web
```

## Lint

```bash
npm run lint
```

## Project structure

- `app/` – App routes and screens (Expo Router)
- `components/` – Reusable UI components
- `constants/` – Shared constants and theme values
- `assets/` – Images, fonts, and static resources
- `utils/` – Utility helpers
- `types/` – Shared TypeScript types

## Notes

- Entry point is configured as `expo-router/entry` in `package.json`.
- If needed, use `npm run reset-project` to reset the starter project structure.
