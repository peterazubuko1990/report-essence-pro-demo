Import area_revenue

Usage

1. Install dependencies:

```bash
npm install
```

2. Prepare your CSV or XLSX file following the template header: `office,category,stream,target,actual`.

3. Dry-run validation (won't write):

```bash
SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=service_role_key npm run import:area_revenue -- ./data/my-upload.csv --year=2024 --dry-run
```

4. To execute (this will DELETE existing `area_revenue` rows for the specified year and insert the uploaded rows):

```bash
SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=service_role_key npm run import:area_revenue -- ./data/my-upload.csv --year=2024
```

Notes

- The script validates `office` against a master list embedded in `scripts/import-area-revenue.mjs`.
- `SUPABASE_KEY` should be a service role key capable of deleting/inserting rows.
- Use `--dry-run` first to ensure mapping and values are correct.

