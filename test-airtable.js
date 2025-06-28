#!/usr/bin/env node

// Simple Airtable connection test script
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

// Direct Airtable API test
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const config = {
  baseId: envVars.VITE_AIRTABLE_BASE_ID,
  tableName: envVars.VITE_AIRTABLE_TABLE_NAME || 'BED_Camp_Progress',
  pat: envVars.VITE_AIRTABLE_PAT
};

console.log('🔍 Testing Airtable Connection...\n');

// Check configuration
console.log('📋 Configuration:');
console.log(`  Base ID: ${config.baseId ? `${config.baseId.slice(0, 8)}...` : 'NOT_SET'}`);
console.log(`  Table Name: ${config.tableName}`);
console.log(`  PAT Configured: ${!!config.pat}\n`);

// Validate configuration
const validateConfig = () => {
  const missing = [];
  if (!config.baseId) missing.push('VITE_AIRTABLE_BASE_ID');
  if (!config.pat) missing.push('VITE_AIRTABLE_PAT');
  
  if (missing.length > 0) {
    throw new Error(`Missing Airtable configuration: ${missing.join(', ')}`);
  }
};

// Test connection
console.log('🔌 Testing connection...');
try {
  validateConfig();
  
  const url = `${AIRTABLE_BASE_URL}/${config.baseId}/${config.tableName}?maxRecords=3`;
  console.log(`📡 Making request to: ${url.replace(config.pat, 'PAT_HIDDEN')}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.pat}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log(`📊 Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log(`❌ Error response: ${errorText}`);
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Connection successful!');
  console.log(`📋 Records found: ${data.records?.length || 0}`);
  
  if (data.records && data.records.length > 0) {
    console.log('\n📋 Sample records:');
    data.records.forEach((record, i) => {
      const fields = record.fields;
      console.log(`  ${i + 1}. ID: ${record.id}`);
      console.log(`     Fields: ${Object.keys(fields).join(', ')}`);
      console.log(`     Sample data: ${JSON.stringify(fields, null, 6)}`);
      console.log('');
    });
  }
  
} catch (error) {
  console.log('❌ Test failed with error:');
  console.log(`   ${error.message}`);
  
  if (error.cause) {
    console.log(`   Cause: ${error.cause.message}`);
  }
}