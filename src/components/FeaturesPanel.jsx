import { h } from 'preact';
import { useStore } from '../store/store';
import { HIERARCHICAL_CONFIG } from '../config';
import { getFeatureTree } from '../utils/tree/featureTree';

// Initialize feature tree utility
const featureTree = getFeatureTree(HIERARCHICAL_CONFIG);

export default function FeaturesPanel() {
  const featuresPanelOpen = useStore(state => state.featuresPanelOpen);
  const setFeaturesPanelOpen = useStore(state => state.setFeaturesPanelOpen);
  const selectedFeatures = useStore(state => state.selectedFeatures);
  const toggleFeature = useStore(state => state.toggleFeature);
  const model = useStore(state => state.model);
  
  // Define categories with feature IDs
  const categories = [
    {
      name: 'CORE AUTHENTICATION',
      features: ['authentication', 'token-system', 'token-features', 'mfa']
    },
    {
      name: 'USER MANAGEMENT',
      features: ['registration', 'password-security', 'account-management', 'user-profile']
    },
    {
      name: 'AUTHORIZATION & ACCESS',
      features: ['authorization', 'admin-panel', 'multi-tenancy']
    },
    {
      name: 'SECURITY & COMPLIANCE',
      features: ['audit-security', 'compliance-legal', 'cryptography']
    },
    {
      name: 'INTEGRATION & EXTERNAL',
      features: ['oauth2', 'integrations-events']
    },
    {
      name: 'OPERATIONAL & TECHNICAL',
      features: ['operational', 'validation', 'database-performance', 'enterprise']
    }
  ];
  
  // No model selected
  if (!model) {
    return (
      <div className={`features-panel ${featuresPanelOpen ? 'open' : ''}`} id="features-panel">
        <div className="features-content">
          <h2>Features</h2>
          <p style={{ color: '#666', fontSize: '13px', marginTop: '20px', padding: '0 20px' }}>
            Select a model to see available features
          </p>
        </div>
        
        <button 
          className="features-toggle" 
          id="features-toggle"
          onClick={() => setFeaturesPanelOpen(!featuresPanelOpen)}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      </div>
    );
  }
  
  // Non-synchronous models - coming soon
  if (model !== 'synchronous') {
    return (
      <div className={`features-panel ${featuresPanelOpen ? 'open' : ''}`} id="features-panel">
        <div className="features-content">
          <h2>Features</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', opacity: '0.3' }}>🚧</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#7b3ff2', marginBottom: '10px' }}>
              Coming Soon
            </div>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
              Features for this model are<br/>currently under development
            </div>
          </div>
        </div>
        
        <button 
          className="features-toggle" 
          id="features-toggle"
          onClick={() => setFeaturesPanelOpen(!featuresPanelOpen)}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      </div>
    );
  }
  
  // Main panel with features
  return (
    <div className={`features-panel ${featuresPanelOpen ? 'open' : ''}`} id="features-panel">
      <div className="features-content">
        <h2>Features</h2>
        
        <div className="feature-categories">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {categoryIndex > 0 && <div className="feature-spacer"></div>}
              
              <div className="feature-category">
                <h3>{category.name}</h3>
                <ul className="feature-list">
                  {Object.entries(HIERARCHICAL_CONFIG)
                    .filter(([groupId]) => category.features.includes(groupId))
                    .map(([groupId, groupData]) => (
                      <FeatureGroup
                        key={groupId}
                        groupId={groupId}
                        groupData={groupData}
                        selectedFeatures={selectedFeatures}
                        toggleFeature={toggleFeature}
                        featureTree={featureTree}
                      />
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="features-toggle" 
        id="features-toggle"
        onClick={() => setFeaturesPanelOpen(!featuresPanelOpen)}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
    </div>
  );
}

function FeatureGroup({ groupId, groupData, selectedFeatures, toggleFeature, featureTree }) {
  const isSelected = selectedFeatures.includes(groupId);
  const hasChildren = featureTree.hasChildren(groupId);
  const isDisabled = featureTree.isFeatureDisabled(groupData, selectedFeatures);
  const showArrow = hasChildren && !isSelected;
  
  let groupName = groupData.name;
  if (isDisabled && groupData.note) {
    groupName += ` (${groupData.note})`;
  }
  
  return (
    <>
      <li 
        className={`feature-group ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${showArrow ? 'has-children' : ''}`}
        data-feature={groupId}
        onClick={() => !isDisabled && toggleFeature(groupId)}
      >
        {groupName}
      </li>
      
      {isSelected && hasChildren && groupData.children.map(child => (
        <FeatureChild
          key={child.id}
          child={child}
          parentId={groupId}
          selectedFeatures={selectedFeatures}
          toggleFeature={toggleFeature}
          featureTree={featureTree}
        />
      ))}
    </>
  );
}

function FeatureChild({ child, parentId, selectedFeatures, toggleFeature, featureTree }) {
  const isSelected = selectedFeatures.includes(child.id);
  const hasChildren = child.children && child.children.length > 0;
  const isDisabled = featureTree.isFeatureDisabled(child, selectedFeatures);
  const showArrow = hasChildren && !isSelected;
  
  let childName = child.name;
  if (isDisabled && child.note) {
    childName += ` (${child.note})`;
  }
  
  return (
    <>
      <li 
        className={`feature-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${showArrow ? 'has-children' : ''}`}
        data-feature={child.id}
        data-parent={parentId}
        onClick={() => !isDisabled && toggleFeature(child.id)}
      >
        {childName}
      </li>
      
      {isSelected && hasChildren && child.children.map(subchild => {
        const isSubSelected = selectedFeatures.includes(subchild.id);
        const isSubDisabled = featureTree.isFeatureDisabled(subchild, selectedFeatures);
        
        let subchildName = subchild.name;
        if (isSubDisabled && subchild.note) {
          subchildName += ` (${subchild.note})`;
        }
        
        return (
          <li
            key={subchild.id}
            className={`feature-subitem ${isSubSelected ? 'selected' : ''} ${isSubDisabled ? 'disabled' : ''}`}
            data-feature={subchild.id}
            data-parent={child.id}
            onClick={() => !isSubDisabled && toggleFeature(subchild.id)}
          >
            {subchildName}
          </li>
        );
      })}
    </>
  );
}