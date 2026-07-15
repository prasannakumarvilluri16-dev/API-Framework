## Optional XLSX support

This project reads test data from CSV files by default. Full `.xlsx` support is optional and disabled by default to avoid introducing additional transitive dependencies into the default test run.

To enable XLSX support locally or in a dedicated CI job:

1. Install the optional dependency:

```bash
npm install xlsx --save-optional
```

2. Set the feature flag and run tests (POSIX):

```bash
FEATURE_XLSX=true npx playwright test
```

Or PowerShell:

```powershell
$env:FEATURE_XLSX = 'true'; npx playwright test
```

Notes
- `tests/utils/readExcel.ts` will read CSV files by default. When `FEATURE_XLSX=true` it will attempt to load `xlsx` at runtime to read `.xlsx` files.
- `package.json` includes an `optionalDependencies` entry for `xlsx` and an `overrides` pin to a vetted version — install `xlsx` only when you need it.
- Keep CI jobs that run regularly without XLSX support. Add a separate job to enable XLSX tests when required.
