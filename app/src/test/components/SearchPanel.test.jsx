import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchPanel } from '../../components/SearchPanel'

describe('SearchPanel', () => {
  const mockCamps = [
    { id: 1, camp_name: 'Test Camp Alpha', placement_address: 'A & 3:00', bed_status: 'registered' },
    { id: 2, camp_name: 'Beta Camp', placement_address: 'B & 4:30', bed_status: 'bed_talk' },
    { id: 3, camp_name: 'Gamma Center', placement_address: 'C & 6:00', bed_status: 'consent_policy' }
  ]

  const defaultProps = {
    camps: mockCamps,
    onCampSelect: vi.fn(),
    selectedCamp: null,
    theme: '2024'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input', () => {
    render(<SearchPanel {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/search camps/i)).toBeInTheDocument()
  })

  it('should filter camps based on search input', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search camps/i)
    await user.type(searchInput, 'Alpha')
    
    await waitFor(() => {
      expect(screen.getByText('Test Camp Alpha')).toBeInTheDocument()
      expect(screen.queryByText('Beta Camp')).not.toBeInTheDocument()
      expect(screen.queryByText('Gamma Center')).not.toBeInTheDocument()
    })
  })

  it('should handle case-insensitive search', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search camps/i)
    await user.type(searchInput, 'BETA')
    
    await waitFor(() => {
      expect(screen.getByText('Beta Camp')).toBeInTheDocument()
      expect(screen.queryByText('Test Camp Alpha')).not.toBeInTheDocument()
    })
  })

  it('should call onCampSelect when camp is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const campButton = screen.getByText('Test Camp Alpha')
    await user.click(campButton)
    
    expect(defaultProps.onCampSelect).toHaveBeenCalledWith(mockCamps[0])
  })

  it('should show selected camp with different styling', () => {
    render(<SearchPanel {...defaultProps} selectedCamp={mockCamps[0]} />)
    
    const selectedCampElement = screen.getByText('Test Camp Alpha').closest('button')
    expect(selectedCampElement).toHaveClass('selected')
  })

  it('should display camp addresses', () => {
    render(<SearchPanel {...defaultProps} />)
    
    expect(screen.getByText('A & 3:00')).toBeInTheDocument()
    expect(screen.getByText('B & 4:30')).toBeInTheDocument()
    expect(screen.getByText('C & 6:00')).toBeInTheDocument()
  })

  it('should display BED status indicators', () => {
    render(<SearchPanel {...defaultProps} />)
    
    // Check for status indicators (assuming they render as colored dots or badges)
    const statusIndicators = screen.getAllByRole('generic').filter(
      element => element.classList.contains('status-indicator')
    )
    
    expect(statusIndicators.length).toBeGreaterThan(0)
  })

  it('should show no results message when search yields no matches', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search camps/i)
    await user.type(searchInput, 'NonexistentCamp')
    
    await waitFor(() => {
      expect(screen.getByText(/no camps found/i)).toBeInTheDocument()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search camps/i)
    await user.type(searchInput, 'Alpha')
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)
    
    expect(searchInput.value).toBe('')
    expect(screen.getByText('Beta Camp')).toBeInTheDocument()
  })

  it('should handle empty camps array', () => {
    render(<SearchPanel {...defaultProps} camps={[]} />)
    
    expect(screen.getByText(/no camps available/i)).toBeInTheDocument()
  })

  it('should filter by BED status', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const statusFilter = screen.getByLabelText(/filter by status/i)
    await user.selectOptions(statusFilter, 'bed_talk')
    
    await waitFor(() => {
      expect(screen.getByText('Beta Camp')).toBeInTheDocument()
      expect(screen.queryByText('Test Camp Alpha')).not.toBeInTheDocument()
    })
  })

  it('should reset filters when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchPanel {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search camps/i)
    await user.type(searchInput, 'Alpha')
    
    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)
    
    expect(searchInput.value).toBe('')
    expect(screen.getByText('Beta Camp')).toBeInTheDocument()
    expect(screen.getByText('Test Camp Alpha')).toBeInTheDocument()
  })
})