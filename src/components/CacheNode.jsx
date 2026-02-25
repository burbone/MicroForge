import { h } from 'preact';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store/store';

export default function CacheNode({ data, id }) {
  const diagram = useStore(state => state.diagram);
  const cache = useStore(state => state.cache);
  
  const getCacheName = (c) => {
    const names = {
      'redis': 'Redis',
      'in-memory': 'In-Memory',
      'caffeine': 'Caffeine'
    };
    return names[c] || c;
  };
  
  const keys = cache === 'redis' ? (diagram.cacheKeys || []) :
              cache === 'in-memory' ? (diagram.inMemoryKeys || []) :
              cache === 'caffeine' ? (diagram.caffeineCaches || []) : [];
  
  return (
    <div className="data-widget cache-widget" style={{ minWidth: '400px' }}>
      <div className="widget-header">
        <span className="widget-icon">⚡</span>
        <span className="widget-title">{getCacheName(cache)}</span>
      </div>
      
      <div className="widget-content">
        {keys.length === 0 ? (
          <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '13px' }}>
            No keys yet
          </div>
        ) : (
          keys.map((key, keyIndex) => (
            <div key={keyIndex} className="cache-key-row">
              <div className="key-pattern">
                {cache === 'redis' && (
                  <>
                    <span className="key-label">Key:</span>
                    <span className="key-value">{key.pattern || 'unnamed'}</span>
                  </>
                )}
                {cache === 'in-memory' && (
                  <>
                    <span className="key-label">Key:</span>
                    <span className="key-value">{key.name || 'unnamed'}</span>
                  </>
                )}
                {cache === 'caffeine' && (
                  <>
                    <span className="key-label">Cache:</span>
                    <span className="key-value">{key.name || 'unnamed'}</span>
                  </>
                )}
              </div>
              {cache === 'redis' && key.valueType && (
                <div className="key-type">Type: {key.valueType}</div>
              )}
            </div>
          ))
        )}
        
        <button className="add-key-btn">
          + Add {cache === 'caffeine' ? 'Cache' : 'Key Pattern'}
        </button>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}