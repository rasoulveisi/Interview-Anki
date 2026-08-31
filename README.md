# AnkiDroid Web - Spaced Repetition Flashcards & Senior Interview Suites

A mobile-first Anki-style spaced repetition flashcard application with real-time Firebase cloud synchronization, custom deck builder, SM-2 review engine, offline support, and full Senior Frontend & Full-Stack interview mastery decks.

---

## 🚀 How to Run Locally on Port 3000

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: Node 20+)
- **npm** or **pnpm** / **yarn**

---

### 2. Clone or Download the Project
Ensure you are in the root directory of this project:

```bash
cd path/to/project
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Start the Local Development Server

```bash
npm run dev
```

The app is pre-configured with `"dev": "vite --port=3000 --host=0.0.0.0"`.

Once started, open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server on **port 3000** (`http://localhost:3000`) |
| `npm run build` | Builds the production bundle into `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## ☁️ Environment & Firebase Configuration

- The app includes built-in offline fallback with local state persistence (`localStorage`).
- If you wish to use Firebase Cloud Sync, verify the Firebase config in `src/firebase.ts` or set your environment variables if using custom Firebase projects.
