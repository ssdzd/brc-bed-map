import { describe, it, expect } from 'vitest'
import {
  parseBlockId,
  blockIdToDisplayAddress,
  campInBlock,
  getBlockColor,
  getThemeColors,
  BED_COLORS_2024,
  BED_COLORS_2025,
  THEMES
} from '../../utils/blockUtils'

describe('blockUtils', () => {
  describe('parseBlockId', () => {
    it('should parse new polygon format block IDs', () => {
      const result = parseBlockId('polygon_A_2:00')
      expect(result).toEqual({
        street: 'A',
        timeString: '2:00',
        approximateTime: '2:00'
      })
    })

    it('should parse old segment format block IDs', () => {
      const result = parseBlockId('A_8')
      expect(result).toEqual({
        street: 'A',
        segment: 8,
        approximateTime: expect.stringMatching(/\d{1,2}:\d{2}/)
      })
    })

    it('should handle invalid block IDs gracefully', () => {
      const result = parseBlockId('invalid')
      expect(result).toEqual({
        street: 'invalid',
        segment: NaN,
        approximateTime: expect.any(String)
      })
    })
  })

  describe('blockIdToDisplayAddress', () => {
    it('should convert BRC Airport block ID', () => {
      const result = blockIdToDisplayAddress('nimue-artist-credit')
      expect(result).toBe('BRC Airport')
    })

    it('should convert plaza quarter block IDs with geographic naming', () => {
      const result = blockIdToDisplayAddress('plaza_Center_Camp_Quarter_A')
      expect(result).toBe('5:59 & A+')
    })

    it('should convert regular street block IDs', () => {
      const result = blockIdToDisplayAddress('polygon_A_2:00')
      expect(result).toBe('2:00 & A')
    })

    it('should handle center camp fallback', () => {
      const result = blockIdToDisplayAddress('plaza_Center_Camp')
      expect(result).toBe('Center Camp')
    })

    it('should handle regular plaza fallback', () => {
      const result = blockIdToDisplayAddress('plaza_3:00_B')
      expect(result).toBe('3:00 B Plaza')
    })
  })

  describe('campInBlock', () => {
    it('should match BRC Airport addresses', () => {
      expect(campInBlock('BRC Airport', 'nimue-artist-credit')).toBe(true)
      expect(campInBlock('BRC AIRPORT', 'nimue-artist-credit')).toBe(true)
      expect(campInBlock('Regular Camp', 'nimue-artist-credit')).toBe(false)
    })

    it('should match geographic plaza quarter addresses', () => {
      expect(campInBlock('5:59 & A+', 'plaza_Center_Camp_Quarter_A')).toBe(true)
      expect(campInBlock('7:29 & G-', 'plaza_7:30_G_Quarter_B')).toBe(true)
      expect(campInBlock('5:59 & A+', 'plaza_Center_Camp_Quarter_B')).toBe(false)
    })

    it('should match Center Camp addresses', () => {
      expect(campInBlock('Center Camp', 'plaza_Center_Camp')).toBe(true)
      expect(campInBlock('Center Camp Quarter A', 'plaza_Center_Camp_Quarter_A')).toBe(true)
      expect(campInBlock('Center Camp Quarter B', 'plaza_Center_Camp_Quarter_A')).toBe(false)
    })

    it('should match regular street addresses', () => {
      expect(campInBlock('3:45 & C', 'polygon_C_3:45')).toBe(true)
      expect(campInBlock('C & 3:45', 'polygon_C_3:45')).toBe(true)
      expect(campInBlock('3:45 & D', 'polygon_C_3:45')).toBe(false)
    })

    it('should handle invalid addresses gracefully', () => {
      expect(campInBlock('Invalid Address', 'polygon_A_2:00')).toBe(false)
      expect(campInBlock('', 'polygon_A_2:00')).toBe(false)
      expect(campInBlock(null, 'polygon_A_2:00')).toBe(false)
    })
  })

  describe('getBlockColor', () => {
    const mockCamps = [
      { placement_address: '3:45 & C', bed_status: 'registered' },
      { placement_address: '3:45 & D', bed_status: 'bed_talk' },
      { placement_address: '2:00 & A', bed_status: 'consent_policy' }
    ]

    it('should return highest priority status color', () => {
      const campsInSameBlock = [
        { placement_address: '3:45 & C', bed_status: 'registered' },
        { placement_address: '3:45 & C', bed_status: 'bed_talk' }
      ]
      
      const color = getBlockColor('polygon_C_3:45', campsInSameBlock, '2024')
      expect(color).toBe(BED_COLORS_2024.bed_talk)
    })

    it('should return none color for empty blocks', () => {
      const color = getBlockColor('polygon_Z_12:00', mockCamps, '2024')
      expect(color).toBe(BED_COLORS_2024.none)
    })

    it('should handle plaza blocks with no camps', () => {
      const color = getBlockColor('plaza_3:00_B_Plaza', [], '2024')
      expect(color).toBe('#b5bfd8') // Plaza gradient color
    })

    it('should use different theme colors', () => {
      const color2024 = getBlockColor('polygon_C_3:45', mockCamps, '2024')
      const color2025 = getBlockColor('polygon_C_3:45', mockCamps, '2025')
      
      expect(color2024).toBe(BED_COLORS_2024.registered)
      expect(color2025).toBe(BED_COLORS_2025.registered)
    })
  })

  describe('getThemeColors', () => {
    it('should return 2024 theme colors', () => {
      const colors = getThemeColors('2024')
      expect(colors).toEqual(BED_COLORS_2024)
    })

    it('should return 2025 theme colors', () => {
      const colors = getThemeColors('2025')
      expect(colors).toEqual(BED_COLORS_2025)
    })

    it('should default to 2024 theme', () => {
      const colors = getThemeColors()
      expect(colors).toEqual(BED_COLORS_2024)
    })
  })

  describe('theme constants', () => {
    it('should have consistent color structure', () => {
      const requiredStatusKeys = ['none', 'registered', 'consent_policy', 'bed_talk']
      
      requiredStatusKeys.forEach(key => {
        expect(BED_COLORS_2024).toHaveProperty(key)
        expect(BED_COLORS_2025).toHaveProperty(key)
        expect(typeof BED_COLORS_2024[key]).toBe('string')
        expect(typeof BED_COLORS_2025[key]).toBe('string')
      })
    })

    it('should have valid theme configuration', () => {
      expect(THEMES['2024']).toBeDefined()
      expect(THEMES['2024'].colors).toEqual(BED_COLORS_2024)
      expect(THEMES['2024'].name).toBe('2024 Vibrant')
      expect(typeof THEMES['2024'].background).toBe('string')
    })
  })
})