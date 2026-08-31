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

## 🔐 OAuth & Google Sign-In on localhost:3000

The application uses **Firebase Authentication** (`signInWithPopup` with `GoogleAuthProvider`) alongside seamless **Anonymous/Offline Authentication**:

### 1. Default Behavior on `localhost:3000`
- Firebase Authentication has `localhost` pre-configured in its **Authorized Domains** list by default.
- When running locally at `http://localhost:3000`, clicking **"Sign in with Google"** opens the Google OAuth popup and connects directly to your Firebase Firestore sync.

### 2. If using your own Firebase Project
If you connect your own custom Firebase project via `firebase-applet-config.json` or environment variables:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Go to **Authentication** -> **Settings** -> **Authorized domains**.
3. Ensure `localhost` is listed (it is added automatically by default upon project creation).
4. Under **Authentication** -> **Sign-in method**, ensure **Google** is enabled.

### 3. Offline / Local Fallback
- If you do not sign in, the app automatically runs in **Anonymous / Local Mode**.
- All decks, cards, review logs, and SM-2 calculations are saved directly to `localStorage` and will sync to the cloud whenever you sign in.
