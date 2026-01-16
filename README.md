# Intervised.com

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fintervised.com&label=intervised.com)](https://intervised.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/PrinceJonaa/intervised-website)](https://github.com/PrinceJonaa/intervised-website/issues)
[![GitHub stars](https://img.shields.io/github/stars/PrinceJonaa/intervised-website?style=social)](https://github.com/PrinceJonaa/intervised-website/stargazers)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/PrinceJonaa/intervised-website)

**Live:** [intervised.com](https://intervised.com)

We're a creative and tech studio in NYC. This repo is the full source code for our website.

![Built in NYC](https://img.shields.io/badge/Built%20in-NYC-yellow?style=for-the-badge)
![From Shelter](https://img.shields.io/badge/From-Shelter%20to%20Studio-orange?style=for-the-badge)
![Zero VC](https://img.shields.io/badge/VC%20Funding-$0-green?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-2%20People-blue?style=for-the-badge)
![Babylon-Free](https://img.shields.io/badge/Babylon-Free%20Zone-blueviolet?style=for-the-badge)

---

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## Project Stats

![GitHub code size](https://img.shields.io/github/languages/code-size/PrinceJonaa/intervised-website)
![GitHub repo size](https://img.shields.io/github/repo-size/PrinceJonaa/intervised-website)
![GitHub last commit](https://img.shields.io/github/last-commit/PrinceJonaa/intervised-website)

---

## What This Is

The actual production site. Not a template. Not a portfolio piece. What you see at intervised.com is built from this code.

We made it public because:
- **Transparency matters.** If you want to see how we structure projects, look.
- **We're not hiding.** Built in a shelter, two people, all the tools visible.
- **Open source shows integrity.** When you build clean, you can show your work.

---

## Why We Built It This Way

### Stack
- React, TypeScript, Vite
- Supabase for auth and database
- Gemini AI for chat
- Vercel for hosting

### Philosophy
The site reflects us. Clean UI, honest copy, no manipulation tactics. AI chat helps people without the sales pressure. Blog shares what we learn. Services have real prices listed.

Built by [Jonathan Bonner](https://www.linkedin.com/in/jonathan-bonner-professional/) (systems, code, AI) and [Reina Hondo](https://instagram.com/challenges_inlife) (design, music, presence). No agency. No team of 20. Just us.

---

## What's Inside

```
src/
├── features/          # Pages (Home, Services, Blog, Chat, Admin)
├── components/        # Reusable UI
├── lib/
│   ├── supabase/     # Database + auth
│   ├── ai/           # Gemini integration
│   └── utils/        # SEO, analytics, helpers
└── hooks/            # useBlog, useSEO, useAuth, useGeminiAI
```

---

## Key Features

**AI Chat**  
Ask questions, get answers. Trained on our services and approach. Not here to convert you, just help.

**Blog + Real-Time Comments**  
Markdown support. Comments appear instantly via Supabase subscriptions. SEO optimized with structured data.

**Admin Dashboard**  
Manage posts, chat sessions, bookings. No third-party CMS. We built what we needed.

**Performance**  
Lazy-loaded images, code splitting, Lighthouse 95+, Core Web Vitals green.

---

## Why This Repo Is Public

We're not protecting "trade secrets." There aren't any. Just clean code, honest design, tools that work, presence that shows up.

If you're building something and this helps, take it. Fork it. Learn from it. That's the point.

We're proving you can build a real business with modern tools, transparent practices, and zero bullshit. No VC. No growth hacking. Value, clearly communicated.

---

## Security

- Environment variables not committed (see `.env.example`)
- Supabase RLS enforces data access rules
- CodeQL scans weekly via GitHub Actions
- Privacy-first analytics (Vercel Web Analytics)

Found a security issue? Email security@intervised.com or open a private advisory on GitHub.

[![Security Rating](https://img.shields.io/badge/security-A+-brightgreen)]()
[![Code Quality](https://img.shields.io/badge/code%20quality-A-brightgreen)]()
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/PrinceJonaa/intervised-website/graphs/commit-activity)

---

## Local Setup (If You're Curious)

```bash
git clone https://github.com/PrinceJonaa/intervised-website.git
cd intervised-website
npm install
cp .env.example .env
# Add your Supabase URL + keys
npm run dev
# Open localhost:5173
```

You'll need your own Supabase project and Gemini API key. Both are free to start.

---

## Tech Choices

| Tool | Why |
|------|-----|
| React | Component-based, fast, huge ecosystem |
| TypeScript | Catches bugs before runtime |
| Vite | 10x faster than Webpack |
| Supabase | Postgres + real-time + auth in one |
| Gemini AI | Best free chat API |
| Vercel | Git push = live site |

---

## What We're NOT Doing

- No tracking across the web
- No hidden pricing
- No fake urgency ("3 spots left!")
- No SEO spam
- No A/B testing to maximize "conversions"

---

## Who This Is For

**Clients** can see exactly how we build. Transparency breeds trust.  
**Developers** can learn from production code, not tutorials.  
**Curious people** can understand how modern web apps work.

---

## Connect

[![Website](https://img.shields.io/badge/Website-intervised.com-blue)](https://intervised.com)
[![Instagram](https://img.shields.io/badge/Instagram-@intervised.llc-E4405F?logo=instagram&logoColor=white)](https://instagram.com/intervised.llc)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Intervised-0077B5?logo=linkedin&logoColor=white)](https://linkedin.com/company/intervised)

**Founders:**
- Jonathan (Prince Jona): [![Instagram](https://img.shields.io/badge/@princejonaa-E4405F?logo=instagram&logoColor=white)](https://instagram.com/princejonaa)
- Reina Hondo: [![Instagram](https://img.shields.io/badge/@challengesinlife-E4405F?logo=instagram&logoColor=white)](https://instagram.com/challengesinlife)

---

## License

MIT. Use this code however you want. Attribution appreciated but not required.

---

## Built in NYC

Mostly from a shelter, by two people who believe tech should serve people, not extract from them.

If you're building something real, we see you. Keep going. 🏠🌧️