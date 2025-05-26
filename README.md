# MedBlock Registry

A **frontend-only** patient registration app powered by **PGlite**, designed to register, query, and manage patient records entirely in the browser — with support for **SQL queries**, **data persistence**, and **multi-tab synchronization**.

## 🚀 Live Demo

[👉 View Deployed App on Vercel](https://your-vercel-deployment-url.vercel.app)

---

## 📌 Task Overview

This project was developed as a solution for the following requirements:

- [x] Build a **frontend-only** patient registration app using **PGlite**.
- [x] Allow users to:
  - Register new patients
  - Run raw SQL queries to retrieve patient data
- [x] Ensure patient data is:
  - **Persisted across page refreshes**
  - **Synchronized across multiple browser tabs**
- [x] Each feature was committed separately with clear git history.
- [x] This repository contains **setup & usage instructions**.
- [x] Project is **deployed publicly** via [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
- [x] Development challenges are documented below.

---

## 🧠 Features

- ✅ Register new patient details via form
- ✅ Search patients with raw SQL input
- ✅ Data persistence using [`idb://` PGlite backend](https://electric-sql.com/docs/pglite)
- ✅ Real-time sync between browser tabs
- ✅ Modular and clean codebase
- ✅ Modern React + Vite setup

---

## 📦 Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [PGlite](https://electric-sql.com/docs/pglite) (in-browser PostgreSQL)
- [Tailwind CSS](https://tailwindcss.com/) (optional, if used)
- [Vercel](https://vercel.com/) for deployment

---

## 🛠️ Getting Started

### Prerequisites

- Node.js ≥ 18
- Git

### Clone the Repo

```
git clone https://github.com/sethjiii/MedBlock-Registry.git
cd MedBlock-Registry
```

⚠️ Challenges Faced

- PGlite browser bundling errors:
  Encountered Invalid FS bundle size issue during setup. Solved it by:

- Adding this to vite.config.js:
```
optimizeDeps: { exclude: ['@electric-sql/pglite'] },
worker: { format: 'es' },
```
- Ensured all imports were using ESM-compatible format.
- Cross-tab sync:
  PGlite automatically supports synchronization when using the same idb:// URL, but we had to ensure a singleton DB instance across the app.

- Folder Structure
 ```
 src/
├── components/       # React components
├── db/               # PGlite integration logic
├── pages/            # Main app views
├── utils/            # Helpers
└── main.tsx          # App entry
```
