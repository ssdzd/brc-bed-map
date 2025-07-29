# Test Directory

This directory contains all test files for the BRC BED Map project, organized by category.

## Structure

- **address-parsing/** - Tests for address parsing and block mapping logic
- **airtable/** - Tests for Airtable integration and data fetching
- **integration/** - Integration tests and embedded map testing
- **debug-duplicates.js** - Debug utility for finding duplicate camp entries

## Running Tests

### Address Parsing Tests
```bash
node test/address-parsing/test-address-pipeline.js
node test/address-parsing/test-complete-mapping.js
```

### Airtable Tests
```bash
node test/airtable/test-airtable.js
```

### Integration Tests
Open `test/integration/test-embed-bed-map.html` in a browser to test embedded map functionality.

## Notes
- React component tests are located in `app/src/test/`
- Playwright E2E tests are configured in `app/playwright.config.js`