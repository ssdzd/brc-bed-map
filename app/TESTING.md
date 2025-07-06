# BED Map Testing Suite

This document describes the comprehensive testing suite for the BED Map application.

## Testing Structure

### Test Categories

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Data flow and component interactions
3. **End-to-End Tests** - Complete user workflows

### Test Files Organization

```
src/test/
├── setup.js                    # Test environment setup
├── utils/
│   └── blockUtils.test.js      # Utility function tests
├── hooks/
│   └── useMapData.test.js      # React hooks tests
├── components/
│   ├── Legend.test.jsx         # Legend component tests
│   └── SearchPanel.test.jsx    # Search panel tests
├── integration/
│   └── map-data-flow.test.jsx  # Integration tests
└── e2e/
    └── map-interactions.spec.js # End-to-end tests
```

## Test Dependencies

### Required Dependencies
When npm is available, install these dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom @playwright/test
```

### Testing Framework
- **Vitest** - Fast unit and integration testing
- **Testing Library** - React component testing utilities
- **Playwright** - End-to-end browser testing

## Running Tests

### Unit & Integration Tests
```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### End-to-End Tests
```bash
# Install browser dependencies
npm run test:install

# Run all e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Debug e2e tests
npm run test:e2e:debug
```

### All Tests
```bash
# Run both unit and e2e tests
npm run test:all
```

## Test Coverage

### Unit Tests Coverage

**Utility Functions (`blockUtils.js`)**
- ✅ Block ID parsing (old and new formats)
- ✅ Display address conversion
- ✅ Camp-to-block matching logic
- ✅ Block coloring based on BED status
- ✅ Theme color systems
- ✅ Plaza quarter geographic naming

**React Hooks (`useMapData.js`)**
- ✅ Mock data generation and loading
- ✅ Airtable API integration with fallback
- ✅ Error handling and state management
- ✅ Data refresh functionality
- ✅ Address validation and filtering

**React Components**
- ✅ Legend rendering and theming
- ✅ Search panel filtering and selection
- ✅ Component prop handling
- ✅ User interaction events

### Integration Tests Coverage

**Data Flow Integration**
- ✅ Hook data integration with map rendering
- ✅ Data refresh across components
- ✅ Block coloring integration with camp data
- ✅ Error state handling in data flow
- ✅ Airtable fallback mechanisms
- ✅ Data consistency across components

### End-to-End Tests Coverage

**Core User Workflows**
- ✅ Map loading and initial state
- ✅ Theme switching functionality
- ✅ Search panel operations
- ✅ Camp search and selection
- ✅ Map zoom and pan controls
- ✅ Block click interactions
- ✅ Tooltip hover behaviors
- ✅ Statistics panel display
- ✅ URL sharing functionality
- ✅ Data source switching
- ✅ Mobile responsiveness
- ✅ Keyboard navigation
- ✅ Error state handling

## Test Configuration

### Vitest Configuration (`vite.config.test.js`)
- JSdom environment for DOM testing
- Global test utilities
- Coverage reporting
- CSS processing
- Test setup file integration

### Playwright Configuration (`playwright.config.js`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video capture on failures
- Test retries and parallelization
- Local development server integration

### Test Setup (`src/test/setup.js`)
- Jest-DOM matchers for better assertions
- Mock implementations for browser APIs
- SVG and localStorage mocking
- Test environment configuration

## Best Practices

### Unit Test Guidelines
1. Test individual functions in isolation
2. Mock external dependencies
3. Test both success and error cases
4. Use descriptive test names
5. Group related tests with `describe` blocks

### Integration Test Guidelines
1. Test data flow between components
2. Verify state management across hooks
3. Test error boundaries and fallbacks
4. Validate component communication

### E2E Test Guidelines
1. Test complete user workflows
2. Use data-testid attributes for reliable selectors
3. Test on multiple devices and browsers
4. Include accessibility and keyboard navigation
5. Test error scenarios and edge cases

## Mock Data Strategy

### Mock Data Generation
- Generates realistic camp data with proper address formats
- Validates BED status distribution
- Supports geographic plaza quarter addressing
- Includes special locations (BRC Airport, Center Camp)

### Fallback Mechanisms
- Automatic fallback from Airtable to mock data
- Error handling with user-friendly messages
- Data validation and filtering
- Consistent data structure across sources

## CI/CD Integration

### GitHub Actions Integration
The testing suite is designed to work with GitHub Actions:

```yaml
- name: Run Tests
  run: |
    npm test
    npm run test:e2e
```

### Test Requirements
- All tests must pass before deployment
- Coverage thresholds must be met
- E2E tests must pass on multiple browsers
- Mobile compatibility must be verified

## Debugging Tests

### Unit Test Debugging
- Use `vitest --ui` for interactive debugging
- Add `console.log` statements in test files
- Use `screen.debug()` for component state inspection

### E2E Test Debugging
- Use `playwright test --debug` for step-by-step debugging
- Screenshots and videos are captured on failures
- Use `page.pause()` for manual inspection

## Test Data Management

### Test Data Sources
- Mock data generator for predictable test scenarios
- Airtable integration testing with fallback
- Address parsing validation
- BED status distribution testing

### Test Isolation
- Each test runs in isolation
- Mock implementations are reset between tests
- Component state is cleaned up after each test
- No shared state between test files

## Performance Testing

### Load Testing Considerations
- Test with large datasets (500+ camps)
- Verify map rendering performance
- Test search filtering with many results
- Monitor memory usage during long test runs

### Accessibility Testing
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- ARIA label verification

## Maintenance

### Keeping Tests Updated
- Update tests when components change
- Add tests for new features
- Remove tests for deprecated functionality
- Keep mock data synchronized with real data structure

### Test Review Process
- All new features must include tests
- Test coverage should not decrease
- E2E tests should cover critical user paths
- Performance regression tests for major changes