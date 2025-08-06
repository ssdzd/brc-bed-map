#!/usr/bin/env node

/**
 * Fetch Airtable data at build time
 * This script runs during the build process to fetch camp data
 * and save it as a static JSON file, avoiding client-side API calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const AIRTABLE_PAT = process.env.VITE_AIRTABLE_PAT || process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.VITE_AIRTABLE_TABLE_NAME || process.env.AIRTABLE_TABLE_NAME || 'BED_Camp_Progress';

// Log configuration status
console.log('🔧 Airtable Configuration:');
console.log(`   Base ID: ${AIRTABLE_BASE_ID ? '✓ Set' : '✗ Missing'}`);
console.log(`   PAT: ${AIRTABLE_PAT ? '✓ Set' : '✗ Missing'}`);
console.log(`   Table: ${AIRTABLE_TABLE_NAME}`);

// Validate configuration
if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.warn('⚠️  Missing Airtable configuration. Using mock data fallback.');
  console.warn('Set AIRTABLE_PAT and AIRTABLE_BASE_ID environment variables for production data.');
  process.exit(0); // Exit gracefully to allow build to continue with mock data
}

// Map Airtable status values to BED status
const mapStatusToBedStatus = (airtableStatus) => {
  if (!airtableStatus) return 'none';
  
  const status = airtableStatus.toLowerCase();
  switch (status) {
    case 'orange':
      return 'registered';
    case 'purple':
      return 'consent_policy';
    case 'pink':
    case 'hot pink':
      return 'bed_talk';
    case 'gray':
    case 'grey':
    default:
      return 'none';
  }
};

// Transform Airtable record to match our data structure
const transformRecord = (record) => {
  const fields = record.fields;
  
  // Get the raw address from various possible fields
  let rawAddress = fields['Matched Polygon'] || 
                   fields['Camp Address copy'] || 
                   fields['Camp Address'] || 
                   fields['Placement Address'] || 
                   fields.placement_address || 
                   fields.address || '';
  
  // Handle case where address is an object (from Airtable formula/lookup fields)
  if (typeof rawAddress === 'object' && rawAddress !== null) {
    // Extract the value from the object
    if (rawAddress.value !== undefined) {
      rawAddress = rawAddress.value || '';
    } else if (rawAddress.stringValue !== undefined) {
      rawAddress = rawAddress.stringValue || '';
    } else {
      // If we can't find a value, convert to string
      rawAddress = '';
    }
  }
  
  // Ensure it's a string
  rawAddress = String(rawAddress || '').trim();
  
  return {
    id: record.id,
    camp_name: fields['Camp Name'] || fields.camp_name || fields['Preferred Name'] || '',
    placement_address: rawAddress,
    bed_status: mapStatusToBedStatus(fields['Status'] || fields.bed_status || fields['BED Status']),
    last_updated: fields.last_updated || fields['Last Updated'] || record.modifiedTime,
  };
};

// Fetch data from Airtable
async function fetchAirtableData() {
  // URL encode the table name in case it contains special characters
  const encodedTableName = encodeURIComponent(AIRTABLE_TABLE_NAME);
  const url = `${AIRTABLE_BASE_URL}/${AIRTABLE_BASE_ID}/${encodedTableName}`;
  
  console.log('🌐 Fetching from Airtable...');
  console.log(`   URL: ${url}`);
  
  try {
    let allRecords = [];
    let offset = null;
    let pageCount = 0;
    
    // Handle pagination
    do {
      pageCount++;
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      
      console.log(`📄 Fetching page ${pageCount}...`);
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ API Response: ${response.status} ${response.statusText}`);
        console.error(`❌ Error body: ${errorBody}`);
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
      
    } while (offset);
    
    // Transform records
    const transformedData = allRecords.map(transformRecord);
    
    // Save to public directory so it's served as static file
    const outputPath = path.join(__dirname, '../public/airtable-camps.json');
    const outputDir = path.dirname(outputPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
    
    console.log(`✅ Fetched ${transformedData.length} camps from Airtable`);
    console.log(`📁 Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error fetching Airtable data:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchAirtableData();