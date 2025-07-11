import { useState, useEffect, useCallback } from 'react';
import { generateMockData, validateDistributions } from '../utils/mockData';
import { fetchCamps, testConnection, parseAddress } from '../utils/airtableClient';

// Original mock data for backward compatibility
const originalMockCamps = [
  { id: 1, camp_name: "Dusty Data", placement_address: "A & 3:00", bed_status: "registered" },
  { id: 2, camp_name: "Consent Camp", placement_address: "C & 4:30", bed_status: "consent_policy" },
  { id: 3, camp_name: "Starr's Oasis", placement_address: "E & 7:30", bed_status: "bed_talk" },
  { id: 4, camp_name: "Tech Tent", placement_address: "B & 9:00", bed_status: "registered" },
  { id: 5, camp_name: "BED Headquarters", placement_address: "D & 6:00", bed_status: "bed_talk" },
];

export const useMapData = (dataSource = 'airtable') => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mockDataStats, setMockDataStats] = useState(null);

  const fetchAirtableData = useCallback(async () => {
    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);
      
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        console.warn('Airtable connection failed, falling back to generated mock data:', connectionTest.message);
        // Use generated mock data instead of original mock data for better coverage
        const mockCamps = generateMockData();
        const validation = validateDistributions(mockCamps);
        console.log('Mock data validation (fallback):', validation);
        
        setCamps(mockCamps);
        setMockDataStats({
          totalCamps: mockCamps.length,
          byStatus: mockCamps.reduce((acc, camp) => {
            acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
            return acc;
          }, {}),
          validation
        });
        setLoading(false);
        return;
      }
      
      // Fetch real data from Airtable
      const airtableCamps = await fetchCamps();
      
      // Validate and parse addresses
      const validCamps = airtableCamps.filter(camp => {
        // Skip camps with empty or invalid addresses
        if (!camp.placement_address || camp.placement_address.trim() === '') {
          console.warn(`Empty address for camp: ${camp.camp_name}`);
          return false;
        }
        
        const parsed = parseAddress(camp.placement_address);
        if (!parsed) {
          console.warn(`Invalid address format: "${camp.placement_address}" for camp: ${camp.camp_name}`);
          return false;
        }
        return true;
      });
      
      // Check for potential duplicate camp names
      const campNameCounts = {};
      validCamps.forEach(camp => {
        const name = camp.camp_name?.toLowerCase().trim();
        if (name) {
          campNameCounts[name] = (campNameCounts[name] || 0) + 1;
        }
      });
      
      const duplicates = Object.entries(campNameCounts).filter(([, count]) => count > 1);
      if (duplicates.length > 0) {
        console.warn('Found potential duplicate camp names:', duplicates.map(([name, count]) => `"${name}" (${count}x)`));
      }
      
      console.log(`Loaded ${validCamps.length} valid camps from Airtable (${airtableCamps.length} total)`);
      setCamps(validCamps);
      setMockDataStats(null);
      setLoading(false);
      
      // Track performance
      const fetchTime = performance.now() - startTime;
      if (window.trackDataFetch) {
        window.trackDataFetch(fetchTime, 'airtable');
      }
      
    } catch (err) {
      console.error('Error fetching Airtable data:', err);
      setError(`Failed to load Airtable data: ${err.message}`);
      
      // Fall back to generated mock data on error
      console.log('Falling back to generated mock data');
      const mockCamps = generateMockData();
      const validation = validateDistributions(mockCamps);
      console.log('Mock data validation (error fallback):', validation);
      
      setCamps(mockCamps);
      setMockDataStats({
        totalCamps: mockCamps.length,
        byStatus: mockCamps.reduce((acc, camp) => {
          acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
          return acc;
        }, {}),
        validation
      });
      setLoading(false);
      
      // Track performance for fallback
      const fetchTime = performance.now() - startTime;
      if (window.trackDataFetch) {
        window.trackDataFetch(fetchTime, 'mock-fallback');
      }
    }
  }, []);

  const generateMockCamps = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate brief loading delay
      setTimeout(() => {
        const mockCamps = generateMockData();
        const validation = validateDistributions(mockCamps);
        
        console.log('Mock data validation:', validation);
        
        setCamps(mockCamps);
        setMockDataStats({
          totalCamps: mockCamps.length,
          byStatus: mockCamps.reduce((acc, camp) => {
            acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
            return acc;
          }, {}),
          validation
        });
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error generating mock data:', err);
      setError('Failed to generate mock data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dataSource === 'mock') {
      generateMockCamps();
    } else {
      fetchAirtableData();
    }
  }, [dataSource, generateMockCamps, fetchAirtableData]);

  const refresh = useCallback(() => {
    if (dataSource === 'mock') {
      generateMockCamps();
    } else {
      fetchAirtableData();
    }
  }, [dataSource, generateMockCamps, fetchAirtableData]);

  return { 
    camps, 
    loading, 
    error, 
    mockDataStats,
    refresh 
  };
};