#!/usr/bin/env node

/**
 * Configuration Validator
 * Validates config.json and regions.json files
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');
const regionsPath = path.join(__dirname, '..', 'regions.json');

function validateConfig() {
  console.log('Validating configuration files...\n');
  
  let errors = [];
  let warnings = [];
  
  // Validate config.json
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check required fields
      if (!config.region || !config.region.bounds) {
        errors.push('config.json: Missing region.bounds');
      }
      
      if (!config.temporal || !config.temporal.startYear || !config.temporal.endYear) {
        errors.push('config.json: Missing temporal configuration');
      }
      
      if (!config.visualization || !config.visualization.bands) {
        errors.push('config.json: Missing visualization configuration');
      }
      
      // Validate bounds
      if (config.region && config.region.bounds) {
        const bounds = config.region.bounds;
        if (bounds.west >= bounds.east) {
          errors.push('config.json: Invalid bounds (west >= east)');
        }
        if (bounds.south >= bounds.north) {
          errors.push('config.json: Invalid bounds (south >= north)');
        }
      }
      
      // Validate year ranges
      if (config.temporal) {
        if (config.temporal.startYear >= config.temporal.endYear) {
          errors.push('config.json: Invalid year range');
        }
      }
      
      console.log('✓ config.json: Valid structure');
    } catch (e) {
      errors.push(`config.json: ${e.message}`);
    }
  } else {
    warnings.push('config.json: File not found');
  }
  
  // Validate regions.json
  if (fs.existsSync(regionsPath)) {
    try {
      const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
      
      // Check each region has bounds
      for (const [key, region] of Object.entries(regions)) {
        if (!region.bounds || !Array.isArray(region.bounds) || region.bounds.length !== 4) {
          errors.push(`regions.json: Invalid bounds for region '${key}'`);
        }
      }
      
      console.log('✓ regions.json: Valid structure');
    } catch (e) {
      errors.push(`regions.json: ${e.message}`);
    }
  } else {
    warnings.push('regions.json: File not found');
  }
  
  // Report results
  console.log('\n--- Validation Results ---');
  
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ✗ ${e}`));
    process.exit(1);
  } else {
    console.log('\n✓ All configuration files are valid!');
    process.exit(0);
  }
}

validateConfig();
