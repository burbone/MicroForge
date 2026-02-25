// Helper to collect all columns for a feature including increment children
import { FEATURE_REQUIREMENTS } from '../featureRequirements.js';

/**
 * Get all columns for a feature including increments from selected children
 * @param {string} featureId - Feature ID
 * @param {Array} selectedFeatures - List of selected features
 * @returns {Object} - { tables: { tableName: { required: [], optional: [] } } }
 */
export function getFeatureColumnsWithIncrements(featureId, selectedFeatures) {
  const featureReq = FEATURE_REQUIREMENTS[featureId];
  
  if (!featureReq || !featureReq.database) {
    return { tables: {} };
  }
  
  const result = { tables: {} };
  
  // Start with base feature columns
  const baseColumns = featureReq.database.columns || {};
  
  for (const [tableName, cols] of Object.entries(baseColumns)) {
    result.tables[tableName] = {
      required: [...(cols.required || [])],
      optional: [...(cols.optional || [])]
    };
  }
  
  // Add increment columns from selected children
  if (featureReq.type === 'parent' && featureReq.children) {
    featureReq.children.forEach(childId => {
      // Check if this child is selected
      if (!selectedFeatures.includes(childId)) {
        return;
      }
      
      const childReq = FEATURE_REQUIREMENTS[childId];
      
      // Only process increment children
      if (childReq?.childType !== 'increment') {
        return;
      }
      
      // Add increment columns
      const incrementCols = childReq.database?.increment || {};
      
      for (const [tableName, columns] of Object.entries(incrementCols)) {
        // Ensure table exists in result
        if (!result.tables[tableName]) {
          result.tables[tableName] = { required: [], optional: [] };
        }
        
        // Add increment columns as required
        columns.forEach(col => {
          if (!result.tables[tableName].required.includes(col)) {
            result.tables[tableName].required.push(col);
          }
        });
      }
    });
  }
  
  return result;
}