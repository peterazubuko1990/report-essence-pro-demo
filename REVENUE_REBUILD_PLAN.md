# Revenue data rebuild plan

## Goal
Make revenue across the app come from one authoritative source: the area-office revenue data entered through the admin panel.

This plan is based on the revenue structure you described from the document:
- Category A shows Training Contribution, Course Fee, and Other Income
- Category B shows Training Contribution, Course Fee, and Other Income
- Category C shows Training Contribution, Course Fee, and Other Income
- Training Centres show Course Fee and Other Income

The implementation will ensure that:
- the executive overview uses the same revenue values as the revenue analysis page
- Other Income is included in the same aggregation logic as Training Contribution and Course Fee
- the revenue page reflects the structure from the document rather than only a simplified summary

## Current problem
The app is currently split between two revenue sources:
- the executive overview is using the headline revenue rows from the admin flow
- the revenue analysis page is using the detailed area-office rows

That causes mismatches and leaves Other Income underrepresented or inconsistent across views.

## Core decision
Use the area-office revenue table as the single source of truth for revenue logic.

The expected data model is already present in the app:
- office
- category
- stream
- target
- actual
- year

The app will aggregate from those rows to build:
- total revenue
- training contribution
- course fee
- other income

## Step-by-step implementation plan

### Step 1 — Create a shared revenue aggregation layer
Build one shared helper that reads the area-office revenue rows and returns:
- totals by stream
- totals by category
- totals by office
- totals for training centres

This helper will be used by:
- the executive overview page
- the revenue analysis page
- the analytics page
- any future revenue dashboard views

### Step 2 — Change the executive overview to use area-office revenue
Update the executive overview so that:
- Total Revenue is derived from the sum of all area-office revenue rows for the selected year
- Training Contribution is derived from the Training Contribution rows
- Course Fee is derived from the Course Fee rows
- Other Income is derived from the Other Income rows

This will replace the current dependence on the headline revenue rows for core revenue KPIs.

### Step 3 — Reshape the revenue page around the document structure
Rebuild the revenue page so it follows the structure you described:
1. Section for Category A
   - Training Contribution
   - Course Fee
   - Other Income
2. Section for Category B
   - Training Contribution
   - Course Fee
   - Other Income
3. Section for Category C
   - Training Contribution
   - Course Fee
   - Other Income
4. Section for Training Centres
   - Course Fee
   - Other Income

This should replace the current simplified table layout with a structure that reflects the document’s category-based design.

### Step 4 — Include Training Centres as a first-class revenue section
Training Centres should not be treated as an afterthought.

They will be shown as their own block using the same revenue logic as the categories, but with the relevant rows pulled from the area-office revenue data.

This means:
- if the admin enters Course Fee or Other Income for a training centre office, it will appear in the report automatically
- the training centre section will be built from the same source as Category A/B/C

### Step 5 — Make the revenue page use one consistent data shape
The page should be built from normalized records like:
- office
- category/group
- stream
- actual
- target

Then the UI should render those values into the correct sections.

This avoids hard-coding separate logic for each stream and keeps the page maintainable.

### Step 6 — Update analytics and any other revenue-facing views
Any page that currently shows revenue numbers should be switched to the same shared aggregation logic.

That includes:
- executive overview
- revenue page
- analytics page

The goal is that all of them reflect the same revenue numbers for the same year.

### Step 7 — Keep admin editing simple and consistent
The admin experience should continue to edit the detailed area-office values, not require separate duplicate entries.

That means:
- the area-office revenue form remains the main editing surface
- the app aggregates from those rows automatically
- the admin does not need to maintain separate headline rows for the same values

### Step 8 — Verify with real data and build checks
After the implementation:
- verify that totals match the sum of the area-office rows
- verify that Other Income appears in the executive summary and revenue page
- verify that Training Centres appear correctly
- run the build and fix any issues before finishing

## Acceptance criteria
The work is complete when:
- the executive overview shows totals derived from area-office revenue
- the revenue analysis page shows Category A, B, C, and Training Centres based on the same data
- Other Income is included in the revenue view alongside Course Fee and Training Contribution
- updating area-office revenue in admin updates the front-end revenue pages automatically

## Expected outcome
The app will behave as a single integrated revenue reporting system rather than two partially disconnected sources.
