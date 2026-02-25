import { h } from 'preact';
import { useStore } from '../store/store.js';
import { FEATURE_REQUIREMENTS } from '../featureRequirements.js';

export default function FeatureColumnSelector({ featureId, parentFeatureId = null }) {
  const requirements = FEATURE_REQUIREMENTS[featureId];
  
  if (!requirements || !requirements.expandable) {
    return null;
  }
  
  const tables = useStore(state => state.diagram.tables);
  const featureColumnMappings = useStore(state => state.diagram.featureColumnMappings || {});
  const toggleFeatureColumn = useStore(state => state.toggleFeatureColumn);
  
  const selectedColumns = featureColumnMappings[featureId] || {};
  
  // Get required tables for this feature
  const requiredTables = requirements.database?.tables || [];
  
  // Filter diagram tables to show only those needed by feature
  const relevantTables = tables.filter(t => requiredTables.includes(t.name));
  
  if (relevantTables.length === 0) {
    return (
      <div className="feature-column-selector">
        <div className="no-tables-message">
          ⚠️ No tables found. Please create tables in the diagram first:
          <div className="required-tables">
            {requiredTables.map(tableName => (
              <span key={tableName} className="table-badge">{tableName}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feature-column-selector">
      {relevantTables.map(table => {
        const tableRequirements = requirements.database.columns[table.name];
        const requiredCols = tableRequirements?.required || [];
        const optionalCols = tableRequirements?.optional || [];
        const selectedTableCols = selectedColumns[table.name] || [];
        
        return (
          <div key={table.name} className="table-columns-section">
            <div className="table-header">
              <span className="table-icon">📋</span>
              <span className="table-name">{table.name}</span>
            </div>
            
            {/* Required columns */}
            {requiredCols.length > 0 && (
              <div className="columns-group">
                <div className="group-label">Required columns:</div>
                {requiredCols.map(colName => {
                  const field = table.fields.find(f => f.name === colName);
                  if (!field) {
                    return (
                      <div key={colName} className="column-item missing">
                        <input type="checkbox" disabled />
                        <span className="column-name missing">{colName}</span>
                        <span className="missing-badge">not found</span>
                      </div>
                    );
                  }
                  
                  const isSelected = selectedTableCols.includes(colName);
                  
                  return (
                    <div key={colName} className="column-item">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFeatureColumn(featureId, table.name, colName)}
                      />
                      <span className="column-name">{colName}</span>
                      <span className="column-type">{field.type}</span>
                      {field.primaryKey && <span className="pk-badge">PK</span>}
                      {field.foreignKey && <span className="fk-badge">FK</span>}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Optional columns */}
            {optionalCols.length > 0 && (
              <div className="columns-group">
                <div className="group-label">Optional columns:</div>
                {optionalCols.map(colName => {
                  const field = table.fields.find(f => f.name === colName);
                  if (!field) {
                    return (
                      <div key={colName} className="column-item missing">
                        <input type="checkbox" disabled />
                        <span className="column-name missing">{colName}</span>
                        <span className="missing-badge">not found</span>
                      </div>
                    );
                  }
                  
                  const isSelected = selectedTableCols.includes(colName);
                  
                  return (
                    <div key={colName} className="column-item optional">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFeatureColumn(featureId, table.name, colName)}
                      />
                      <span className="column-name">{colName}</span>
                      <span className="column-type">{field.type}</span>
                      {field.primaryKey && <span className="pk-badge">PK</span>}
                      {field.foreignKey && <span className="fk-badge">FK</span>}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Show all available columns if no requirements specified */}
            {requiredCols.length === 0 && optionalCols.length === 0 && (
              <div className="columns-group">
                <div className="group-label">Available columns:</div>
                {table.fields.map(field => {
                  const isSelected = selectedTableCols.includes(field.name);
                  
                  return (
                    <div key={field.name} className="column-item">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFeatureColumn(featureId, table.name, field.name)}
                      />
                      <span className="column-name">{field.name}</span>
                      <span className="column-type">{field.type}</span>
                      {field.primaryKey && <span className="pk-badge">PK</span>}
                      {field.foreignKey && <span className="fk-badge">FK</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}