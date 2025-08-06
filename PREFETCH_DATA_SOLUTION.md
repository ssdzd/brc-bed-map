# Pre-fetch Data Solution

## Overview
This solution fetches Airtable data during the build process and serves it as a static JSON file, completely eliminating API keys from the client-side code.

## How It Works

1. **Build Time**: 
   - `npm run build` triggers `prebuild` script
   - `prebuild` runs `fetch-airtable-data.js` 
   - Script uses environment variables to fetch data from Airtable
   - Data is saved to `public/airtable-camps.json`

2. **Production Runtime**:
   - Client loads `/airtable-camps.json` as a static file
   - No API calls to Airtable
   - No API keys in JavaScript

## Changes Made

### 1. Created fetch script: `app/scripts/fetch-airtable-data.js`
- Fetches data from Airtable using server-side Node.js
- Transforms data to match expected format
- Saves to `public/airtable-camps.json`

### 2. Modified `app/src/utils/airtableClient.js`
- In production: loads static JSON file
- In development: still uses direct API (for live updates)
- API credentials only included in dev builds

### 3. Updated `package.json`
- Added `fetch-data` script
- Added `prebuild` hook to fetch data before building

## Testing Locally

1. Fetch the data:
   ```bash
   cd app
   source .env  # Load environment variables
   npm run fetch-data
   ```

2. Build and preview:
   ```bash
   npm run build
   npm run preview
   ```

3. Visit http://localhost:4173/brc-bed-map/

## Deployment

For GitHub Actions deployment, you'll need to:

1. Ensure GitHub Secrets are set:
   - `VITE_AIRTABLE_PAT`
   - `VITE_AIRTABLE_BASE_ID`
   - `VITE_AIRTABLE_TABLE_NAME`

2. The build process will automatically:
   - Fetch fresh data
   - Build without API keys
   - Deploy static files

## Updating Data

To update the data:
- Manually: Run `npm run fetch-data` and commit
- Automatically: Set up GitHub Action to run periodically

## Advantages
- ✅ No API keys in client code
- ✅ Works with GitHub Pages
- ✅ Fast loading (no API calls)
- ✅ Simple implementation

## Limitations
- Data is not real-time (updates on build)
- Requires rebuild to update data