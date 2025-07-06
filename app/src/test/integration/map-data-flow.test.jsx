import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMapData } from '../../hooks/useMapData'
import { getBlockColor, campInBlock } from '../../utils/blockUtils'

// Mock the App component to test data flow
const TestMapApp = ({ dataSource = 'mock' }) => {
  const { camps, loading, error, refresh } = useMapData(dataSource)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <div data-testid="camp-count">{camps.length}</div>
      <button onClick={refresh}>Refresh</button>
      <div data-testid="camp-list">
        {camps.map(camp => (
          <div key={camp.id} data-testid={`camp-${camp.id}`}>
            <span>{camp.camp_name}</span>
            <span>{camp.placement_address}</span>
            <span>{camp.bed_status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mock the utility modules
vi.mock('../../utils/mockData', () => ({
  generateMockData: vi.fn(() => [
    { id: 1, camp_name: 'Integration Camp 1', placement_address: 'A & 3:00', bed_status: 'registered' },
    { id: 2, camp_name: 'Integration Camp 2', placement_address: 'B & 4:30', bed_status: 'bed_talk' },
    { id: 3, camp_name: 'Integration Camp 3', placement_address: 'C & 6:00', bed_status: 'consent_policy' }
  ]),
  validateDistributions: vi.fn(() => ({ valid: true, issues: [] }))
}))

vi.mock('../../utils/airtableClient', () => ({
  fetchCamps: vi.fn(),
  testConnection: vi.fn(),
  parseAddress: vi.fn()
}))

describe('Map Data Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should integrate hook data with map rendering', async () => {
    vi.useFakeTimers()
    
    render(<TestMapApp dataSource="mock" />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByTestId('camp-count')).toHaveTextContent('3')
    })
    
    expect(screen.getByText('Integration Camp 1')).toBeInTheDocument()
    expect(screen.getByText('Integration Camp 2')).toBeInTheDocument()
    expect(screen.getByText('Integration Camp 3')).toBeInTheDocument()
    
    vi.useRealTimers()
  })

  it('should handle data refresh in integrated components', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    
    render(<TestMapApp dataSource="mock" />)
    
    // Wait for initial load
    vi.advanceTimersByTime(300)
    await waitFor(() => {
      expect(screen.getByTestId('camp-count')).toHaveTextContent('3')
    })
    
    // Refresh data
    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    vi.advanceTimersByTime(300)
    await waitFor(() => {
      expect(screen.getByTestId('camp-count')).toHaveTextContent('3')
    })
    
    vi.useRealTimers()
  })

  it('should integrate block coloring with camp data', () => {
    const mockCamps = [
      { id: 1, camp_name: 'Test Camp', placement_address: 'A & 3:00', bed_status: 'bed_talk' },
      { id: 2, camp_name: 'Another Camp', placement_address: 'B & 4:30', bed_status: 'registered' }
    ]
    
    // Test that camps are correctly matched to blocks
    expect(campInBlock('A & 3:00', 'polygon_A_3:00')).toBe(true)
    expect(campInBlock('B & 4:30', 'polygon_B_4:30')).toBe(true)
    expect(campInBlock('A & 3:00', 'polygon_B_4:30')).toBe(false)
    
    // Test that block colors reflect highest status
    const blockAColor = getBlockColor('polygon_A_3:00', mockCamps, '2024')
    const blockBColor = getBlockColor('polygon_B_4:30', mockCamps, '2024')
    const emptyBlockColor = getBlockColor('polygon_Z_12:00', mockCamps, '2024')
    
    expect(blockAColor).toBe('#FF1493') // bed_talk color
    expect(blockBColor).toBe('#FE8803') // registered color
    expect(emptyBlockColor).toBe('#F8F9FA') // none color
  })

  it('should handle error states in data flow', async () => {
    const { generateMockData } = await import('../../utils/mockData')
    generateMockData.mockImplementation(() => {
      throw new Error('Data generation failed')
    })
    
    vi.useFakeTimers()
    
    render(<TestMapApp dataSource="mock" />)
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })

  it('should integrate airtable fallback with mock data', async () => {
    const { testConnection, generateMockData } = await import('../../utils/airtableClient')
    
    testConnection.mockResolvedValue({ success: false, message: 'Connection failed' })
    
    render(<TestMapApp dataSource="airtable" />)
    
    await waitFor(() => {
      expect(screen.getByTestId('camp-count')).toHaveTextContent('3')
    })
    
    // Should show mock data when airtable fails
    expect(screen.getByText('Integration Camp 1')).toBeInTheDocument()
  })

  it('should maintain data consistency across components', async () => {
    vi.useFakeTimers()
    
    const { result: hookResult } = renderHook(() => useMapData('mock'))
    
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(hookResult.current.loading).toBe(false)
    })
    
    const camps = hookResult.current.camps
    
    // Test that the same camp data produces consistent results
    camps.forEach(camp => {
      const blockId = `polygon_${camp.placement_address.replace(' & ', '_').replace(':', '')}`
      expect(campInBlock(camp.placement_address, blockId)).toBe(true)
    })
    
    vi.useRealTimers()
  })
})