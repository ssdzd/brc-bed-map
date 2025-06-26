// Helper utilities for Airtable integration and debugging

import { getConfig, testConnection, getValidAddresses, isValidAddress, parseAddress } from './airtableClient';

// Debug helper to check Airtable configuration
export const debugAirtableConfig = () => {
  console.log('=== Airtable Configuration ===');
  const config = getConfig();
  console.log('Base ID:', config.baseId);
  console.log('Table Name:', config.tableName);
  console.log('PAT Configured:', config.patConfigured);
  console.log('===============================');
  return config;
};

// Test Airtable connection and log results
export const testAirtableConnection = async () => {
  console.log('=== Testing Airtable Connection ===');
  try {
    const result = await testConnection();
    console.log('Connection Result:', result);
    if (result.success) {
      console.log('✅ Airtable connection successful!');
    } else {
      console.log('❌ Airtable connection failed:', result.message);
    }
    return result;
  } catch (error) {
    console.log('❌ Connection test error:', error.message);
    return { success: false, error };
  } finally {
    console.log('====================================');
  }
};

// Get sample of valid addresses for Airtable setup
export const getSampleAddresses = (count = 10) => {
  const addresses = getValidAddresses();
  const sample = [];
  const step = Math.floor(addresses.length / count);
  
  for (let i = 0; i < count && i * step < addresses.length; i++) {
    sample.push(addresses[i * step]);
  }
  
  return sample;
};

// Validate a list of addresses (useful for checking Airtable data)
export const validateAddressList = (addresses) => {
  const results = {
    valid: [],
    invalid: [],
    parsed: []
  };
  
  addresses.forEach(address => {
    if (isValidAddress(address)) {
      results.valid.push(address);
      const parsed = parseAddress(address);
      if (parsed) {
        results.parsed.push({
          address,
          street: parsed.street,
          time: parsed.time,
          blockId: parsed.blockId
        });
      }
    } else {
      results.invalid.push(address);
    }
  });
  
  return results;
};

// Helper to format addresses consistently
export const formatAddress = (street, time) => {
  if (!street || !time) return null;
  return `${street} & ${time}`;
};

// Export for easy console testing
export const airtableDevTools = {
  debugConfig: debugAirtableConfig,
  testConnection: testAirtableConnection,
  sampleAddresses: getSampleAddresses,
  validateAddresses: validateAddressList,
  formatAddress
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.airtableDevTools = airtableDevTools;
}