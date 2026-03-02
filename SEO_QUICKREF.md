# SEO QuickRef (Intervised)

## 0) Canonical Contract
```txt
CANON_HOST := https://www.intervised.com
```

All of these MUST agree with `CANON_HOST`:
- `canonical`
- `og:url`
- `twitter:url`
- JSON-LD `url` / `@id`
- `robots.txt -> Sitemap: ...`
- `<loc>` entries in `sitemap.xml`

If any one uses apex while others use `www`, expect indexing drift.

## 1) Redirect Matrix (Intentional)
```txt
http://intervised.com/*        => https://www.intervised.com/*
https://intervised.com/*       => https://www.intervised.com/*
https://www.intervised.com/booking => /contact
```

GSC meaning:
- `Page with redirect` for old `http://` or `/booking` URLs = expected.

## 2) GSC Property + Sitemap Discipline
```txt
Property used in GSC: https://www.intervised.com/
Submit sitemap:       https://www.intervised.com/sitemap.xml
```

Do not mix host properties with opposite-host sitemap URLs.

## 3) SPA SEO Rules
- Every indexable route needs unique `title + description + canonical`.
- Ensure route-level `useSEO(...)` runs for all public pages.
- Keep `/admin` and `/chat` as `noindex` (intentional utility/app routes).
- Prerender indexable marketing routes (`build:ssg`) for stable crawl metadata.

## 4) Fast Debug Commands
```bash
# headers + redirects
curl -I https://www.intervised.com/sitemap.xml
curl -I https://intervised.com/sitemap.xml
curl -I https://www.intervised.com/team

# robots + sitemap body checks
curl https://www.intervised.com/robots.txt
curl https://www.intervised.com/sitemap.xml | head -n 40

# find host drift in repo
rg -n "https://intervised.com|https://www.intervised.com" -S .
```

## 5) Release Checklist (SEO-safe)
```txt
1. npm run generate-sitemap
2. npm run build:ssg (or build + prerender)
3. verify robots/sitemap host = CANON_HOST
4. deploy
5. GSC: inspect key URL(s) -> request indexing
6. GSC: submit/resubmit sitemap
```

## 6) Triage Cheatsheet
- `Page with redirect`:
  - fix only if redirect is accidental
  - ignore if canonical migration/alias route is intended
- `Crawled - currently not indexed`:
  - check canonical consistency first
  - improve internal links + content uniqueness
  - request indexing after deploy, then wait for recrawl cycle
