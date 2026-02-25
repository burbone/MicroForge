// Column Mapping Validator

import { FEATURE_REQUIREMENTS } from '../featureRequirements.js';

/**
 * Validate feature column mappings
 * @param {Object} state - Zustand store state
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export function validateColumnMappings(state) {
  const errors = {};
  const featureColumnMappings = state.diagram.featureColumnMappings || {};
  const selectedFeatures = state.selectedFeatures || [];
  
  selectedFeatures.forEach(featureId => {
    const requirements = FEATURE_REQUIREMENTS[featureId];
    
    // Skip if no requirements or not expandable
    if (!requirements || !requirements.expandable) {
      return;
    }
    
    // Skip if no database requirements
    if (!requirements.database) {
      return;
    }
    
    const mapping = featureColumnMappings[featureId] || {};
    const selectedColumns = Object.values(mapping).flat();
    
    // Check for duplicates within this feature
    const seen = new Set();
    for (const [tableName, columns] of Object.entries(mapping)) {
      for (const col of columns) {
        const fullName = `${tableName}.${col}`;
        if (seen.has(fullName)) {
          if (!errors[featureId]) errors[featureId] = [];
          errors[featureId].push(`Duplicate column: ${fullName}`);
        }
        seen.add(fullName);
      }
    }
    
    // Check required columns count (if specified)
    const requiredTables = requirements.database.tables || [];
    requiredTables.forEach(tableName => {
      const tableReqs = requirements.database.columns?.[tableName];
      if (!tableReqs) return;
      
      const selectedCols = mapping[tableName] || [];
      const requiredCols = tableReqs.required || [];
      const optionalCols = tableReqs.optional || [];
      
      // Check if all required columns are selected
      requiredCols.forEach(colName => {
        if (!selectedCols.includes(colName)) {
          if (!errors[featureId]) errors[featureId] = [];
          errors[featureId].push(`Missing required column: ${tableName}.${colName}`);
        }
      });
      
      // Check for columns that are not in required or optional
      selectedCols.forEach(colName => {
        if (!requiredCols.includes(colName) && !optionalCols.includes(colName)) {
          if (!errors[featureId]) errors[featureId] = [];
          errors[featureId].push(`Unknown column selected: ${tableName}.${colName}`);
        }
      });
    });
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format column mapping errors for display
 */
export function formatColumnMappingErrors(errors) {
  const messages = [];
  
  Object.entries(errors).forEach(([featureId, featureErrors]) => {
    messages.push(`Feature '${featureId}':`);
    featureErrors.forEach(err => {
      messages.push(`  • ${err}`);
    });
  });
  
  return messages;
}