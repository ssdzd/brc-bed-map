import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMapData } from '../../hooks/useMapData'

// Mock the utility modules
vi.mock('../../utils/mockData', () => ({
  generateMockData: vi.fn(() => [
    { id: 1, camp_name: 'Test Camp 1', placement_address: 'A & 3:00', bed_status: 'registered' },
    { id: 2, camp_name: 'Test Camp 2', placement_address: 'B & 4:30', bed_status: 'bed_talk' }
  ]),
  validateDistributions: vi.fn(() => ({ valid: true, issues: [] }))
}))

vi.mock('../../utils/airtableClient', () => ({
  fetchCamps: vi.fn(),
  testConnection: vi.fn(),
  parseAddress: vi.fn()
}))

describe('useMapData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('mock data source', () => {
    it('should load mock data successfully', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useMapData('mock'))
      
      // Initially loading
      expect(result.current.loading).toBe(true)
      expect(result.current.camps).toEqual([])
      expect(result.current.error).toBe(null)
      
      // Fast-forward timer
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(2)
      expect(result.current.camps[0].camp_name).toBe('Test Camp 1')
      expect(result.current.mockDataStats).toBeDefined()
      expect(result.current.mockDataStats.totalCamps).toBe(2)
      
      vi.useRealTimers()
    })

    it('should handle mock data generation errors', async () => {
      vi.useFakeTimers()
      
      const { generateMockData } = await import('../../utils/mockData')
      generateMockData.mockImplementation(() => {
        throw new Error('Mock generation failed')
      })
      
      const { result } = renderHook(() => useMapData('mock'))
      
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.error).toBe('Failed to generate mock data')
      expect(result.current.camps).toEqual([])
      
      vi.useRealTimers()
    })
  })

  describe('airtable data source', () => {
    it('should load airtable data successfully', async () => {
      const { fetchCamps, testConnection, parseAddress } = await import('../../utils/airtableClient')
      
      testConnection.mockResolvedValue({ success: true })
      fetchCamps.mockResolvedValue([
        { id: 1, camp_name: 'Real Camp 1', placement_address: 'C & 5:00', bed_status: 'consent_policy' },
        { id: 2, camp_name: 'Real Camp 2', placement_address: 'D & 6:30', bed_status: 'bed_talk' }
      ])
      parseAddress.mockReturnValue({ street: 'C', hour: 5, minute: 0 })
      
      const { result } = renderHook(() => useMapData('airtable'))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(2)
      expect(result.current.camps[0].camp_name).toBe('Real Camp 1')
      expect(result.current.error).toBe(null)
      expect(result.current.mockDataStats).toBe(null)
    })

    it('should fall back to mock data when airtable connection fails', async () => {
      const { fetchCamps, testConnection } = await import('../../utils/airtableClient')
      
      testConnection.mockResolvedValue({ success: false, message: 'Connection failed' })
      
      const { result } = renderHook(() => useMapData('airtable'))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(2)
      expect(result.current.camps[0].camp_name).toBe('Test Camp 1')
      expect(result.current.mockDataStats).toBeDefined()
      expect(fetchCamps).not.toHaveBeenCalled()
    })

    it('should filter out camps with invalid addresses', async () => {
      const { fetchCamps, testConnection, parseAddress } = await import('../../utils/airtableClient')
      
      testConnection.mockResolvedValue({ success: true })
      fetchCamps.mockResolvedValue([
        { id: 1, camp_name: 'Valid Camp', placement_address: 'C & 5:00', bed_status: 'registered' },
        { id: 2, camp_name: 'Invalid Camp', placement_address: '', bed_status: 'registered' },
        { id: 3, camp_name: 'Unparseable Camp', placement_address: 'Invalid Format', bed_status: 'registered' }
      ])
      parseAddress.mockImplementation((address) => {
        if (address === 'C & 5:00') return { street: 'C', hour: 5, minute: 0 }
        return null
      })
      
      const { result } = renderHook(() => useMapData('airtable'))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(1)
      expect(result.current.camps[0].camp_name).toBe('Valid Camp')
    })

    it('should handle airtable fetch errors', async () => {
      const { fetchCamps, testConnection } = await import('../../utils/airtableClient')
      
      testConnection.mockResolvedValue({ success: true })
      fetchCamps.mockRejectedValue(new Error('API Error'))
      
      const { result } = renderHook(() => useMapData('airtable'))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.error).toContain('Failed to load Airtable data')
      expect(result.current.camps).toHaveLength(2) // Falls back to mock data
      expect(result.current.mockDataStats).toBeDefined()
    })
  })

  describe('refresh functionality', () => {
    it('should refresh mock data', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useMapData('mock'))
      
      // Wait for initial load
      vi.advanceTimersByTime(300)
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      // Refresh
      result.current.refresh()
      expect(result.current.loading).toBe(true)
      
      vi.advanceTimersByTime(300)
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(2)
      
      vi.useRealTimers()
    })

    it('should refresh airtable data', async () => {
      const { fetchCamps, testConnection, parseAddress } = await import('../../utils/airtableClient')
      
      testConnection.mockResolvedValue({ success: true })
      fetchCamps.mockResolvedValue([
        { id: 1, camp_name: 'Refreshed Camp', placement_address: 'E & 7:00', bed_status: 'bed_talk' }
      ])
      parseAddress.mockReturnValue({ street: 'E', hour: 7, minute: 0 })
      
      const { result } = renderHook(() => useMapData('airtable'))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      // Refresh
      result.current.refresh()
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.camps).toHaveLength(1)
      expect(result.current.camps[0].camp_name).toBe('Refreshed Camp')
    })
  })
})