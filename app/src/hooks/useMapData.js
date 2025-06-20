import { useState, useEffect, useCallback } from 'react';
import { generateMockData, validateDistributions } from '../utils/mockData';

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
    try {
      setLoading(true);
      setError(null);
      
      // For now, fall back to original mock data since Airtable isn't configured
      // TODO: Implement actual Airtable fetch
      // const response = await fetch(AIRTABLE_URL, {
      //   headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
      // });
      // const data = await response.json();
      // setCamps(data.records);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCamps(originalMockCamps);
      setMockDataStats(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Airtable data:', err);
      setError('Failed to load Airtable data');
      setLoading(false);
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