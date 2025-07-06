import { test, expect } from '@playwright/test'

test.describe('BED Map Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the map to load
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 10000 })
  })

  test('should load the map with header and controls', async ({ page }) => {
    // Check header is present
    await expect(page.locator('h1')).toContainText('BED Map')
    
    // Check legend is present
    await expect(page.locator('.legend-container')).toBeVisible()
    
    // Check zoom controls are present
    await expect(page.locator('[data-testid="zoom-in"]')).toBeVisible()
    await expect(page.locator('[data-testid="zoom-out"]')).toBeVisible()
    await expect(page.locator('[data-testid="zoom-reset"]')).toBeVisible()
  })

  test('should handle theme switching', async ({ page }) => {
    // Find and click theme switcher
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]')
    await expect(themeSwitcher).toBeVisible()
    
    // Get initial theme
    const initialTheme = await page.getAttribute('body', 'data-theme')
    
    // Switch theme
    await themeSwitcher.click()
    
    // Wait for theme change
    await page.waitForTimeout(500)
    
    // Check theme changed
    const newTheme = await page.getAttribute('body', 'data-theme')
    expect(newTheme).not.toBe(initialTheme)
  })

  test('should open and close search panel', async ({ page }) => {
    // Find search panel toggle
    const searchToggle = page.locator('[data-testid="search-toggle"]')
    await expect(searchToggle).toBeVisible()
    
    // Open search panel
    await searchToggle.click()
    
    // Check search panel is visible
    await expect(page.locator('[data-testid="search-panel"]')).toBeVisible()
    
    // Check search input is present
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
    
    // Close search panel
    await searchToggle.click()
    
    // Check search panel is hidden
    await expect(page.locator('[data-testid="search-panel"]')).not.toBeVisible()
  })

  test('should search for camps', async ({ page }) => {
    // Open search panel
    await page.locator('[data-testid="search-toggle"]').click()
    
    // Wait for search panel to be visible
    await expect(page.locator('[data-testid="search-panel"]')).toBeVisible()
    
    // Type in search input
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('Test Camp')
    
    // Wait for search results
    await page.waitForTimeout(300)
    
    // Check search results are filtered
    const campResults = page.locator('[data-testid^="camp-result-"]')
    await expect(campResults.first()).toBeVisible()
    
    // Click on a camp result
    await campResults.first().click()
    
    // Check that info panel opens
    await expect(page.locator('[data-testid="info-panel"]')).toBeVisible()
  })

  test('should handle map zooming', async ({ page }) => {
    // Get initial map state
    const mapContainer = page.locator('[data-testid="map-container"]')
    const initialTransform = await mapContainer.evaluate(el => {
      return window.getComputedStyle(el).transform
    })
    
    // Zoom in
    await page.locator('[data-testid="zoom-in"]').click()
    await page.waitForTimeout(300)
    
    // Check transform changed
    const zoomedTransform = await mapContainer.evaluate(el => {
      return window.getComputedStyle(el).transform
    })
    expect(zoomedTransform).not.toBe(initialTransform)
    
    // Zoom out
    await page.locator('[data-testid="zoom-out"]').click()
    await page.waitForTimeout(300)
    
    // Reset zoom
    await page.locator('[data-testid="zoom-reset"]').click()
    await page.waitForTimeout(300)
  })

  test('should handle block clicks', async ({ page }) => {
    // Click on a map block
    const mapBlock = page.locator('[data-testid^="block-"]').first()
    await mapBlock.click()
    
    // Check that info panel opens
    await expect(page.locator('[data-testid="info-panel"]')).toBeVisible()
    
    // Check that block information is displayed
    await expect(page.locator('[data-testid="block-address"]')).toBeVisible()
  })

  test('should handle block hover tooltips', async ({ page }) => {
    // Hover over a map block
    const mapBlock = page.locator('[data-testid^="block-"]').first()
    await mapBlock.hover()
    
    // Check tooltip appears
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible()
    
    // Move away from block
    await page.locator('body').hover()
    
    // Check tooltip disappears
    await expect(page.locator('[data-testid="tooltip"]')).not.toBeVisible()
  })

  test('should display stats panel', async ({ page }) => {
    // Open stats panel
    await page.locator('[data-testid="stats-toggle"]').click()
    
    // Check stats panel is visible
    await expect(page.locator('[data-testid="stats-panel"]')).toBeVisible()
    
    // Check statistics are displayed
    await expect(page.locator('[data-testid="total-camps"]')).toBeVisible()
    await expect(page.locator('[data-testid="status-breakdown"]')).toBeVisible()
  })

  test('should handle URL sharing', async ({ page }) => {
    // Click on a map block to select it
    const mapBlock = page.locator('[data-testid^="block-"]').first()
    await mapBlock.click()
    
    // Open share panel
    await page.locator('[data-testid="share-toggle"]').click()
    
    // Check share panel is visible
    await expect(page.locator('[data-testid="share-panel"]')).toBeVisible()
    
    // Check share URL is generated
    await expect(page.locator('[data-testid="share-url"]')).toBeVisible()
    
    // Copy share URL
    await page.locator('[data-testid="copy-url"]').click()
    
    // Check copy success message
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('should handle data source switching', async ({ page }) => {
    // Find data source selector
    const dataSourceSelector = page.locator('[data-testid="data-source-selector"]')
    await expect(dataSourceSelector).toBeVisible()
    
    // Switch to mock data
    await dataSourceSelector.selectOption('mock')
    
    // Wait for data to load
    await page.waitForTimeout(500)
    
    // Check that map updated with mock data
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible()
    
    // Check mobile controls
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Open mobile menu
    await page.locator('[data-testid="mobile-menu-toggle"]').click()
    
    // Check mobile menu content
    await expect(page.locator('[data-testid="mobile-menu-content"]')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on search input
    await page.locator('[data-testid="search-toggle"]').click()
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.focus()
    
    // Use keyboard to navigate
    await page.keyboard.type('Test')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    
    // Check that selection worked
    await expect(page.locator('[data-testid="info-panel"]')).toBeVisible()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Mock a network error
    await page.route('**/api/**', route => {
      route.abort('failed')
    })
    
    // Reload page
    await page.reload()
    
    // Check error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    
    // Check fallback to mock data
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })
})