#!/usr/bin/env node

// Test the updated transformation logic
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

// Import actual transformation functions
import { fetchCamps } from './app/src/utils/airtableClient.js';

// Test with real Airtable data
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const config = {
  baseId: envVars.VITE_AIRTABLE_BASE_ID,
  tableName: envVars.VITE_AIRTABLE_TABLE_NAME || 'BED_Camp_Progress',
  pat: envVars.VITE_AIRTABLE_PAT
};

console.log('🔄 Testing Updated Transformation Logic...\n');

try {
  // Use the actual fetchCamps function which includes all the updated transformation logic
  const camps = await fetchCamps();
  console.log(`📊 Fetched ${camps.length} transformed records`);
  
  if (camps && camps.length > 0) {
    console.log('\n🔄 Transformed records:');
    camps.slice(0, 5).forEach((camp, i) => {
      console.log(`\n  ${i + 1}. ${camp.camp_name || 'No name'}`);
      console.log(`     Address: "${camp.placement_address}" (Status: ${camp.bed_status})`);
      console.log(`     User: ${camp.user_name || 'No user'}`);
      console.log(`     Email: ${camp.email || 'No email'}`);
      if (camp.phone) console.log(`     Phone: ${camp.phone}`);
      if (camp.camper_count) console.log(`     Campers: ${camp.camper_count}`);
      console.log(`     Wants Buddy: ${camp.wants_buddy}`);
    });
  }
  
} catch (error) {
  console.log('❌ Test failed with error:');
  console.log(`   ${error.message}`);
}