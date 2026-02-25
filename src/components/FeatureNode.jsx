import { h } from 'preact';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store/store';
import { HIERARCHICAL_CONFIG } from '../config';

export default function FeatureNode({ data, id }) {
  const selectedFeatures = useStore(state => state.selectedFeatures);
  const groupData = HIERARCHICAL_CONFIG[id];
  if (!groupData) return null;
  
  // Get selected children
  const selectedChildren = groupData.children ? 
    groupData.children.filter(child => selectedFeatures.includes(child.id)) : [];
  
  return (
    <div className="feature-widget parent-child-widget" style={{ minWidth: '400px' }}>
      <div className="widget-header">
        <span className="widget-icon">{groupData.icon}</span>
        <span className="widget-title">{groupData.name}</span>
      </div>
      
      <div className="widget-content">
        {selectedChildren.length > 0 ? (
          <div className="feature-children-list">
            {selectedChildren.map((child, childIndex) => (
              <div key={child.id} className="feature-child-item selected">
                <span className="child-checkbox">☑</span>
                <span className="child-name">{child.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '13px' }}>
            No children selected
          </div>
        )}
        
        {/* TODO: Column selection */}
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}