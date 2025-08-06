# Deployment Steps for Pre-fetch Data Solution

## Current Status
✅ Solution is working locally in production mode
✅ No API keys in client-side JavaScript
✅ Data loads from static JSON file

## To Deploy to Production

### 1. Update GitHub Actions Workflow
The deploy workflow needs to pass environment variables to the build process:

```yaml
- name: Build project
  env:
    VITE_AIRTABLE_PAT: ${{ secrets.VITE_AIRTABLE_PAT }}
    VITE_AIRTABLE_BASE_ID: ${{ secrets.VITE_AIRTABLE_BASE_ID }}
    VITE_AIRTABLE_TABLE_NAME: ${{ secrets.VITE_AIRTABLE_TABLE_NAME }}
  run: npm run build
```

### 2. Ensure airtable-camps.json is included in deployment
The file needs to be in the `dist` directory when deploying.

### 3. Test the branch
Before merging to main:
1. Push the prefetch-data-fix branch
2. Create a test deployment
3. Verify the map works with real data

## Files Changed
- `app/scripts/fetch-airtable-data.js` - New script to fetch data at build time
- `app/src/utils/airtableClient.js` - Modified to use static data in production
- `app/package.json` - Added prebuild hook
- `app/public/airtable-camps.json` - Generated data file (gitignored)

## How It Works
1. Build process runs `fetch-airtable-data.js` using server-side Node.js
2. Script fetches from Airtable using environment variables
3. Data saved to `public/airtable-camps.json`
4. Production app loads JSON file instead of making API calls
5. No API keys are included in client-side code

## To Update Data
- Automatic: GitHub Actions runs build on every deploy
- Manual: Run `npm run fetch-data` locally and commit the JSON file

## Rollback Plan
If issues arise:
1. `git checkout main` 
2. `git push --force origin main`
3. Revert to the current working version with exposed API key