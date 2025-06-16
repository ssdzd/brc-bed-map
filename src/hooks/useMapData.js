import { useState, useEffect } from 'react';

// Mock data for Week 1 testing
const mockCamps = [
  { id: 1, camp_name: "Dusty Data", placement_address: "A & 3:00", bed_status: "video_complete" },
  { id: 2, camp_name: "Consent Camp", placement_address: "C & 4:30", bed_status: "buddy_assigned" },
  { id: 3, camp_name: "Starr's Oasis", placement_address: "E & 7:30", bed_status: "fully_implemented" },
  { id: 4, camp_name: "Tech Tent", placement_address: "B & 9:00", bed_status: "video_complete" },
  { id: 5, camp_name: "BED Headquarters", placement_address: "D & 6:00", bed_status: "fully_implemented" },
];

export const useMapData = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCamps(mockCamps);
      setLoading(false);
    }, 500);
  }, []);

  // Week 2: Replace with Airtable fetch
  // const fetchFromAirtable = async () => {
  //   const response = await fetch(AIRTABLE_URL, {
  //     headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
  //   });
  //   const data = await response.json();
  //   setCamps(data.records);
  // };

  return { camps, loading };
}; 