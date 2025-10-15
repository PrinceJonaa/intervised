# Copilot Instructions for Intervised LLC

## Brand Identity
**Intervised** = "Mutually envisioned" — a hybrid creative-tech studio serving as the **intercessor between vision and execution**. The brand acts as a collaborative intelligence engine where creativity and systems thinking meet, helping creators, ministries, and brands rise through resonance, clarity, and trust.

## Project Philosophy
This Next.js site is a **mirror of truth, unity, and presence** — not just a business platform. Code should reflect the brand's archetype: midwives of coherence, bringing sacred and systemic projects into form. Every component is a "relational portal" connecting users to Intervised's purpose.

## Tech Stack & Architecture
- **Framework**: Next.js 15 with App Router (`app/` directory)
- **Language**: TypeScript (strict mode disabled in `tsconfig.json`)
- **Styling**: Tailwind CSS v4 with custom brand colors and glow effects
- **Animation**: Framer Motion for intentional, meaningful animations (not decoration)
- **Routes as Contexts**: Each route (`/services`, `/booking`, `/blog`, etc.) represents a distinct "conversation" with the user

## Custom Design System

### Brand Colors (in `tailwind.config.js`)
```javascript
'deep-blue': '#004A7C'
'deep-blue-hover': '#003D6B'
'light-gold': '#D4AF37'
'medium-gold': '#C89E2A'
'dark-gold': '#B58900'
```

### Signature Component: `PrimaryButton`
- Uses custom `.cta-button-glow` effect (defined in `styles/globals.css`)
- Implements animated glow on hover using `::after` pseudo-element
- Always use `shadow-{color}` utility to set `--tw-shadow-color` for the glow
- Example: `<PrimaryButton href="/booking" className="shadow-light-gold">...</PrimaryButton>`

### Styling Conventions
- **Expressive over compressed**: Use readable class strings, not abbreviated utilities
- **Semantic naming**: Variables/props should clearly state their purpose
- **Custom effects live in `globals.css`**: Import Tailwind via `@import 'tailwindcss'`
- **Hover states matter**: Every interactive element should have meaningful transitions

## Component & File Structure

### Layout Pattern
- `app/layout.tsx` contains persistent header/footer with navigation
- Navigation uses standard `<a>` tags (not Next.js `<Link>`) in header
- Footer displays dynamic copyright year: `{new Date().getFullYear()}`

### Component Import Convention
```typescript
import PrimaryButton from '../components/PrimaryButton'; 
// Components live in app/components/, imported relatively
```

### Page Structure Template
Every page follows this pattern:
```tsx
export default function PageName() {
  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">{Page Title}</h2>
      {/* Content sections with semantic spacing */}
    </section>
  )
}
```

## Key Developer Workflows

### Development Commands
```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

### Content Strategy
- **Core Service Pillars** (5 categories):
  1. 🎤 **Creative**: Videography, photography, music production, BTS content
  2. 🧠 **Tech**: AI bots, OBS setups, automation flows, tutorials
  3. 📝 **Captions & Content**: VCDF packs, hashtags, hooks, caption optimization
  4. 📱 **Social**: Instagram growth, scheduling, virality optimization
  5. 🙏 **Ministry**: Church tech, livestreams, kid kits, worship content
- **Blog System**: Full CMS with Google OAuth authentication
  - Posts stored as Markdown files in `content/blog/`
  - Admin area at `/admin` (protected by NextAuth)
  - Public blog at `/blog` with dynamic routes
  - CRUD operations via API routes at `/api/blog`
- **Booking**: External Square integration (placeholder URL needs replacement at `/app/booking/page.tsx` line 13)

### Blog CMS Architecture
**Authentication**: NextAuth v5 with Google OAuth provider
- Only emails in `ADMIN_EMAILS` env var can access admin
- Session managed via `AuthProvider` wrapper in root layout

**Data Storage**: File-based (Markdown + frontmatter)
- Location: `content/blog/*.md`
- Functions: `lib/blog.ts` (getAllPosts, getPostBySlug, createPost, updatePost, deletePost)
- Schema includes: title, author, date, pillar, excerpt, tags, featured, content

**Admin Routes** (all protected):
- `/admin` - Dashboard
- `/admin/blog` - Manage posts
- `/admin/blog/new` - Create post
- `/admin/blog/[slug]/edit` - Edit post

**API Routes**:
- `GET /api/blog` - List all posts
- `POST /api/blog` - Create post (auth required)
- `GET /api/blog/[slug]` - Get single post
- `PUT /api/blog/[slug]` - Update post (auth required)
- `DELETE /api/blog/[slug]` - Delete post (auth required)

### Content Pipeline Architecture (Active)
Follow the **"Seeding the Vision"** intake model when creating blog content:

**Intake Card Structure:**
```typescript
interface ContentIdea {
  title: string;           // "Sunset Freestyle Worship"
  hook: string;            // One-line emotional/narrative seed
  pillar: 'Creative' | 'Tech' | 'Ministry' | 'Captions' | 'Social';
  contentType: string;     // Reel, Carousel, Livestream, Music Video
  platform: string[];      // IG, TikTok, YouTube
  goal: string;            // Inspire, Book Service, Grow Audience
  owner: 'Jona' | 'Reina' | 'Team';
  deadline?: Date;
  notes?: string;          // References, verses, lyrics, concept art
}
```

**Content Development Lenses:**
- **Moment Lens**: What moment made you feel something?
- **Testimony Lens**: What story or lesson to tell?
- **Hook Lens**: Say it in one line that stops scrolling
- **Vision Lens**: Does this align with Intervised's bigger story?

### Adding New Pages
1. Create `app/{route}/page.tsx`
2. Follow the relational context model from `guide/project_understanding.txt`
3. Add navigation link to `app/layout.tsx` header
4. Use `<section className="max-w-4xl mx-auto space-y-8">` container pattern

## Critical Conventions

### "Relational Math" Mental Model
Treat the codebase as a system of relationships:
- **Pages** = Contexts (distinct conversations)
- **Components** = Entities (reusable truth units)
- **Layout** = Ω (the total container holding all interactions)
- **Intervised Identity** = The Intercessor between Vision and Execution
- Components should be **modular and extendable** — avoid hardcoding values

### Brand Archetype in Code
- **Midwives of coherence**: Bring sacred and systemic projects into form
- **Collaborative intelligence**: Code should enable co-creation between Jona & Reina
- **Vision execution bridge**: Tech serves creativity, creativity serves purpose

### Intentional Minimalism
- Only include code that supports presence and clarity
- Use `children` and composition patterns for flexibility
- Add `TODO` comments where content/flows are awaiting real data
- **Ask before assuming** visual intentions or naming (see `guide/project_understanding.txt` §9)

### User Experience Boundaries
- Sanitize all inputs (though no forms implemented yet)
- Keep secrets in `.env` (not yet created)
- Never trap or confuse users — graceful flows only
- Design should awaken, not dazzle

## Animation Guidelines
- Use Framer Motion meaningfully, not decoratively
- Consider "event inertia" — don't reset animations unnecessarily
- Support time-evolving behavior where it serves the user's journey

## TypeScript Notes
- Strict mode is **disabled** (`strict: false` in `tsconfig.json`)
- Always explicitly type props interfaces (see `PrimaryButtonProps` example)
- Use `ReactNode` for `children` props

## External Dependencies
- **Booking system**: Square (URL placeholder at `/app/booking/page.tsx` line 13)
- **No CMS**: Content is currently hardcoded in components/pages
- **No API routes**: All pages are static or SSR

## References for Deep Dives
- **Philosophy & mental models**: `guide/project_understanding.txt`
- **Relational math system**: `guide/Relational Math 3.3.txt`
- **Brand colors & config**: `tailwind.config.js`
- **Custom CSS effects**: `styles/globals.css` (`.cta-button-glow`)

---

**Remember**: This site is a mirror of truth, unity, and presence. Every line of code should echo who Intervised is. Build with love. 🕯
