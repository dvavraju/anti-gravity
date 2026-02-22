# Wardrobe Management — Codebase Context

> A full-stack AI-powered wardrobe assistant that helps you pick daily outfits based on occasion, powered by Google Gemini.

---

## 1. Project Overview

| Property | Detail |
|---|---|
| **App Name** | Wardrobe Management |
| **Repo** | `dvavraju/anti-gravity` on GitHub |
| **Stack** | **Mobile**: React Native (Expo/TypeScript) \| **Web**: React 19 (Vite) \| **API**: Node.js/Express \| **DB**: SQLite |
| **AI** | Google Gemini (`gemini-flash-latest`) via `@google/generative-ai` |
| **Auth** | JWT-based authentication (Sign-up, Login, Protected Routes) |
| **Deployment** | **Backend**: Railway (Cloud) \| **Mobile**: EAS (Android APK) \| **Web**: Docker/Local |
| **Cloud URL** | `https://wardrobe-api-production-9d77.up.railway.app` |

---

## 2. Repository Structure

```
anti-gravity/
├── mobile/               # React Native (Expo Router) Mobile App
│   ├── app/                    # Screens & Routes (Tabs, Login, Add Item)
│   ├── components/             # Native UI components
│   ├── context/                # AuthContext (JWT session management)
│   └── lib/                    # API client (fetch wrapper)
│
├── client/               # React web frontend (Vite + TypeScript)
│   └── src/
│       ├── components/         # Web UI components
│       └── App.tsx             # Web root entry
│
├── server/               # Express backend (TypeScript)
│   └── src/
│       ├── db/                 # SQLite & Database migrations
│       ├── middleware/         # Auth & JWT guards
│       ├── routes/             # REST Endpoints (Auth, Wardrobe, AI)
│       └── services/           # Gemini AI service logic
│
├── Dockerfile            # Multi-stage Docker build for Web/API
└── package.json          # Root scripts
```

---

## 3. Data Model

### `WardrobeItem` (TypeScript type — `types/wardrobe.ts`)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier (UUID or Timestamp) |
| `user_id` | `string` | Foreign key identifying the item owner |
| `name` | `string` | AI-generated creative name |
| `category` | `'top' \| 'bottom' \| 'shoes'` | Main clothing type |
| `color` | `string?` | Primary color |
| `occasion` | `string?` | `formal`, `casual`, `sport`, `family`, `informal` |
| `image_url` | `text` | **Base64 encoded** image data URL |

### SQLite Table — `users`

| Field | Type | Notes |
|---|---|---|
| `id` | `text` | Primary Key |
| `name` | `text` | Unique username |
| `password_hash` | `text` | Bcrypt hashed password |

> **Note:** `image_url` stores full base64 data URLs directly in the DB. This means DB file can grow large with many photos.

---

## 4. Backend API (`server/src/index.ts`)

The Express server runs on **port 3001** and serves both the API and the React build (from `client/dist`).

### Authentication

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create account (returns JWT token) |
| `POST` | `/auth/login` | Login with username/password (returns JWT token) |
| `GET` | `/auth/me` | Refresh user session from token |

### Wardrobe CRUD (Requires Auth Header)

| Method | Route | Description |
|---|---|---|
| `GET` | `/wardrobe` | List user's items |
| `POST` | `/wardrobe` | Create item (supports large base64 payloads) |
| `DELETE` | `/wardrobe/:id` | Delete item |

### AI / Gemini Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze-item` | **Gemini Vision**: Auto-detects Name/Category/Occasion from photo |
| `GET` | `/api/wardrobe-analysis` | Statistics on outfit variety |
| `POST` | `/api/suggest-pairings` | AI-suggested matches for new items |

---

## 5. AI Integration (`server/src/services/gemini.ts`)

Uses `gemini-flash-latest` model. Three exported functions:

### `analyzeClothingItem(imageUrl, userDescription?, wardrobeContext?)`
- Sends the base64 image + existing wardrobe items as context to Gemini
- Returns: `{ name, category, subCategory, color, occasion }`
- Fallback on error: uses most common occasion in user's wardrobe

### `analyzeWardrobe(items[])`
- Sends the full wardrobe list to Gemini
- Returns: `{ formal: N, casual: N, family: N, sport: N, informal: N }` (outfit counts)
- Fallback: counts actual `top × bottom × shoes` combos per occasion

### `suggestPairings(newItem, existingItems[])`
- Asks Gemini to pick the single best top, bottom, and shoes to pair with a new item
- Returns: `{ tops: [item], bottoms: [item], shoes: [item] }`
- Fallback: uses color-matching logic (e.g. white pairs with navy, black, grey…)

**Environment Variable Required:**
```
GEMINI_API_KEY=your_key_here
```

---

## 6. Frontend (`client/src/`)

### App State (`App.tsx`)

All state lives in the root `App` component:

| State | Type | Purpose |
|---|---|---|
| `phase` | `'onboarding' \| 'dashboard'` | Always `'dashboard'` by default now |
| `activeTab` | `'home' \| 'wardrobe'` | Bottom nav selection |
| `wardrobeItems` | `WardrobeItem[]` | All items from DB |
| `selectedOccasion` | `string \| null` | Currently selected occasion |
| `currentOutfit` | `Outfit \| null` | Displayed outfit |
| `outfitHistory` | `Outfit[]` | All fetched outfits for current occasion session |
| `outfitIndex` | `number` | Current position in outfit history |
| `isLoadingOutfit` | `boolean` | Loading state for recommendation fetch |
| `showChat` | `boolean` | Whether AI chat is open |
| `selectedItem` | `WardrobeItem \| null` | Item open in detail modal |
| `isAnalyzing` | `boolean` | Whether AI is analyzing an uploaded photo |
| `analysisResult` | `Partial<WardrobeItem> \| null` | Result from `/api/analyze-item` |
| `uploadedImage` | `string \| null` | Base64 of newly uploaded photo |
| `pairingSuggestions` | `{tops, bottoms, shoes} \| null` | AI-suggested pairings |

### App Screen Flow

```
Launch
  └─> Dashboard (Home tab)
        ├─> OccasionGrid          → Pick an occasion
        │     └─> OutfitCard      → Swipeable outfit, Prev/Next/Wear buttons
        └─> "My Wardrobe" preview grid → click "View All →" to go to Wardrobe tab

  Wardrobe Tab
        ├─> WardrobeGrid          → All items
        ├─> "Upload Photo" btn    → Triggers file picker
        │     └─> Analysis Modal  → Shows AI analysis + pairings, confirm/cancel
        └─> "Talk with AI" btn    → Opens ChatInterface (AI Stylist)
              └─> Upload photo in chat → AI analyzes, offers to add to wardrobe
```

### Key Components

#### `OccasionGrid`
- Displays 5 occasion cards: **Formal**, **Casual**, **Family**, **Sport**, **Informal**
- Calculates `tops × bottoms × shoes` combos locally from `wardrobeItems` prop
- Cards are greyed/disabled if zero outfits available for that occasion

#### `OutfitCard`
- Full-screen swipe-deck powered by **Framer Motion**
- Renders current outfit + next outfit as a "stack" underneath
- Swipe gestures: swipe right → previous, swipe left → next (fetch new if at end)
- Shows "last worn X days ago" by checking `lastWornDate` of all items in outfit
- Footer: **Prev** ← | **Wearing This** (in gradient) | **Next** →
- Dot indicators at bottom show history position

#### `ChatInterface` (AI Stylist)
- Conversational UI for uploading clothing photos
- On photo upload → calls `/api/analyze-item` + `/api/suggest-pairings`
- AI response includes item details and pairing suggestions
- Confirm/Deny buttons to add item to wardrobe

#### `ItemDetailsModal`
- Opens when a wardrobe item card is clicked
- Shows image, all metadata (name, category, subCategory, color, occasion, wearCount, lastWornDate)
- Allows inline editing and save (calls `PUT /wardrobe/:id`)
- Delete button (calls `DELETE /wardrobe/:id`)

---

## 7. Design System (`client/src/index.css`)

The app uses **TailwindCSS v4** with custom `@theme` tokens.

### Color Palette (Dark Theme)

| Token | Value |
|---|---|
| `--color-base` | `#0a0a0f` (nearly-black background) |
| `--color-accent` | `#8b5cf6` (violet/purple) |
| `--color-action` | `#6366f1` (indigo) |
| `--color-muted` | `#94a3b8` (slate) |
| Gradient CTA | `linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)` |

### Custom Utility Classes

| Class | Purpose |
|---|---|
| `.glass-card` | Frosted glass panel (`rgba(255,255,255,0.04)` + blur) |
| `.btn-gradient` | Animated gradient button |
| `.skeleton` | Shimmer loading placeholder |
| `.hover-lift` | Hover to lift card 4px upward |
| `.text-gradient` | Purple→violet→fuchsia text gradient |

### Fonts
- **Display**: `Outfit` — headings and app title
- **Body**: `Inter` — paragraphs and UI text

### Animations
- `fade-in`, `slide-up`, `scale-in` — entrance animations
- `shimmer` — skeleton loaders
- `float` — subtle floating effect
- `gradient-shift` — animated gradient buttons

---

## 8. Development & Deployment

### Production Cloud Deployment (Railway)
- **Service**: wardobe-api
- **Persistent Storage**: Mounted volume at `/app/data` for the `wardrobe.db` file.
- **Port**: Uses `process.env.PORT` dynamically.
- **Auto-Sync**: Pushing to `origin main` automatically redeploys the latest API.

### Mobile Build (Expo / EAS)
- **Profile**: `preview` (creates a standalone Android APK).
- **Command**: `npx eas-cli build -p android --profile preview`
- **Config**: Root guard in `_layout.tsx` prevents access to dashboard without a valid JWT token stored in `SecureStore`.

---

## 9. Major Achievements (Today's Sprint)

- **Native Migration**: Ported the entire React web experience to React Native (Expo).
- **Authentication**: Built a full multi-user sign-up/login system with JWT security.
- **Cloud Scale**: Moved backend to Railway with production port binding and environment variable management.
- **AI Add-Item**: Implemented a "Zero-Click" upload flow. Users take a photo, Gemini auto-labels the item, and it saves instantly using high-fidelity Base64.

---

## 9. Known Design Decisions & Notes

- **Images stored as base64 in SQLite** — convenient but DB grows large. Future improvement: store images in object storage (S3/Cloudflare R2) and save URLs instead.
- **ID generation** uses `Date.now().toString()` — simple and fine for single-user MVP but not collision-safe for concurrent users.
- **No authentication** — single-user app, no login/auth system.
- **`zod` is installed** in server dependencies but not yet used (validation is manual).
- **`framer-motion`** powers all swipe and animation effects on the outfit card. It supports both mouse drag and touch swipe.
- **Outfit history** is in-memory per session — navigating back to Home resets history.
- **Wardrobe analysis** endpoint (`/api/wardrobe-analysis`) exists but is not called from the frontend UI (it's available for future use).
