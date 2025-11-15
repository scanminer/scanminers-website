# Manual QA Checklist: Social Tab & Content Filtering

## Prerequisites
- [ ] OPENAI_API_KEY is set in environment variables
- [ ] At least one Insight and one Case Study exist in content/
- [ ] Dev server running: `npm run dev`

## Part 1: Social Tab - AI Generation

### LinkedIn Post Generation
1. [ ] Navigate to `/admin/editor/{slug}` for any insight or case study
2. [ ] Click the "Social" tab
3. [ ] Verify the "LinkedIn Post" section is visible
4. [ ] Click "Generate" button
   - [ ] Button shows "Generating..." loading state
   - [ ] After 3-5 seconds, textarea appears with generated content
   - [ ] Content is 300-500 words, professional B2B tone
   - [ ] Includes 2-3 hashtags
   - [ ] Ends with engagement question
   - [ ] Word count shown below textarea
5. [ ] Edit the generated text
6. [ ] Click "Copy" button
   - [ ] Button briefly shows "Copied!"
   - [ ] Paste somewhere to verify clipboard content matches textarea

### LinkedIn Carousel Outline
1. [ ] In same Social tab, scroll to "LinkedIn Carousel Outline"
2. [ ] Click "Generate" button
   - [ ] Loading state appears
   - [ ] 8-10 slide outline appears
   - [ ] Each slide has headline + bullet points
   - [ ] Slide 1 is hook, final slide is CTA
3. [ ] Click "Copy" button and verify

### X (Twitter) Post
1. [ ] Scroll to "X (Twitter) Post" section
2. [ ] Click "Generate" button
   - [ ] Loading state appears
   - [ ] Short post appears (~240 characters)
   - [ ] Includes [LINK] placeholder
   - [ ] Character count shown (should be under 280)
3. [ ] Test: Edit to exceed 280 characters
   - [ ] Character count turns red with "(too long!)" warning
4. [ ] Click "Copy" and verify

### Email Newsletter Teaser
1. [ ] Scroll to "Email Newsletter Teaser" section
2. [ ] Click "Generate" button
   - [ ] Loading state appears
   - [ ] Subject line + body appears (100-150 words)
   - [ ] Professional, value-first tone
   - [ ] Includes clear CTA
3. [ ] Click "Copy" and verify

### OG Image Prompt
1. [ ] Scroll to "OG Image Prompt" section
2. [ ] Click "Generate" button
   - [ ] Loading state appears
   - [ ] 50-80 word Stability AI prompt appears
   - [ ] Technical, scientific style description
3. [ ] Click "Copy" and verify

### Error Handling
1. [ ] With network offline, try generating any snippet
   - [ ] Error alert appears with descriptive message
2. [ ] Try with invalid slug (modify URL to `/admin/editor/nonexistent-slug`)
   - [ ] Should see "Content not found" or 404 page

## Part 2: Content Filtering - Status-Based Visibility

### Setup Test Content
1. [ ] Create or modify test insight with status="draft"
   - Use Content tab → set Status dropdown to "draft" → Save Draft
2. [ ] Create or modify test insight with status="review"
3. [ ] Create or modify test insight with status="scheduled" + future publishAt
   - Set Status to "scheduled", set Publish At to tomorrow's date
4. [ ] Create or modify test insight with status="scheduled" + past publishAt
   - Set Status to "scheduled", set Publish At to yesterday's date
5. [ ] Ensure at least one insight with status="published" exists

### Test Insights Index Page
1. [ ] Navigate to `/insights`
2. [ ] Verify only published insights appear
3. [ ] Verify scheduled insights with past dates appear
4. [ ] Verify draft insights do NOT appear
5. [ ] Verify review insights do NOT appear
6. [ ] Verify scheduled insights with future dates do NOT appear
7. [ ] Count visible insights matches filterVisibleContent behavior

### Test Case Studies Index Page
1. [ ] Set up same test statuses for case studies
2. [ ] Navigate to `/case-studies`
3. [ ] Verify same filtering behavior as insights
4. [ ] Verify drafts and future-scheduled content hidden

### Test Individual Pages
1. [ ] Navigate directly to `/insights/{slug}` for a draft post
   - [ ] Should still be accessible (no filtering on detail pages)
2. [ ] Verify same for case studies

### Backward Compatibility
1. [ ] Test with old content files that lack status/publishAt fields
   - [ ] Should appear on index pages (treated as published)
2. [ ] Open in editor → Content tab
   - [ ] Status defaults to "published" (or current schema default)

## Part 3: Integration Testing

### Full Workflow
1. [ ] Create new draft insight via editor
2. [ ] Navigate to `/insights` → verify it's hidden
3. [ ] Change status to "scheduled" + set publishAt to 5 minutes from now
4. [ ] Save draft
5. [ ] Generate all social snippets → verify they work
6. [ ] Wait 5 minutes, refresh `/insights`
   - [ ] Content now appears (scheduled date passed)
7. [ ] Change status to "published"
8. [ ] Publish via "Publish" button
9. [ ] Verify GitHub PR created with correct metadata

### Edge Cases
1. [ ] Test with very short content (1 paragraph)
   - [ ] Social generation should still work
2. [ ] Test with very long content (3000+ words)
   - [ ] Social generation should create concise snippets
3. [ ] Test content with no commodities/tags
   - [ ] Should not crash generation
4. [ ] Test with special characters in content
   - [ ] Should not break generation or filtering

## Expected Outcomes

### Social Tab
✅ All 5 generation buttons work independently  
✅ Loading states show during API calls  
✅ Generated content is brand-appropriate and professional  
✅ Copy buttons work for all snippets  
✅ Character counts accurate (especially X post limit)  
✅ Error handling works gracefully  

### Content Filtering
✅ Draft content never appears on public pages  
✅ Review content never appears on public pages  
✅ Scheduled future content hidden until publishAt date  
✅ Scheduled past content appears immediately  
✅ Published content always visible  
✅ Old content without status fields still works  
✅ Filtering preserves sort order (newest first)  

## Performance Checks
- [ ] Social generation completes in under 10 seconds per snippet
- [ ] No console errors during any operation
- [ ] Page load times unaffected by filtering logic
- [ ] Editor UI remains responsive during generation

## Notes
Record any issues, unexpected behavior, or suggestions for improvement:

```
[Your notes here]
```

---

**Tester:** _______________  
**Date:** _______________  
**Commit/Branch:** _______________
