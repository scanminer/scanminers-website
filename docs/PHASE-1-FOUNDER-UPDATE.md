# PHASE 1 — Founder Title & Bio Update

**Date:** November 15, 2025  
**Status:** ✅ Complete

## Overview

Complete implementation of the PHASE 1 founder content package, updating all brand materials, website pages, AI systems, and metadata with the new official Co-Founder titles and professional bios.

---

## Official Titles

### Dr. Amin Beiranvand Pour
**Co-Founder & Chief Scientist**
- Scientific authority and methodologies
- Multi-sensor remote sensing expertise
- Research validation and geoscience leadership

### Mahmood Asadi
**Co-Founder & Chief AI & Product Architect**
- AI strategy and platform architecture
- Product vision and UX design
- Technical leadership and system automation
- Transforms scientific research into scalable GeoAI software

---

## Changes Implemented

### 1. ✅ Updated `/app/about/page.tsx`
- Replaced team section with new Co-Founder titles
- Integrated medium-length bios for both founders
- Dr. Amin: "Co-Founder & Chief Scientist" with ORCID link
- Mahmood: "Co-Founder & Chief AI & Product Architect"
- Emphasized role bridging: scientific innovation → practical technology

### 2. ✅ Created `/content/brand/mahmood-bio.mdx`
All 3 bio versions for reusability:
- **Short Bio:** Homepage, footer, press kit (3 sentences)
- **Medium Bio:** About page, case studies, email signatures (2 paragraphs)
- **Long Bio:** Investors, partners, government, whitepapers (3-4 paragraphs)
- Email signatures for prospectivity brief and consultation replies

### 3. ✅ Created `/content/brand/amin-bio.mdx`
Complete bio package:
- Short, medium, and long versions
- ORCID profile link: 0000-0002-7606-5619
- Email signature template
- Focus on scientific authority, 300+ publications, global collaborations

### 4. ✅ Updated `/content/brand/voice.mdx`
Added "Founding Team Voice Authority" section:
- Listed both founders with official titles
- Role descriptions for content guidance
- Updated frontmatter with founders metadata
- Added checklist item: "Reflect scientific authority from Dr. Amin and technical + product leadership from Mahmood"
- Emphasized unified GeoAI brand narrative

### 5. ✅ Updated `/lib/ai/lead-replies.ts`
AI email template signatures:
- Base system prompt: Sign as "Mahmood Asadi, Co-Founder & Chief AI & Product Architect, Scanminers"
- Prospectivity brief guidance: "Best regards, Mahmood Asadi, Co-Founder & Chief AI & Product Architect, Scanminers"
- Consultation guidance: "Warm regards, Mahmood Asadi, Co-Founder & Chief AI & Product Architect, Scanminers"

### 6. ✅ Added Schema.org JSON-LD to `/app/layout.tsx`
Structured data for both founders:
```json
"founder": [
  {
    "@type": "Person",
    "name": "Dr. Amin Beiranvand Pour",
    "jobTitle": "Co-Founder & Chief Scientist"
  },
  {
    "@type": "Person",
    "name": "Mahmood Asadi",
    "jobTitle": "Co-Founder & Chief AI & Product Architect"
  }
]
```

### 7. ✅ Verified Homepage
- Checked for team mentions (none requiring updates)
- "Meet the team" link points to /about (correctly updated)
- No direct founder references on homepage

---

## Verification Results

### ESLint
```
✅ Clean — 0 errors, 0 warnings
```

### TypeScript
```
✅ Clean — 0 type errors
```

### Production Build
```
✅ Success — Build completed successfully
- 11 pages indexed
- 1,142 words indexed
- All routes compiled correctly
```

---

## Brand System Impact

### Content Files Updated: 6
1. `app/about/page.tsx` — Team section with new titles and medium bios
2. `content/brand/mahmood-bio.mdx` — Complete bio package (NEW)
3. `content/brand/amin-bio.mdx` — Complete bio package (NEW)
4. `content/brand/voice.mdx` — Added founder voice authority
5. `lib/ai/lead-replies.ts` — Updated AI email signatures
6. `app/layout.tsx` — Added Schema.org founder metadata

### Brand Assets Ready for Use
- ✅ Short bios (press kit, homepage, footer)
- ✅ Medium bios (about page, case studies, email signatures)
- ✅ Long bios (investors, partners, whitepapers, government)
- ✅ Email signature blocks (both founders)
- ✅ AI template signatures (prospectivity brief, consultation)
- ✅ Schema.org structured data (SEO, search engines)
- ✅ Brand voice system (content guidance for all channels)

---

## Design Decisions

### Title Selection: "Co-Founder & Chief AI & Product Architect"
**Why this title works:**
- Signals co-founding equity and leadership
- "Chief AI" positions as AI strategy lead
- "Product Architect" emphasizes end-to-end platform design
- Modern, investor-ready positioning for deep-tech startups
- Distinguishes from "CTO" (too generic) or "VP Engineering" (too operational)
- Matches titles used by top-tier AI-first mining/geospatial companies

### Bio Structure
- **Short:** Elevator pitch (3 sentences max)
- **Medium:** Value proposition (2 paragraphs, ~120 words)
- **Long:** Full narrative (3-4 paragraphs, ~200-250 words)
- All versions emphasize: AI strategy → platform architecture → bridging science/software

### Voice System Integration
- Founders section added to voice.mdx frontmatter for AI training
- Content guidelines emphasize dual authority: scientific (Dr. Amin) + technical (Mahmood)
- Unified GeoAI narrative maintained across all channels

---

## Next Steps (Optional)

### Immediate (Already Complete)
- ✅ All brand content updated
- ✅ Website reflects new titles
- ✅ AI systems use correct signatures
- ✅ Build verified and ready for deployment

### Future Enhancements (When Needed)
1. **Press Kit:** Export PDFs with founder bios for media inquiries
2. **LinkedIn Updates:** Sync title changes to personal profiles
3. **Email Signatures:** Update personal email clients with new signature blocks
4. **Investor Decks:** Incorporate long bios into pitch materials
5. **Team Page Expansion:** Add photos, expanded bios, or video introductions

---

## Deployment Checklist

- [x] All files created and updated
- [x] Lint passed (0 errors)
- [x] TypeScript passed (0 errors)
- [x] Build succeeded
- [x] About page renders correctly
- [x] Brand content files accessible
- [x] AI templates updated
- [x] Schema.org metadata validates
- [x] Voice system includes founder guidance

**Status:** Ready for Git commit and deployment to production.

---

## Summary

**PHASE 1 is complete.** All founder titles, bios, and brand materials have been systematically updated across the Scanminers platform. The official titles are:

- **Dr. Amin Beiranvand Pour:** Co-Founder & Chief Scientist
- **Mahmood Asadi:** Co-Founder & Chief AI & Product Architect

Every component—from the `/about` page to AI email templates to Schema.org metadata—now reflects this unified, investor-ready positioning. The brand voice system has been enhanced with founder authority guidance, and all changes have passed lint, typecheck, and production build verification.

**Total Files Modified:** 6  
**Total New Content Files:** 2 (mahmood-bio.mdx, amin-bio.mdx)  
**Build Status:** ✅ Successful  
**Ready for Deployment:** Yes
