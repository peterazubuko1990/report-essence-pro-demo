# Revenue source-of-truth handoff

## Purpose
This document is the implementation handoff for the revenue rebuild. The next assistant should continue from this and complete the work without re-deriving the architecture from scratch.

## Core rule
The source of truth for revenue across the app must be the area-office revenue data entered through the admin UI.

Do not use the headline revenue rows from the admin flow as the primary source for executive or report totals.

## Why this matters
The app currently has a split model:
- the executive overview uses the headline revenue rows
- the revenue analysis page uses the detailed area-office revenue rows

That creates inconsistent numbers and misses the full revenue structure described in the document.

## The business rule to preserve
Revenue must be derived from the same detailed data used by admin for:
- Training Contribution
- Course Fee
- Other Income

This should apply to:
- executive overview
- revenue analysis page
- analytics page
- any other revenue-facing view in the app

## Authoritative tables
Use the existing area-office revenue table as the source of truth:
- area_revenue

Each row should be treated as one office/stream entry with fields such as:
- office
- category
- stream
- target
- actual
- year

## What the app must do
The app must aggregate from the area-office revenue rows and present the results in the UI in a way that matches the document structure.

### Required revenue sections
The UI should show these sections:
1. Category A
   - Training Contribution
   - Course Fee
   - Other Income
2. Category B
   - Training Contribution
   - Course Fee
   - Other Income
3. Category C
   - Training Contribution
   - Course Fee
   - Other Income
4. Training Centres
   - Course Fee
   - Other Income

### Required revenue calculations
From the area-office data, derive:
- total revenue
- training contribution total
- course fee total
- other income total
- totals by category
- totals by office
- totals for training centres

## Important implementation detail
Other Income must be treated as a first-class revenue stream, not as a secondary or missing value.

It should appear in:
- executive overview cards
- revenue analysis sections
- charts and summaries
- any total revenue calculation

## What to change in the UI
### Executive overview
The executive overview should no longer depend on the separate headline revenue rows for its core totals.

It should instead:
- load the current year’s area-office revenue rows
- aggregate by stream
- show totals for Training Contribution, Course Fee, Other Income, and Total Revenue
- use that same aggregated data for the revenue chart and KPI cards

### Revenue analysis page
The revenue analysis page should be reshaped to match the document structure.

It should show grouped blocks for:
- Category A
- Category B
- Category C
- Training Centres

Each group should display the revenue streams that exist for that group.

For example:
- Category A/B/C should show Training Contribution, Course Fee, Other Income
- Training Centres should show Course Fee and Other Income

### Analytics page
Any revenue analytics or visualizations should also be driven from the same area-office revenue source.

## Implementation approach
### Step 1 — Create one shared revenue aggregation helper
Create a shared helper that takes the current year’s area-office rows and returns a normalized revenue model.

This helper should produce something like:
- totalsByStream
- totalsByCategory
- totalsByOffice
- trainingCentreRows
- categoryRows

### Step 2 — Use the helper in all revenue pages
Use the helper in:
- executive overview
- revenue analysis
- analytics

### Step 3 — Replace headline-row logic
Remove or bypass any logic that uses the headline revenue rows as the primary source for revenue reporting.

### Step 4 — Add the missing Other Income handling
Ensure Other Income is included in every revenue representation and calculation.

### Step 5 — Add Training Centres support
Training Centres should be rendered as their own section and populated from the same area-office revenue entries.

### Step 6 — Keep the UI structure aligned with the document
The UI should reflect the same structure described in the document rather than a simplified summary page.

## Expected end state
When completed:
- updating area-office revenue in admin updates the front-end revenue pages
- executive overview and revenue analysis show the same revenue numbers for the same year
- Other Income is included everywhere
- Training Centres appear correctly
- the revenue UI matches the intended document structure

## Important notes for the next assistant
- Do not introduce a second revenue source of truth.
- Do not rely on separate headline rows for the core reporting logic.
- Use area_revenue as the canonical source.
- Build the UI around the grouped structure described above.
- Treat Other Income as a real revenue stream, not a special case.

## Suggested implementation order
1. Add a shared revenue aggregation helper.
2. Switch the executive overview to use it.
3. Reshape the revenue page into category-based sections.
4. Add training centre support.
5. Update analytics to use the same revenue logic.
6. Verify totals and visual output.

## Files to inspect first
- src/routes/index.tsx
- src/routes/revenue.tsx
- src/routes/analytics.tsx
- src/routes/admin.index.tsx
- src/lib/year-context.tsx
- src/integrations/supabase/types.ts

## Files that likely need edits
- src/routes/index.tsx
- src/routes/revenue.tsx
- src/routes/analytics.tsx
- possibly src/lib or a new shared helper file if one is introduced

## Final instruction
Finish the revenue rebuild so the entire app uses one consistent revenue source and presents it in the UI according to the document structure, including Category A/B/C and Training Centres, with Course Fee and Other Income fully included.
