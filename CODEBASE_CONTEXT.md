# Wardrobe Management — Codebase Context

> A full-stack AI-powered wardrobe assistant that helps you pick daily outfits based on occasion, powered by Google Gemini.

---

## 1. Project Overview

| Property | Detail |
|---|---|
| **App Name** | Wardrobe Management |
| **Repo** | `dvavraju/anti-gravity` on GitHub |
| **Stack** | React 19 (Vite/TypeScript) + Node.js/Express (TypeScript) + SQLite |
| **AI** | Google Gemini (`gemini-flash-latest`) via `@google/generative-ai` |
| **Deployment** | Docker container, exposed on port `3001`; previously hosted on Railway |
| **Dev Command** | `npm run dev` (root) — runs client & server concurrently |

---

## 2. Repository Structure

```
anti-gravity/
├── client/               # React frontend (Vite + TypeScript)
│   └── src/
│       ├── App.tsx             # Root component & all app state
│       ├── index.css           # Global styles + design tokens
│       ├── main.tsx            # React entry point
│       ├── types/
│       │   └── wardrobe.ts     # WardrobeItem and Outfit type definitions
│       └── components/
│           ├── home/
│           │   └── OccasionGrid.tsx      # Occasion picker (Formal/Casual/etc.)
│           ├── layout/
│           │   ├── BottomNav.tsx         # Home/Wardrobe tab navigation
│           │   ├── Container.tsx         # Page wrapper with max-width
│           │   └── Grid.tsx              # Responsive item grid
│           ├── onboarding/
│           │   └── ChatInterface.tsx     # AI chat for uploading items via conversation
│           ├── ui/
│           │   └── Button.tsx            # Shared button component
│           └── wardrobe/
│               ├── OutfitCard.tsx        # Swipeable card deck for outfit display
│               ├── WardrobeGrid.tsx      # Grid list of all wardrobe items
│               ├── WardrobeItemCard.tsx  # Single item card (image + metadata)
│               └── ItemDetailsModal.tsx  # Modal to view/edit/delete an item
│
├── server/               # Express backend (TypeScript)
│   └── src/
│       ├── index.ts            # All REST API routes
│       ├── db/
│       │   └── index.ts        # SQLite init, table creation, migration
│       ├── services/
│       │   └── gemini.ts       # Gemini AI service (analyze, analyze wardrobe, pairings)
│       └── scripts/
│           ├── seed-demo.ts              # Populates DB with demo data
│           ├── add-sample-items.ts       # Adds specific sample items
│           └── analyze-existing-items.ts # Re-analyzes existing items with AI
│
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Local Docker compose setup
└── package.json          # Root — scripts to run/build everything together
```

---

## 3. Data Model

### `WardrobeItem` (TypeScript type — `types/wardrobe.ts`)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Timestamp-based (e.g. `Date.now().toString()`) |
| `name` | `string` | AI-generated creative name |
| `category` | `'top' \| 'bottom' \| 'shoes' \| 'accessory'` | Main clothing type |
| `subCategory` | `string?` | E.g. "hoodie", "jeans", "sneakers" |
| `color` | `string?` | Primary color |
| `occasion` | `string?` | `formal`, `casual`, `sport`, `family`, `informal` |
| `imageUrl` | `string?` | Base64 data URL of the photo |
| `wearCount` | `number` | Times worn, tracked in DB |
| `lastWornDate` | `string?` | ISO date string `YYYY-MM-DD` |

### `Outfit` (TypeScript type — `types/wardrobe.ts`)

```ts
interface Outfit {
  id: string;          // Timestamp-based
  items: WardrobeItem[]; // Always [top, bottom, shoes]
  createdAt: string;
}
```

### SQLite Table — `wardrobe_items`

```sql
CREATE TABLE wardrobe_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('top', 'bottom', 'shoes', 'accessory')),
  sub_category TEXT,
  color TEXT,
  image_url TEXT,          -- Full base64 image stored in DB
  occasion TEXT,
  wear_count INTEGER DEFAULT 0,
  last_worn_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> **Note:** `image_url` stores full base64 data URLs directly in the DB. This means DB file can grow large with many photos.

---

## 4. Backend API (`server/src/index.ts`)

The Express server runs on **port 3001** and serves both the API and the React build (from `client/dist`).

### Wardrobe CRUD

| Method | Route | Description |
|---|---|---|
| `GET` | `/wardrobe` | List all items (newest first) |
| `POST` | `/wardrobe` | Create item (`name`, `category`, `color`, `imageUrl`, `occasion`) |
| `PUT` | `/wardrobe/:id` | Update item metadata (name, category, subCategory, color, occasion) |
| `DELETE` | `/wardrobe/:id` | Delete item |

### Wear Tracking

| Method | Route | Description |
|---|---|---|
| `POST` | `/wardrobe/:id/wear` | Increment `wear_count`, set `last_worn_date` to today |
| `POST` | `/wardrobe/:id/unwear` | Decrement `wear_count` |

### Outfit Recommendations

| Method | Route | Description |
|---|---|---|
| `GET` | `/recommendations?occasion=` | Returns one outfit (top + bottom + shoes) using weighted random |

**Weighted Random Algorithm:** Items worn more recently get a *lower* weight so under-worn items surface more often.
```
weight = daysSinceWorn / (1 + wearCount × 0.1)
```

### AI / Gemini Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze-item` | Analyze a clothing photo → returns `name, category, subCategory, color, occasion` |
| `GET` | `/api/wardrobe-analysis` | Estimate outfit counts per occasion using Gemini |
| `POST` | `/api/suggest-pairings` | Given a new item, suggest best matching items from existing wardrobe |
| `POST` | `/api/debug/seed` | Seed database with demo wardrobe items |

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

## 8. Deployment

### Docker (Multi-stage)

```
Stage 1: node:20-alpine → build client → /app/client/dist
Stage 2: node:20-alpine → build server → /app/server/dist
Stage 3: production image → copy both builds, run npm start (node dist/index.js)
```

Exposed port: **3001**. Server also serves the built React app as static files, so there is only one port to expose.

### Environment Variables (Server)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Google Generative AI key |
| `DB_PATH` | Optional | Path to SQLite DB file (default: `./wardrobe.db`) |

### npm Scripts

| Command | Does |
|---|---|
| `npm run dev` (root) | Runs client dev server (Vite, port 5173) + server dev (`tsx watch`, port 3001) concurrently |
| `npm run build` (root) | Builds client then server (TypeScript → JS) |
| `npm run install:all` | Installs root + server + client dependencies |

---

## 9. Known Design Decisions & Notes

- **Images stored as base64 in SQLite** — convenient but DB grows large. Future improvement: store images in object storage (S3/Cloudflare R2) and save URLs instead.
- **ID generation** uses `Date.now().toString()` — simple and fine for single-user MVP but not collision-safe for concurrent users.
- **No authentication** — single-user app, no login/auth system.
- **`zod` is installed** in server dependencies but not yet used (validation is manual).
- **`framer-motion`** powers all swipe and animation effects on the outfit card. It supports both mouse drag and touch swipe.
- **Outfit history** is in-memory per session — navigating back to Home resets history.
- **Wardrobe analysis** endpoint (`/api/wardrobe-analysis`) exists but is not called from the frontend UI (it's available for future use).
