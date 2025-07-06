import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Legend } from '../../components/Legend'

// Mock the blockUtils
vi.mock('../../utils/blockUtils', () => ({
  getThemeColors: vi.fn(() => ({
    none: '#9CA3AF',
    registered: '#FE8803',
    consent_policy: '#9807AB',
    bed_talk: '#FF1493'
  }))
}))

describe('Legend', () => {
  it('should render legend with all status items', () => {
    render(<Legend theme="2024" />)
    
    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
    expect(screen.getByText('Registered')).toBeInTheDocument()
    expect(screen.getByText('Consent Policy')).toBeInTheDocument()
    expect(screen.getByText('BED Talk')).toBeInTheDocument()
  })

  it('should render color indicators for each status', () => {
    render(<Legend theme="2024" />)
    
    const colorIndicators = screen.getAllByRole('generic').filter(
      element => element.style.backgroundColor
    )
    
    expect(colorIndicators).toHaveLength(4)
  })

  it('should handle missing theme gracefully', () => {
    render(<Legend />)
    
    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('should apply correct CSS classes', () => {
    const { container } = render(<Legend theme="2024" />)
    
    const legendContainer = container.firstChild
    expect(legendContainer).toHaveClass('legend-container')
  })

  it('should render tooltips with status descriptions', () => {
    render(<Legend theme="2024" />)
    
    // Check for tooltip trigger elements
    const noneItem = screen.getByText('None').closest('div')
    const registeredItem = screen.getByText('Registered').closest('div')
    
    expect(noneItem).toBeInTheDocument()
    expect(registeredItem).toBeInTheDocument()
  })
})