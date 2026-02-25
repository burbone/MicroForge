import { h } from 'preact';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store/store';

export default function DatabaseNode({ data, id }) {
  const diagram = useStore(state => state.diagram);
  const database = useStore(state => state.database);
  
  const getDatabaseName = (db) => {
    const names = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'h2': 'H2',
      'mongodb': 'MongoDB'
    };
    return names[db] || db;
  };
  
  const tables = diagram.tables || [];
  
  return (
    <div className="data-widget db-widget" style={{ minWidth: '400px' }}>
      <div className="widget-header">
        <span className="widget-icon">🗄️</span>
        <span className="widget-title">{getDatabaseName(database)}</span>
      </div>
      
      <div className="widget-content">
        {tables.length === 0 ? (
          <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '13px' }}>
            No tables yet
          </div>
        ) : (
          tables.map((table, tableIndex) => (
            <div key={tableIndex} className="db-table">
              <div className="table-name-row">
                <span className="table-label">Table:</span>
                <span className="table-name">{table.name}</span>
              </div>
              
              <div className="table-fields">
                {table.fields && table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="field-row">
                    <span className="field-name">{field.name}</span>
                    <span className="field-type">{field.type}</span>
                    {field.primaryKey && <span className="field-badge pk">PK</span>}
                    {field.notNull && <span className="field-badge nn">NN</span>}
                    {field.unique && <span className="field-badge uq">UQ</span>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        
        <button className="add-table-btn">+ Add Table</button>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}