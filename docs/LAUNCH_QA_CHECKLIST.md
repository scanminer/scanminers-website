# Launch QA Checklist

> **Purpose:** Pre-launch validation checklist for Scanminers website before showing to partners, investors, or mining stakeholders.

---

## 1. Visual Checks

### Light Mode
- [ ] **Hero section** readable (no white-on-white text)
  - Test: Visit `/` in light mode, verify hero headline and body text have sufficient contrast
  - Expected: Deep blue gradient background with white text clearly visible
  
- [ ] **Navigation bar** readable
  - Test: Check header links in light mode
  - Expected: Dark text on light background, hover states visible

- [ ] **Card components** have proper contrast
  - Test: Check homepage cards, insights cards, case study cards
  - Expected: Text clearly readable on all card backgrounds

- [ ] **CTA buttons** clearly visible
  - Test: Primary (green), Secondary (blue), Outline buttons on homepage
  - Expected: All buttons have clear text and hover effects

### Dark Mode
- [ ] **Hero section** readable (no black-on-black text)
  - Test: Visit `/` in dark mode, verify text contrast
  - Expected: Light text on dark gradient, elevated luminance for brand colors

- [ ] **Navigation bar** readable
  - Test: Check header in dark mode
  - Expected: Light text, visible hover states, theme toggle working

- [ ] **Card components** maintain contrast
  - Test: Insights, case studies, homepage sections
  - Expected: Proper text/background contrast throughout

- [ ] **Images** display correctly
  - Test: All insight/case study images load without issues
  - Expected: Images visible, blur placeholders work

### Typography & Spacing
- [ ] **Heading hierarchy** follows brand guide
  - Test: Check H1 (4xl/5xl bold), H2 (3xl/4xl semibold), body (fg 0.85), small (xs uppercase)
  - Expected: Consistent sizing across all pages

- [ ] **Mobile-safe padding**
  - Test: View on narrow viewport (360px width simulating Huawei)
  - Expected: No text touching edges, comfortable padding

---

## 2. Functional Checks

### Navigation
- [ ] **Desktop navigation** works
  - Test: Click all header links
    - Home (`/`)
    - About (`/about`)
    - Technologies (`/technologies`)
    - Insights (`/insights`)
    - Case Studies (`/case-studies`)
    - Contact (`/contact`)
    - Prospectivity Brief (`/prospectivity-brief`)
    - Consultation (`/consultation`)
  - Expected: All routes load correctly

- [ ] **Mobile menu** opens/closes smoothly
  - Test: On mobile viewport, click hamburger icon
  - Expected: Menu slides in from right, backdrop visible, close button works

- [ ] **Theme toggle** persists preference
  - Test: Toggle light/dark mode, refresh page
  - Expected: Theme persists via localStorage (`scanminers-theme`)

### Content Routes
- [ ] **All Insights articles** open correctly
  - Test: Visit `/insights`, click each article card (5 total)
    - `cobalt-in-battery-supply-chains`
    - `bauxite-mapping-advances`
    - `advancements-in-using-sar-data-for-geological-mapp`
    - `using-lidar-for-tailing-dam-monitoring`
    - `advanced-ml-ree-prospectivity-carbonatite-alkaline-complexes`
  - Expected: Each article renders with image, title, body, citations

- [ ] **All Case Studies** open correctly
  - Test: Visit `/case-studies`, click each card (2 total)
    - `bauxite-payas-islahiye`
    - `payas-islahiye-pilot`
  - Expected: Each case study renders fully

- [ ] **404 handling** works
  - Test: Visit `/insights/fake-slug`
  - Expected: Next.js 404 page displays gracefully

### External Links
- [ ] **ORCID link** opens correctly
  - Test: Visit `/about`, click "View ORCID Profile" under Dr. Amin
  - Expected: Opens `https://orcid.org/0000-0001-8783-5120` in new tab (`target="_blank" rel="noopener noreferrer"`)

- [ ] **RSS feed** accessible
  - Test: Visit `/insights/rss.xml`
  - Expected: Valid XML feed downloads/displays

### Forms (Production Environment)
> **Note:** Forms require production deployment with Turnstile/Resend configured

- [ ] **Prospectivity Brief form** submits
  - Test: Fill out `/prospectivity-brief` form
  - Expected: Turnstile challenge, submission success, email received

- [ ] **Consultation form** submits
  - Test: Fill out `/consultation` form
  - Expected: Turnstile challenge, submission success, wire instructions displayed

- [ ] **Contact form** submits
  - Test: Fill out `/contact` form
  - Expected: Submission success, confirmation message

---

## 3. Mobile Checks

### Viewport Responsiveness
- [ ] **No horizontal scrolling** on major pages
  - Test: View `/`, `/about`, `/technologies`, `/insights`, `/case-studies` at 360px width
  - Expected: All content wraps properly, no overflow

- [ ] **CTAs tappable** without zoom
  - Test: On mobile, tap primary/secondary buttons
  - Expected: Buttons large enough (min 44×44px touch target), no mis-taps

- [ ] **Mobile menu** doesn't obscure content
  - Test: Open menu on mobile
  - Expected: Backdrop darkens page, menu panel has proper contrast (border-l-2 border-primary/20)

### Touch Interactions
- [ ] **Cards** tappable
  - Test: Tap insight/case study cards on mobile
  - Expected: Link to detail page works

- [ ] **Tag filters** work on mobile
  - Test: Visit `/insights`, tap tag filter
  - Expected: Filtered view loads

---

## 4. Performance & Build

### Build Status
- [ ] **Build completes successfully**
  - Run: `npm run build`
  - Expected: ✓ Compiled successfully, 49 static pages generated

- [ ] **Tests pass**
  - Run: `npm test`
  - Expected: 18 tests pass across 5 files

- [ ] **TypeScript compiles cleanly**
  - Run: `npm run typecheck`
  - Expected: No type errors

- [ ] **Linting passes on source**
  - Run: `npx eslint app components lib --ext .ts,.tsx`
  - Expected: No errors (build artifacts may have warnings—ignore those)

### Performance (Optional)
- [ ] **Lighthouse score** > 90 for Performance
  - Run: Lighthouse in Chrome DevTools on `/`
  - Expected: Good Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

- [ ] **Accessibility score** > 90
  - Run: Lighthouse Accessibility audit
  - Expected: Proper ARIA labels, contrast ratios, semantic HTML

---

## 5. Brand Consistency

### Color Palette
- [ ] **Brand colors** used consistently
  - Test: Inspect CSS variables in browser DevTools
  - Expected:
    - `--brand-blue-deep: #003C6D`
    - `--brand-green-mineral: #007A5A`
    - `--brand-black-ai: #0A0A0A`
    - `--brand-blue-accent: #1E8FFB`
    - `--brand-orange-terrain: #F08A24`
    - `--brand-grey-fog: #F3F5F7`

- [ ] **CTA hierarchy** follows guide
  - Test: Check homepage CTAs
  - Expected:
    - **Primary** = green-mineral background (`variant="primary"`)
    - **Secondary** = blue-deep background (`variant="secondary"`)
    - **Tertiary** = link style (`variant="link"`)

### Typography
- [ ] **Font family** consistent
  - Test: Inspect computed styles
  - Expected: `Inter` font family across all text

- [ ] **Hierarchy** matches guide
  - Test: Check heading sizes
  - Expected:
    - H1: text-4xl/5xl font-bold
    - H2: text-3xl/4xl font-semibold
    - Body: text-base/fg (0.85 opacity)
    - Small: text-xs uppercase tracking-wide

### Content Accuracy
- [ ] **No placeholder text** (e.g., "Lorem ipsum")
  - Test: Read homepage, about, technologies pages
  - Expected: All copy is final brand voice

- [ ] **No outdated role names**
  - Test: Check `/about` founder bios
  - Expected: Dr. Amin = "Chief Scientist", Mahmood = "Chief AI & Product Architect"

- [ ] **Correct ORCID ID**
  - Test: `/about` page, Dr. Amin's ORCID link
  - Expected: `https://orcid.org/0000-0001-8783-5120`

---

## 6. Social Media & SEO

### Open Graph Tags
- [ ] **Homepage** has OG tags
  - Test: View source on `/`, check `<meta property="og:*">`
  - Expected: `og:title`, `og:description`, `og:image` (default or `/og-default.svg`)

- [ ] **Insights** have OG images
  - Test: View source on `/insights/cobalt-in-battery-supply-chains`, check `og:image`
  - Expected: `/images/og/cobalt-in-battery-supply-chains.png` (1920×1080)

- [ ] **Case Studies** have OG images
  - Test: View source on `/case-studies/bauxite-payas-islahiye`
  - Expected: `/images/og/bauxite-payas-islahiye.png`

### Twitter Cards
- [ ] **Twitter card meta tags** present
  - Test: View source on any page, check `<meta name="twitter:*">`
  - Expected: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

### Canonical URLs
- [ ] **Canonical tags** present
  - Test: Check `<link rel="canonical">` on all pages
  - Expected: Matches current page URL (e.g., `https://scanminers.com/insights`)

---

## 7. Pre-Launch Checklist (Before Demo)

- [ ] **Deploy to staging/production**
  - Platform: Cloudflare Pages or Vercel
  - Environment variables set: `STABILITY_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

- [ ] **Test forms on live site** (Turnstile + Resend)
  - Submit prospectivity brief, consultation, contact forms
  - Verify emails delivered to `contact@scanminers.com`

- [ ] **Test on real devices**
  - iOS Safari (iPhone)
  - Android Chrome (Samsung/Huawei)
  - Desktop Chrome/Firefox/Safari

- [ ] **Final smoke test**
  - Visit homepage → Navigate to Insights → Click article → Back → Contact form
  - Verify no JS errors in console

- [ ] **Update sitemap**
  - Run: `npm run build` (generates sitemap.xml)
  - Verify `/sitemap.xml` includes all routes

- [ ] **Analytics installed** (optional)
  - Confirm Sentry tracking works (if configured)
  - Add Google Analytics / Plausible if required

---

## Sign-Off

**Tested by:** _______________ **Date:** _______________

**Approved by:** _______________ **Date:** _______________

**Notes:**

---

## Known Limitations

- Contentlayer warnings about missing `slug`/`summary` fields in `brand/amin-bio.mdx` and `brand/mahmood-bio.mdx` (these are admin-only, not public-facing)
- Build artifacts (`.next/`, `.open-next/`) have lint warnings—these are expected and don't affect source code quality
- OG images require `STABILITY_API_KEY` to regenerate (current set generated and committed)
