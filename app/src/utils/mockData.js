// Mock data generator for B.E.D. Map testing
// Generates realistic camp data with specified distributions by street ring

// BED status distributions by street ring
const DISTRIBUTIONS = {
  Esplanade: {
    bed_talk: 0.90,        // 90% pink
    consent_policy: 0.10,   // 10% purple
    registered: 0.0,        // 0% orange
    none: 0.0               // 0% none
  },
  'A-B': {
    bed_talk: 0.75,        // 75% pink
    consent_policy: 0.20,   // 20% purple
    registered: 0.05,       // 5% orange
    none: 0.0               // 0% none
  },
  'C-D': {
    bed_talk: 0.50,        // 50% pink
    consent_policy: 0.20,   // 20% purple
    registered: 0.10,       // 10% orange
    none: 0.20              // 20% none
  },
  'E-F': {
    bed_talk: 0.40,        // 40% pink
    consent_policy: 0.20,   // 20% purple
    registered: 0.10,       // 10% orange
    none: 0.30              // 30% none
  },
  'G+': {
    bed_talk: 0.20,        // 20% pink
    consent_policy: 0.15,   // 15% purple
    registered: 0.15,       // 15% orange
    none: 0.50              // 50% none
  }
};

// Sample camp names for variety
const CAMP_NAMES = [
  'Desert Hearts', 'Mystic Garden', 'Electric Oasis', 'Cosmic Playground',
  'Midnight Mirage', 'Starlight Sanctuary', 'Neon Nomads', 'Fire Phoenix',
  'Dream Catchers', 'Solar Flare', 'Dust Devils', 'Aurora Camp',
  'Crystal Cave', 'Thunder Dome', 'Zen Garden', 'Prism Palace',
  'Velocity Village', 'Quantum Leap', 'Infinite Loop', 'Binary Sunset',
  'Fractal Forest', 'Echo Chamber', 'Spiral Dynamics', 'Flow State',
  'Metamorphosis', 'Kaleidoscope', 'Synchronized Chaos', 'Digital Detox',
  'Analog Dreams', 'Frequency Shift', 'Signal Processing', 'Data Stream',
  'Code Monkey', 'Pixel Perfect', 'Render Farm', 'Buffer Overflow',
  'Stack Trace', 'Memory Leak', 'Race Condition', 'Deadlock Prevention',
  'Cache Hit', 'Load Balancer', 'Circuit Breaker', 'Event Loop',
  'Promise Land', 'Async Await', 'Callback Hell', 'Function Factory',
  'Object Oriented', 'Class Action', 'Method Madness', 'Property Planet'
];

// Generate random time between 2:00 and 10:00
const generateRandomTime = () => {
  const hours = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const minutes = ['00', '15', '30', '45'];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${hour}:${minute}`;
};

// Generate placement address for a given street and time
const generatePlacementAddress = (street, time) => {
  return `${time} & ${street}`;
};

// Get distribution category for a street
const getDistributionCategory = (street) => {
  if (street === 'Esplanade') return 'Esplanade';
  if (['A', 'B'].includes(street)) return 'A-B';
  if (['C', 'D'].includes(street)) return 'C-D';
  if (['E', 'F'].includes(street)) return 'E-F';
  return 'G+'; // G, H, I, J, K and beyond
};

// Select BED status based on distribution
const selectBedStatus = (distribution) => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [status, probability] of Object.entries(distribution)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return status;
    }
  }
  
  return 'none'; // fallback
};

// Generate random user data
const generateUserData = (campName) => {
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${campName.toLowerCase().replace(/\s+/g, '')}.com`;
  
  return {
    user_name: `${firstName} ${lastName}`,
    email: email
  };
};

// Generate buddy name if status requires it
const generateBuddyName = (bedStatus) => {
  if (['consent_policy', 'bed_talk'].includes(bedStatus)) {
    const buddyNames = ['Sam Wilson', 'Chris Parker', 'Dana Lee', 'Jesse Chang', 'Pat Morgan'];
    return buddyNames[Math.floor(Math.random() * buddyNames.length)];
  }
  return null;
};

// Define exact block IDs for each ring (from SVG)
const BLOCK_IDS = {
  Esplanade: [
    'polygon_Esplanade_2:00', 'polygon_Esplanade_2:30', 'polygon_Esplanade_3:00', 'polygon_Esplanade_3:30',
    'polygon_Esplanade_4:00', 'polygon_Esplanade_4:30', 'polygon_Esplanade_5:00', 'polygon_Esplanade_5:30', 
    'polygon_Esplanade_6:00', 'polygon_Esplanade_6:30', 'polygon_Esplanade_7:00', 'polygon_Esplanade_7:30',
    'polygon_Esplanade_8:00', 'polygon_Esplanade_8:30', 'polygon_Esplanade_9:00', 'polygon_Esplanade_9:30'
  ],
  A: [
    'polygon_A_2:00', 'polygon_A_2:30', 'polygon_A_3:00', 'polygon_A_3:30', 'polygon_A_4:00', 'polygon_A_4:30',
    'polygon_A_5:00', 'polygon_A_5:30', 'polygon_A_6:00', 'polygon_A_6:30', 'polygon_A_7:00', 'polygon_A_7:30',
    'polygon_A_8:00', 'polygon_A_8:30', 'polygon_A_9:00', 'polygon_A_9:30'
  ],
  B: [
    'polygon_B_2:00', 'polygon_B_2:30', 'polygon_B_3:00', 'polygon_B_3:30', 'polygon_B_4:00', 'polygon_B_4:30',
    'polygon_B_5:00', 'polygon_B_5:30', 'polygon_B_6:00', 'polygon_B_6:30', 'polygon_B_7:00', 'polygon_B_7:30',
    'polygon_B_8:00', 'polygon_B_8:30', 'polygon_B_9:00', 'polygon_B_9:30'
  ],
  C: [
    'polygon_C_2:00', 'polygon_C_2:30', 'polygon_C_3:00', 'polygon_C_3:30', 'polygon_C_4:00', 'polygon_C_4:30',
    'polygon_C_5:00', 'polygon_C_5:30', 'polygon_C_6:00', 'polygon_C_6:30', 'polygon_C_7:00', 'polygon_C_7:30',
    'polygon_C_8:00', 'polygon_C_8:30', 'polygon_C_9:00', 'polygon_C_9:30'
  ],
  D: [
    'polygon_D_2:00', 'polygon_D_2:30', 'polygon_D_3:00', 'polygon_D_3:30', 'polygon_D_4:00', 'polygon_D_4:30',
    'polygon_D_5:00', 'polygon_D_5:30', 'polygon_D_6:00', 'polygon_D_6:30', 'polygon_D_7:00', 'polygon_D_7:30',
    'polygon_D_8:00', 'polygon_D_8:30', 'polygon_D_9:00', 'polygon_D_9:30'
  ],
  E: [
    'polygon_E_2:00', 'polygon_E_2:30', 'polygon_E_3:00', 'polygon_E_3:30', 'polygon_E_4:00', 'polygon_E_4:30',
    'polygon_E_5:00', 'polygon_E_5:30', 'polygon_E_6:00', 'polygon_E_6:30', 'polygon_E_7:00', 'polygon_E_7:30',
    'polygon_E_8:00', 'polygon_E_8:30', 'polygon_E_9:00', 'polygon_E_9:30'
  ],
  F: [
    'polygon_F_2:00', 'polygon_F_2:15', 'polygon_F_2:30', 'polygon_F_2:45', 'polygon_F_3:00', 'polygon_F_3:15',
    'polygon_F_3:30', 'polygon_F_3:45', 'polygon_F_4:00', 'polygon_F_4:15', 'polygon_F_4:30', 'polygon_F_4:45',
    'polygon_F_5:00', 'polygon_F_5:15', 'polygon_F_5:30', 'polygon_F_5:45', 'polygon_F_6:00', 'polygon_F_6:15',
    'polygon_F_6:30', 'polygon_F_6:45', 'polygon_F_7:00', 'polygon_F_7:15', 'polygon_F_7:30', 'polygon_F_7:45',
    'polygon_F_8:00', 'polygon_F_8:15', 'polygon_F_8:30', 'polygon_F_8:45', 'polygon_F_9:00', 'polygon_F_9:15',
    'polygon_F_9:30', 'polygon_F_9:45'
  ]
};

// Generate camps based on exact block distributions
const generateCampsForBlocks = (street, blockIds, distribution) => {
  const camps = [];
  const totalBlocks = blockIds.length;
  
  // Calculate exact number of blocks for each status based on proportions
  const statusCounts = {};
  let remaining = totalBlocks;
  
  // Process in priority order (bed_talk, consent_policy, registered, none)
  const sortedStatuses = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  
  for (let i = 0; i < sortedStatuses.length; i++) {
    const [status, proportion] = sortedStatuses[i];
    if (i === sortedStatuses.length - 1) {
      // Last status gets all remaining blocks
      statusCounts[status] = remaining;
    } else {
      statusCounts[status] = Math.round(proportion * totalBlocks);
      remaining -= statusCounts[status];
    }
  }
  
  // Create an array of statuses to assign to blocks
  const statusAssignments = [];
  Object.entries(statusCounts).forEach(([status, count]) => {
    for (let i = 0; i < count; i++) {
      statusAssignments.push(status);
    }
  });
  
  // Shuffle the status assignments for randomness
  for (let i = statusAssignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusAssignments[i], statusAssignments[j]] = [statusAssignments[j], statusAssignments[i]];
  }
  
  // Create exactly one camp per block with the assigned status
  blockIds.forEach((blockId, index) => {
    const bedStatus = statusAssignments[index] || 'none';
    
    // Extract time from block ID (e.g., "polygon_Esplanade_2:30" -> "2:30")
    const timeMatch = blockId.match(/_(\d{1,2}:\d{2})$/);
    const time = timeMatch ? timeMatch[1] : generateRandomTime();
    
    // Only create a camp if status is not 'none' (some blocks should be empty)
    if (bedStatus !== 'none') {
      const campName = CAMP_NAMES[Math.floor(Math.random() * CAMP_NAMES.length)] + ` ${street}${index + 1}`;
      const userData = generateUserData(campName);
      const placementAddress = generatePlacementAddress(street, time);
      
      const camp = {
        id: `mock_${blockId.replace('polygon_', '')}`,
        camp_name: campName,
        user_name: userData.user_name,
        email: userData.email,
        placement_address: placementAddress,
        original_address: placementAddress, // For mock data, original and processed are the same
        bed_status: bedStatus,
        buddy_name: generateBuddyName(bedStatus),
        last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Mock ${bedStatus.replace('_', ' ')} status for testing`
      };
      
      camps.push(camp);
    }
  });
  
  return { camps, statusCounts, totalBlocks };
};

// Generate complete mock dataset
export const generateMockData = () => {
  let allCamps = [];
  const ringStats = {};
  
  Object.entries(BLOCK_IDS).forEach(([street, blockIds]) => {
    const distribution = DISTRIBUTIONS[getDistributionCategory(street)];
    const result = generateCampsForBlocks(street, blockIds, distribution);
    
    allCamps = allCamps.concat(result.camps);
    ringStats[street] = {
      totalBlocks: result.totalBlocks,
      statusCounts: result.statusCounts,
      campsGenerated: result.camps.length
    };
  });
  
  // Add special landmark camps
  const landmarkCamps = [
    {
      id: 'landmark_airport',
      camp_name: 'Black Rock City Airport',
      user_name: 'BRC Operations',
      email: 'airport@blackrockcity.org',
      placement_address: '4:30 & Airport',
      original_address: '4:30 & Airport',
      bed_status: 'none',
      buddy_name: '',
      created_at: '2024-01-01T00:00:00.000Z',
      isLandmark: true,
      landmarkType: 'airport'
    },
    {
      id: 'landmark_medical_esplanade',
      camp_name: 'Emergency Medical Services - Esplanade',
      user_name: 'BRC Medical',
      email: 'medical@blackrockcity.org',
      placement_address: '5:15 & Esplanade',
      original_address: '5:15 & Esplanade',
      bed_status: 'none',
      buddy_name: 'Safety Buddy',
      created_at: '2024-01-01T00:00:00.000Z',
      isLandmark: true,
      landmarkType: 'medical'
    },
    {
      id: 'landmark_medical_3_plaza',
      camp_name: 'Emergency Medical Services - 3:00 Plaza',
      user_name: 'BRC Medical',
      email: 'medical@blackrockcity.org',
      placement_address: '3:00 & C',
      original_address: '3:00 & C',
      bed_status: 'none',
      buddy_name: 'Safety Buddy',
      created_at: '2024-01-01T00:00:00.000Z',
      isLandmark: true,
      landmarkType: 'medical'
    },
    {
      id: 'landmark_medical_9_plaza',
      camp_name: 'Emergency Medical Services - 9:00 Plaza',
      user_name: 'BRC Medical',
      email: 'medical@blackrockcity.org',
      placement_address: '9:00 & C',
      original_address: '9:00 & C',
      bed_status: 'none',
      buddy_name: 'Safety Buddy',
      created_at: '2024-01-01T00:00:00.000Z',
      isLandmark: true,
      landmarkType: 'medical'
    },
    {
      id: 'landmark_ranger_hq',
      camp_name: 'Black Rock Rangers HQ',
      user_name: 'BRC Rangers',
      email: 'rangers@blackrockcity.org',
      placement_address: '5:45 & Esplanade',
      original_address: '5:45 & Esplanade',
      bed_status: 'none',
      buddy_name: 'Ranger Buddy',
      created_at: '2024-01-01T00:00:00.000Z',
      isLandmark: true,
      landmarkType: 'ranger'
    }
  ];
  
  allCamps = allCamps.concat(landmarkCamps);
  
  // Add test camps for InfoPanel scrollbar testing at 6:00 & E
  const testCamps = [
    {
      id: 'test_scrollbar_1',
      camp_name: 'Bureau of Erotic Discourse',
      user_name: 'Sadie Lune',
      email: 'sadie@bed.org',
      placement_address: '6:00 & E',
      original_address: '6:00 & E',
      bed_status: 'bed_talk',
      buddy_name: 'Alex Johnson',
      last_updated: new Date().toISOString(),
      notes: 'Test camp 1 for scrollbar testing'
    },
    {
      id: 'test_scrollbar_2',
      camp_name: 'BED Training Academy',
      user_name: 'Jordan Smith',
      email: 'jordan@bedacademy.org',
      placement_address: '6:00 & E',
      original_address: '6:00 & E',
      bed_status: 'consent_policy',
      buddy_name: 'Sam Wilson',
      last_updated: new Date().toISOString(),
      notes: 'Test camp 2 for scrollbar testing'
    },
    {
      id: 'test_scrollbar_3',
      camp_name: 'Intimacy Workshop Collective',
      user_name: 'Casey Rodriguez',
      email: 'casey@intimacyworkshop.org',
      placement_address: '6:00 & E',
      original_address: '6:00 & E',
      bed_status: 'registered',
      buddy_name: 'Morgan Lee',
      last_updated: new Date().toISOString(),
      notes: 'Test camp 3 for scrollbar testing'
    },
    {
      id: 'test_scrollbar_4',
      camp_name: 'Consensual Adventures Camp',
      user_name: 'Riley Chen',
      email: 'riley@consensualadventures.org',
      placement_address: '6:00 & E',
      original_address: '6:00 & E',
      bed_status: 'bed_talk',
      buddy_name: 'Avery Taylor',
      last_updated: new Date().toISOString(),
      notes: 'Test camp 4 for scrollbar testing'
    },
    {
      id: 'test_scrollbar_5',
      camp_name: 'Sacred Sexuality Sanctuary',
      user_name: 'Quinn Parker',
      email: 'quinn@sacredsexuality.org',
      placement_address: '6:00 & E',
      original_address: '6:00 & E',
      bed_status: 'consent_policy',
      buddy_name: 'River Davis',
      last_updated: new Date().toISOString(),
      notes: 'Test camp 5 for scrollbar testing'
    }
  ];
  
  allCamps = allCamps.concat(testCamps);
  
  // Only log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Generated mock data with exact proportions:', {
      totalCamps: allCamps.length,
      regularCamps: allCamps.filter(c => !c.isLandmark).length,
      landmarks: allCamps.filter(c => c.isLandmark).length,
      byStatus: allCamps.reduce((acc, camp) => {
        acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
        return acc;
      }, {}),
      ringStats
    });
  }
  
  return allCamps;
};

// Get distribution summary for display
export const getDistributionSummary = () => {
  return Object.entries(DISTRIBUTIONS).map(([ring, dist]) => ({
    ring,
    distribution: dist
  }));
};

// Validate generated data matches expected distributions
export const validateDistributions = (camps) => {
  const validation = {};
  
  Object.keys(DISTRIBUTIONS).forEach(category => {
    const categoryCamps = camps.filter(camp => {
      const street = camp.placement_address.split(' ')[0];
      return getDistributionCategory(street) === category;
    });
    
    const statusCounts = categoryCamps.reduce((acc, camp) => {
      acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
      return acc;
    }, {});
    
    const total = categoryCamps.length;
    const actualDistribution = {};
    Object.keys(DISTRIBUTIONS[category]).forEach(status => {
      actualDistribution[status] = total > 0 ? (statusCounts[status] || 0) / total : 0;
    });
    
    validation[category] = {
      expected: DISTRIBUTIONS[category],
      actual: actualDistribution,
      totalCamps: total
    };
  });
  
  return validation;
};