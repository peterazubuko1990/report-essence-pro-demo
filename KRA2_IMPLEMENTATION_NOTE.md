# KRA 2 implementation note

## Scope

This note documents the KRA 2 implementation that is currently present in the project. It describes the approach that was used, the files that changed, the data flow, and the remaining gaps before KRA 2 fully matches the PowerPoint source.

## 1. How the PowerPoint/PPTX was used as the reference

The KRA 2 work was anchored to the PowerPoint-derived KRA content already captured in the project seed data rather than introducing a new reporting structure.

The implementation used the PowerPoint content as the reference for:
- the KRA 2 subsection sequence,
- the subsection labels such as 2.1, 2.2, 2.3, 2.4, 2.5, and 2.6,
- the KPI names inside each subsection,
- and the target/actual/% values used for the sample data.

The source of truth for this part of the work is the seed dataset in the project, which contains the KRA 2 subsection layout and KPI rows that were mapped into the existing reporting flow.

## 2. How the PowerPoint layout was mapped into the existing Corporate Performance module

The existing Corporate Performance route was extended so that KRA 2 is treated as a grouped report instead of a single flat list.

The mapping works as follows:
- the route detects that the requested KRA is KRA 2,
- rows are grouped by the existing subgroup field,
- each subgroup is rendered as its own report section,
- each section includes a title block and a comparison block for that subgroup.

This kept the implementation inside the existing route-based reporting module instead of creating a new route or a new reporting architecture.

## 3. How KRA 2 renders using the existing project architecture

KRA 2 was implemented in the existing Corporate Performance report flow using the current app structure:
- the route is still the same performance route,
- the report still uses the existing dashboard layout,
- the UI still uses the existing reusable report components,
- the data still comes from Supabase through the existing query layer.

The KRA 2 rendering path is handled in the performance route and uses the existing dashboard shell and the existing report block components.

## 4. How Supabase data was combined with the PowerPoint layout

The implementation combines two inputs:

1. Supabase data from the kra_rows table
   - this provides the live report rows for the selected year,
   - it provides the KPI values for target, actual, pct,
   - it provides the subgroup field used to group KRA 2 rows,
   - and it provides the previous-year comparison data for the same KPI set.

2. The PowerPoint-derived layout structure
   - this provides the KRA 2 subsection labels and KPI names that are used to structure the report and seed the data.

The route queries the current year and previous year rows from Supabase, then groups the current rows by subgroup. Each subgroup is rendered as a separate section with its own table and chart.

## 5. Files modified

The implementation that is currently present touches these files:

- src/routes/performance/$kra.tsx
  - KRA 2 detection and routing logic
  - grouping of rows by subgroup
  - rendering of each KRA 2 subsection as its own section
  - table and chart rendering for each subgroup

- src/components/dashboard/KraReportBlocks.tsx
  - reused comparison table component
  - reused percentage chart component
  - reused report header and section wrappers

- src/data/pptx-seed.ts
  - contains the PowerPoint-derived KRA 2 seed rows for the subsections and KPI entries
  - includes a helper that flattens the seed data into the kra_rows shape

- src/routes/admin.index.tsx
  - contains the admin action that replaces FY 2023/FY 2024 kra_rows data with the PowerPoint-derived KRA dataset

## 6. Components reused

The implementation reused the existing project components rather than creating a separate KRA 2 UI stack.

Reused components include:
- DashboardLayout
- EmptyState
- ReportHeader
- ComparisonTable
- PercentageChart
- CommentaryBlock
- the existing year context and query hooks
- the existing Supabase client integration

## 7. How the tables are generated

The table generation is handled by the existing comparison table component.

For each KRA 2 subgroup:
- the current rows for that subgroup are collected,
- the corresponding previous-year rows for the same subgroup are matched by KPI name,
- the component builds a comparison row for each KPI,
- the table displays the KPI name plus the previous-year and current-year target, actual, and percentage achieved values.

The table header changes depending on whether a previous year exists for comparison.

## 8. How the charts are generated

The chart generation is handled by the existing percentage chart component.

For each subgroup:
- the KPI rows are converted into chart data,
- the current year and previous year are used as the series labels,
- the chart is rendered as a bar chart with percentage values as the metric,
- the chart title is derived from the subgroup heading.

This uses the existing chart renderer and chart card components already present in the dashboard layer.

## 9. What comes from Supabase vs what comes from the PowerPoint layout

### Supabase
The following parts come from Supabase:
- the actual kra_rows values for the selected year,
- the previous-year comparison rows,
- KPI values such as target, actual, pct,
- subgroup values used for grouping,
- the sort order used to preserve row order.

### PowerPoint-based layout / seed data
The following parts are derived from the PowerPoint-based source data:
- the KRA 2 subsection labels,
- the KPI names per subsection,
- the initial seed values used to populate the data for FY 2023 and FY 2024,
- the structure that informs the subsection-based rendering.

## 10. Current assumptions and temporary logic

The current implementation still relies on a few assumptions:
- KRA 2 is detected by checking whether the route title starts with KRA 2.
- subgroup grouping is based on the subgroup field in kra_rows.
- subgroup headings are formatted using a simple parser for labels such as 2.1, 2.2, and so on.
- the UI uses a generic title and subtitle for the KRA 2 page rather than a fully slide-by-slide replica of the PowerPoint.
- the current implementation assumes there are existing rows in Supabase for the selected year and previous year to render the comparison.

## 11. What still needs to be completed before KRA 2 fully matches the PowerPoint

The current implementation is not yet a complete visual or data replica of the PowerPoint.

The remaining work includes:
- populating the target year’s Supabase data with the full KRA 2 set if it has not yet been loaded,
- verifying that the exact subsection titles, KPI names, and values in the live database match the intended PowerPoint content,
- refining the presentation details so the page more closely mirrors the PowerPoint slide layout, wording, and spacing,
- confirming the final slide order and headings for every subgroup if the source deck requires more precise wording.

No automated PPT parser or full slide-by-slide renderer was added in this implementation.

## 12. How another Copilot should use the same approach for KRA 3 and later KRAs

To continue the same pattern for KRA 3 and the remaining KRAs, another Copilot should follow this approach:

1. Use the existing Corporate Performance route as the integration point.
2. Extend the route so the target KRA is recognized and handled by the same report pattern.
3. If the new KRA has subgroups, group rows by subgroup in the same way KRA 2 does.
4. Reuse the existing comparison table and percentage chart components for the per-subgroup sections.
5. Add the KRA-specific seed rows to the PowerPoint seed file so the layout and KPI content are captured in one place.
6. Add an admin load action only if the project needs a quick way to replace that year’s rows with the seed content.
7. Load the rows into Supabase for the target year and verify that the route renders them correctly.
8. Keep the implementation within the existing architecture instead of introducing new routes, tables, or reporting modules unless the current model clearly cannot support the new section.

This approach preserves the structure that is already in place and lets each subsequent KRA be implemented by extending the same reporting flow rather than rebuilding it from scratch.
