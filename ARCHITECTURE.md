# Intervised Architecture Documentation

**Last Updated:** December 19, 2025  
**Version:** 2.0 (Vite + React Rebuild)  
**Previous Version:** Next.js 15 + Tailwind v4

---

## 🚀 Executive Summary

Intervised underwent a **complete architectural rebuild** from a Next.js server-rendered application to a modern **Vite + React SPA** with advanced features including:

- **3D WebGL Background** (Three.js + React Three Fiber)
- **AI Chat Integration** (Google Gemini API with custom tools)
- **Interactive Booking System** (Real-time service configuration)
- **Single-Page Architecture** (Client-side routing with Framer Motion)

This represents a shift from static/SSR content to a **highly interactive, AI-powered creative agency platform**.

---

## 📊 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 6.2.0 | Build tool & dev server (replaces Next.js) |
| **React** | 19.2.1 | UI framework (upgraded from 19.1.0) |
| **TypeScript** | 5.8.2 | Type safety |

### UI/UX Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **Framer Motion** | 12.23.25 | Page transitions, animations |
| **Lucide React** | 0.556.0 | Icon system (700+ icons) |
| **@react-three/fiber** | 9.4.2 | React renderer for Three.js |
| **@react-three/drei** | 10.7.7 | Three.js helpers (Stars, Float, etc) |
| **Three.js** | 0.181.2 | 3D WebGL rendering |

### AI Integration
| Library | Version | Purpose |
|---------|---------|---------|
| **@google/genai** | 1.32.0 | Google Gemini API client |

### Removed Dependencies
- ❌ Next.js 15.3.2 → Vite
- ❌ NextAuth v5 → Removed (no auth needed in SPA)
- ❌ Tailwind CSS v4 → Custom CSS (Tailwind removed)
- ❌ Square SDK → Booking logic simplified
- ❌ React Markdown → Custom markdown renderer built
- ❌ Gray Matter → Removed (no file-based CMS)

---

## 🏗️ Project Structure

```
intervised/
├── App.tsx                    # Root component, page routing logic
├── index.tsx                  # React DOM entry point
├── index.html                 # Vite HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
│
├── components/                # Shared UI components (6 files)
│   ├── Background3D.tsx       # Three.js animated sphere + stars
│   ├── Navigation.tsx         # NavDock + Header
│   ├── BookingConsole.tsx     # Service booking interface
│   ├── ToastSystem.tsx        # Notification system
│   ├── Loading.tsx            # Skeleton loaders
│   └── ScrollToTop.tsx        # Scroll-to-top button
│
├── features/                  # Page-level feature modules (24 files)
│   ├── Home.tsx               # Landing page
│   ├── Services.tsx           # Service catalog + filtering
│   ├── Team.tsx               # Team member profiles
│   ├── Blog.tsx               # Blog listing + posts
│   ├── Contact.tsx            # Contact form
│   ├── Chat.tsx               # AI chat interface (476 lines!)
│   │
│   ├── blog/                  # Blog sub-components
│   │   └── components/
│   │       └── BlogPostCard.tsx
│   │
│   ├── chat/                  # Chat sub-components
│   │   └── components/
│   │       ├── Sidebar.tsx           # Chat sessions + history
│   │       ├── SettingsModal.tsx     # AI configuration
│   │       ├── ToolEditor.tsx        # Custom function editor
│   │       └── settings/
│   │           └── ProviderSettings.tsx
│   │
│   └── services/              # Services sub-components
│       └── components/
│           └── ServiceCard.tsx
│
├── hooks/                     # Custom React hooks (1 file)
│   └── useGeminiAI.ts         # AI chat logic (266 lines)
│
├── lib/                       # Utility libraries
│   ├── aiTools.ts             # Tool definitions for AI
│   ├── toolExecutor.ts        # Tool execution engine
│   ├── universalAI.ts         # AI provider abstraction
│   └── mockDb.ts              # In-memory data store
│
├── types.ts                   # Global TypeScript types (223 lines)
├── constants.ts               # Static data (319 lines)
│   ├── SERVICES_DATA          # 20+ services with pricing
│   ├── TEAM_DATA              # Team member profiles
│   ├── PAST_PROJECTS          # Portfolio case studies
│   ├── CLIENT_TESTIMONIALS    # Social proof
│   └── FAQ_DATA               # Common questions
│
├── metadata.json              # App metadata for AI Studio
├── .env.local                 # Environment variables (GEMINI_API_KEY)
└── README.md                  # Setup instructions
```

**Total Files:** ~50+ TypeScript/React files  
**Lines of Code:** Estimated 5,000+ (up from ~3,000 in Next.js version)

---

## 🎨 Design System

### Color Palette
```typescript
// From constants and CSS
--color-void: #0A0A0F           // Background (near-black)
--color-surface: #1A1A24        // Card backgrounds
--color-accent: #F4C95D         // Gold (primary CTA)
--color-muted: #9CA3AF          // Secondary text
--color-deep-blue: #003F72      // Tech category
```

### Typography
- **Display Font:** System font stack (bold, tracking-tighter)
- **Mono Font:** System mono (code, labels)
- **Body Font:** Sans-serif stack

### Component Patterns
- **Glass morphism:** `bg-white/5 backdrop-blur-md`
- **Neon borders:** `border-accent shadow-[0_0_30px_rgba(244,201,93,0.2)]`
- **Gradient overlays:** `bg-gradient-to-b from-transparent to-void/80`

---

## 🧠 Core Features

### 1. **3D Background System**
**File:** `components/Background3D.tsx`

**Tech:**
- Three.js for WebGL rendering
- React Three Fiber for declarative 3D
- Animated sphere with dynamic color transitions
- Performance monitoring (auto-adjusts DPR on low FPS)
- Pauses rendering when tab is hidden (battery optimization)

**Dynamic Colors:**
```typescript
COLORS = {
  'Creative': '#F4C95D',  // Gold
  'Tech': '#003F72',      // Deep Blue
  'Ministry': '#FFFFFF',  // White
  'Content': '#9CA3AF',   // Gray
  'Growth': '#D1D5DB',    // Light Gray
}
```

Changes color based on active service category.

---

### 2. **AI Chat System** ⭐ New!
**File:** `features/Chat.tsx` (476 lines)  
**Hook:** `hooks/useGeminiAI.ts` (266 lines)

**Capabilities:**
- **Google Gemini API** integration
- **Custom tool calling** (navigation, knowledge base queries)
- **Multi-turn conversations** with memory
- **Markdown rendering** (code blocks, headers, lists, links)
- **Voice input** (Web Speech API)
- **Session management** (save/load chats)
- **Real-time streaming** responses
- **Settings panel** (temperature, tone, model selection)

**AI System Instruction:**
> "You are the Intervised AI, a collaborative intelligence for a creative agency and ministry tech firm. Your tone is sophisticated, slightly futuristic, helpful, and 'sacred-tech' (blending theology and technology)."

**Built-in Tools:**
1. `changePage` - Navigate to site sections
2. `getServiceDetails` - Query service catalog
3. `getTeamInfo` - Fetch team bios
4. `getPortfolio` - Show past projects
5. `getTestimonials` - Retrieve client reviews
6. Custom tools (user-editable in UI)

**Knowledge Base Injected:**
- All 20+ services (pricing, duration, providers)
- Team member profiles (Jona, Reina)
- 6 case studies
- 3 testimonials
- 5 FAQs

---

### 3. **Interactive Booking Console**
**File:** `components/BookingConsole.tsx`

**Features:**
- **Service configuration** (base service + add-ons)
- **Duration selector** (for hourly services)
- **Date picker** (calendar grid)
- **Real-time price calculation**
- **Context/requirements field**
- **Provider selection**
- **Visual feedback** (selected state animations)

**Pricing Logic:**
```typescript
// Hourly services scale with duration
if (service.hourly) {
  const hours = durationMinutes / 60;
  basePrice = service.price * hours;
}

// Add-ons can increase or decrease price
totalPrice = basePrice + options.reduce((sum, opt) => sum + opt.price, 0);
```

---

### 4. **Page Navigation System**
**Pattern:** Client-side SPA routing (no React Router)

**Enum-based Pages:**
```typescript
enum Page {
  HOME, SERVICES, TEAM, BLOG, CONTACT, CHAT
}
```

**Navigation Component:**
- **NavDock** (bottom dock, macOS-inspired)
- **Header** (top logo + branding)
- Framer Motion transitions between pages
- Scroll-to-top on page change

---

### 5. **Services Catalog**

- Category filtering
- Service cards with hover effects
- Price display (base + hourly)
- Provider attribution
- Related project showcase
- FAQ accordion

---

### 6. **Blog System**
**File:** `features/Blog.tsx`

**Structure:**
- Hardcoded blog posts (no CMS)
- Markdown-style content rendering
- Author attribution (Jona/Reina/Team)
- Category tagging (Creative/Tech/Ministry)
- Featured posts section

**Note:** Previous Next.js version had file-based CMS with admin panel. Current version is static content only.

---

### 7. **Team Profiles**
**File:** `features/Team.tsx`

**Members:**
1. **Prince Jona** - Co-Founder & Tech Visionary
   - Music, AI, automation architecture
2. **Reina Hondo** - Co-Founder & Creative Catalyst
   - Multi-instrumentalist, worship curator

**Display:**
- Split-screen layout
- Animated entrance
- Social links (Instagram, Spotify, Email)
- Bio with sacred-tech language

---

### 8. **Contact Form**
**File:** `features/Contact.tsx`

**Fields:**
- Name, Email, Service Interest, Message
- Submit triggers toast notification
- No backend (demo mode)

---

## 🔧 Technical Implementation Details

### State Management
**Pattern:** React Context + Local State (no Redux/Zustand)

**Contexts:**
- `ToastProvider` - Global notifications
- Chat sessions stored in `localStorage`
- Settings persisted in `localStorage`

### Data Storage
**Pattern:** Mock database + Constants

**Files:**
- `lib/mockDb.ts` - In-memory booking storage
- `constants.ts` - Static content
- `localStorage` - User preferences

**Note:** No PostgreSQL, no Supabase (unlike some agency sites). Everything is client-side.

### API Integration
**Google Gemini API:**
```typescript
const client = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ 
  model: 'gemini-3-flash-preview',
  systemInstruction: CUSTOM_PROMPT,
  tools: TOOL_DEFINITIONS 
});
```

**Environment:**
```bash
# .env.local
GEMINI_API_KEY=your_key_here
```

---

## 🎭 Animation Architecture

### Framer Motion Patterns

**Page Transitions:**
```tsx
<AnimatePresence mode="wait">
  <motion.div 
    key={page}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, filter: 'blur(10px)' }}
    transition={{ duration: 0.5 }}
  />
</AnimatePresence>
```

**Service Cards:**
```typescript
variants = {
  idle: { scale: 1, borderColor: "rgba(255,255,255,0.05)" },
  hover: { scale: 1.02, borderColor: "rgba(255,255,255,0.2)" },
  active: { scale: 1.05, borderColor: "#F4C95D", boxShadow: "neon" }
}
```

**Scroll Animations:**
- Hero scroll indicator (bounce loop)
- Testimonials stagger (0.1s delay per card)
- Project grid fade-in

---

## 🚀 Build & Deployment

### Development
```bash
npm run dev        # Start Vite dev server (port 3000)
npm run build      # Production build
npm run preview    # Preview production build
```

### Vite Configuration
**File:** `vite.config.ts`

```typescript
{
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
}
```

**Key Changes from Next.js:**
- No server-side rendering
- No API routes (all client-side)
- No file-based routing
- Faster dev server (Vite HMR)
- Smaller bundle size (no Next.js runtime)

---

## 📈 Performance Optimizations

### 3D Background
- Dynamic DPR adjustment (drops to 0.5 on slow devices)
- Pauses rendering when tab hidden
- Low-poly sphere (32 segments, not 128)
- `gl={{ antialias: false, powerPreference: 'low-power' }}`

### Code Splitting
- Feature modules lazy-loadable (not implemented yet)
- Three.js tree-shaking

### Loading States
- Skeleton loaders for services
- Instant page transitions (no loading bars)

---

## 🔐 Security & Privacy

**No Authentication:**
- Removed NextAuth (no admin panel in SPA)
- No user accounts
- No backend database

**API Keys:**
- Gemini API key in environment (client-side exposure!)
- ⚠️ **Security Risk:** API key visible in browser DevTools
- **Recommendation:** Move AI calls to serverless functions (Vercel Edge, Cloudflare Workers)

---

## 📱 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: > 1024px

**Mobile-Specific:**
- Touch-optimized buttons (44px minimum)
- Bottom dock navigation (thumb-friendly)
- Collapsible sections
- Reduced 3D complexity on mobile (performance)

---

## 🎯 What Changed (Next.js → Vite)

### ✅ Added Features
1. **3D Background** with dynamic colors
2. **AI Chat** with Google Gemini (full conversation system)
3. **Interactive Booking** console with real-time calculations
4. **Animated Page Transitions** (Framer Motion)
5. **Tool-calling AI** (custom function execution)
6. **Settings Panel** for AI customization
7. **Voice Input** for chat (Web Speech API)

### ❌ Removed Features
1. **NextAuth Google OAuth** (no admin login)
2. **File-based Blog CMS** (blog now hardcoded)
3. **Square Payment Integration** (bookings saved locally)
4. **Server-side Rendering** (pure client-side)
5. **API Routes** (no backend)
6. **Tailwind CSS** (custom CSS classes)

### 🔄 Refactored
- **Routing:** Next.js App Router → Enum-based state
- **Styling:** Tailwind v4 → Inline styles + CSS variables
- **Data Fetching:** Server components → Client-only
- **Forms:** Server actions → Client handlers

---

## 🤔 Analysis & Observations

### Strengths
1. **Blazing Fast:** Vite dev server is instant
2. **Visually Stunning:** 3D background sets you apart
3. **AI-First:** Chat is front-and-center (future of web)
4. **Modular:** Clean separation of features
5. **Modern Stack:** Latest React 19, Vite 6, Three.js

### Weaknesses
1. **No SEO:** SPA means no server-rendered meta tags (bad for Google)
2. **API Key Exposure:** Gemini key visible in client
3. **No Persistence:** Bookings lost on page refresh
4. **No Authentication:** Can't protect admin features
5. **No Analytics:** No tracking of user behavior
6. **Larger Bundle:** Three.js + AI libraries increase size

### Recommendations
1. **Add SSR/SSG:** Use Vite SSR plugin for SEO
2. **Secure API:** Move Gemini calls to edge functions
3. **Real Database:** Connect Supabase/Firebase for bookings
4. **Analytics:** Add Plausible/PostHog
5. **A11y Audit:** Test with screen readers
6. **Error Boundaries:** Add React error handling
7. **Testing:** Add Vitest + React Testing Library

---

## 🚧 Future Roadmap

### Phase 1: Production Readiness
- [ ] Move API key to server-side
- [ ] Add Supabase for bookings
- [ ] Implement error boundaries
- [ ] Add loading skeletons everywhere
- [ ] Mobile performance audit

### Phase 2: Features
- [ ] Email notifications (booking confirmations)
- [ ] Calendar integration (Google Calendar)
- [ ] Payment processing (Stripe/Square)
- [ ] User accounts (Firebase Auth)
- [ ] Admin dashboard (restore NextAuth flow)

### Phase 3: SEO & Growth
- [ ] Blog CMS (Sanity/Contentful)
- [ ] Meta tags + Open Graph
- [ ] Sitemap generation
- [ ] Google Analytics
- [ ] A/B testing framework

### Phase 4: Advanced AI
- [ ] Multi-modal AI (image generation)
- [ ] Voice cloning (Jona/Reina voices)
- [ ] Live avatar (rigged 3D character)
- [ ] Sentiment analysis
- [ ] Auto-booking via AI

---

## 📚 Documentation Status

### Created Documents
- ✅ `ARCHITECTURE.md` (this file)
- ✅ `README.md` (setup instructions)
- ✅ `metadata.json` (AI Studio config)

### Missing Documents
- ❌ `CONTRIBUTING.md`
- ❌ `CHANGELOG.md`
- ❌ `API.md` (if adding backend)
- ❌ Component Storybook

---

## 👥 Team & Credits

**Built by:** Intervised LLC (Prince Jona + Reina Hondo)  
**Architecture:** Custom Vite + React stack  
**AI Partner:** Google Gemini API  
**Design Philosophy:** Sacred-tech aesthetic  
**Inspiration:** AI Studio demo template (mentioned in README)

---

## 🔗 External Links

- **Live Site:** TBD (not deployed yet)
- **GitHub:** github.com/PrinceJonaa/intervised
- **AI Studio:** https://ai.studio/apps/drive/11pJf57mQi-MtCGzgel4VUUU_RlMpCau1

---

**Last Commit:** `06f4d1b` - "Fix Vercel deployment warnings"  
**Migration Date:** Between Nov 10 - Dec 19, 2025  
**Lines Changed:** ~10,000+ (full rewrite)
