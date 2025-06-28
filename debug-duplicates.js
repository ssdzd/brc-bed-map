#!/usr/bin/env node

// Debug duplicate camps in multiple blocks
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, 'app', '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Direct Airtable API call to get raw data
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const config = {
  baseId: envVars.VITE_AIRTABLE_BASE_ID,
  tableName: envVars.VITE_AIRTABLE_TABLE_NAME || 'BED_Camp_Progress',
  pat: envVars.VITE_AIRTABLE_PAT
};

console.log('🔍 Debugging Duplicate Camps in Multiple Blocks...\n');

try {
  const url = `${AIRTABLE_BASE_URL}/${config.baseId}/${config.tableName}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.pat}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`📊 Total records: ${data.records?.length || 0}`);
  
  if (data.records && data.records.length > 0) {
    // Look for specific camps mentioned as having issues
    const problemCamps = data.records.filter(record => {
      const campName = record.fields['Camp Name'] || record.fields['Preferred Name'] || '';
      return campName.toLowerCase().includes('fruit') || 
             campName.toLowerCase().includes('veggie') ||
             campName.toLowerCase().includes('slomoth') ||
             campName.toLowerCase().includes('bed (test)');
    });
    
    console.log(`\n🚨 Found ${problemCamps.length} potentially problematic camps:`);
    
    problemCamps.forEach((record, i) => {
      const fields = record.fields;
      const campName = fields['Camp Name'] || fields['Preferred Name'] || 'Unknown';
      const addresses = [
        fields['Matched Polygon'],
        fields['Camp Address copy'],
        fields['Camp Address'],
        fields['Placement Address']
      ].filter(addr => addr);
      
      console.log(`\n  ${i + 1}. ${campName} (ID: ${record.id})`);
      console.log(`     Available address fields:`);
      if (fields['Matched Polygon']) {
        const mp = fields['Matched Polygon'];
        const value = typeof mp === 'object' ? mp.value : mp;
        console.log(`       - Matched Polygon: "${value}"`);
      }
      if (fields['Camp Address copy']) {
        console.log(`       - Camp Address copy: "${fields['Camp Address copy']}"`);
      }
      if (fields['Camp Address']) {
        console.log(`       - Camp Address: "${fields['Camp Address']}"`);
      }
      if (fields['Placement Address']) {
        console.log(`       - Placement Address: "${fields['Placement Address']}"`);
      }
    });
    
    // Check for duplicate camp names
    const campNames = data.records.map(r => {
      return (r.fields['Camp Name'] || r.fields['Preferred Name'] || '').toLowerCase().trim();
    }).filter(name => name);
    
    const duplicateNames = campNames.filter((name, index) => 
      campNames.indexOf(name) !== index
    );
    
    if (duplicateNames.length > 0) {
      console.log(`\n🔁 Found potential duplicate camp names:`);
      [...new Set(duplicateNames)].forEach(name => {
        console.log(`     - "${name}"`);
      });
    }
  }
  
} catch (error) {
  console.log('❌ Debug failed with error:');
  console.log(`   ${error.message}`);
}