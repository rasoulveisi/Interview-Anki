# Interview Anki - Spaced Repetition & Senior Interview Suites

A mobile-first Anki-style spaced repetition flashcard application with real-time Firebase cloud synchronization, custom deck builder, SM-2 review engine, offline support, and 27 Senior Frontend & Full-Stack interview mastery decks.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: Node 20+)
- **npm**, **pnpm**, or **bun**

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 How to Take Full Control & Ownership (Your Own Firebase & Google Console)

When a project is created via AI Studio, it uses a shared sandbox Firebase instance. Follow these steps to connect the app to your **own Firebase & Google Cloud account** for 100% control over users, database, security rules, and hosting.

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**), enter a name (e.g. `my-interview-anki`), and complete the wizard.

### Step 2: Register a Web App
1. In your Firebase project dashboard, click the **Web icon (`</>`)** to add a web application.
2. Enter an app nickname (e.g. `interview-anki-web`) and click **Register app**.
3. Firebase will show your `firebaseConfig` object with:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 3: Enable Authentication Providers
1. In the Firebase sidebar, go to **Build** -> **Authentication** -> **Get Started**.
2. Under the **Sign-in method** tab:
   - Enable **Google**: Click Google, enable it, select your project support email, and save.
   - Enable **Anonymous**: Click Anonymous, enable it, and save (for guest study mode).
3. Under **Settings** -> **Authorized domains**, make sure `localhost` is listed (add your production custom domain here when deployed).

### Step 4: Enable Cloud Firestore Database
1. In the sidebar, go to **Build** -> **Firestore Database** -> **Create database**.
2. Choose your preferred region and start in **Production mode**.
3. Go to the **Rules** tab in Firestore and paste the contents of `firestore.rules` from this repository:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isOwner(userId) {
         return request.auth != null && request.auth.uid == userId;
       }

       match /users/{userId} {
         allow read, write: if isOwner(userId);

         match /decks/{deckId} {
           allow read, write: if isOwner(userId);
         }

         match /cards/{cardId} {
           allow read, write: if isOwner(userId);
         }

         match /reviews/{reviewId} {
           allow read, write: if isOwner(userId);
         }
       }
     }
   }
   ```
4. Click **Publish**.

### Step 5: Configure Local Environment Variables
Create a file named `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
VITE_FIREBASE_MEASUREMENT_ID=G-...
```

Restart your dev server:
```bash
npm run dev
```

Your app is now completely connected to your own private Google Cloud / Firebase project!

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server on `http://localhost:3000` |
| `npm run build` | Builds the production bundle into `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans build artifacts |

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
4. Under **Authentication** -> **Sign-in method**, ensure **Google** and **Anonymous** are enabled.

### 3. Offline / Local Fallback
- If you do not sign in, the app automatically runs in **Anonymous / Local Mode**.
- All decks, cards, review logs, and SM-2 calculations are saved directly to `localStorage` and will sync to the cloud whenever you sync or sign in.

---

## 📱 Progressive Web App (PWA) & Offline Mode

AnkiDroid Web is configured with full **PWA (Progressive Web App)** compliance and Service Worker offline caching via `vite-plugin-pwa`:

- **Installable Application**:
  - On **Desktop & Android (Chrome/Edge/Brave)**: Click the **"Install App"** button in the top navigation bar or banner to install AnkiDroid as a native desktop/mobile window.
  - On **iOS (Safari on iPhone/iPad)**: Tap **Share** -> **"Add to Home Screen"** for full-screen offline practice.
- **Offline Service Worker**:
  - Precaches all application bundles, CSS, HTML, and web fonts.
  - Reviews and cards are completely usable without an active internet connection.
  - When reconnected, data syncs with your Firebase Cloud Firestore backend.


