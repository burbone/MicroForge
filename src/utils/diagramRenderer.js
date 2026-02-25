import { HIERARCHICAL_CONFIG, FEATURE_MICROSERVICE_LINKS, MICROSERVICES, FEATURE_REQUIREMENTS } from '../config.js';
import { findFreePosition, getExistingWidgets } from './placement.js';
import { getFeatureColumnsWithIncrements } from './featureColumnsHelper.js';

export function renderDiagram(state) {
  let html = '';
  
  // Render Database block
  if (state.databaseEnabled && state.database) {
    html += renderDatabaseBlock(state);
  }
  
  // Render Cache block
  if (state.cacheEnabled && state.cache) {
    html += renderCacheBlock(state);
  }
  
  // Render Feature blocks
  if (state.selectedFeatures && state.selectedFeatures.length > 0) {
    html += renderFeatureBlocks(state);
  }
  
  // Render Microservice clouds
  const microservices = getRequiredMicroservices(state);
  if (microservices.length > 0) {
    html += renderMicroservices(state, microservices);
  }
  
  // Render Lines
  if (state.selectedFeatures && state.selectedFeatures.length > 0 && microservices.length > 0) {
    html += renderLines(state, microservices);
  }
  
  return html;
}

function getDatabaseName(db) {
  const names = {
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'h2': 'H2',
    'mongodb': 'MongoDB'
  };
  return names[db] || db;
}

function getCacheName(cache) {
  const names = {
    'redis': 'Redis',
    'in-memory': 'In-Memory',
    'caffeine': 'Caffeine'
  };
  return names[cache] || cache;
}

function renderDatabaseBlock(state) {
  if (state.database === 'mongodb') {
    return renderMongoDBBlock(state);
  }
  
  const pos = state.diagram.databasePosition || { x: 50, y: 50 };
  const dbName = state.database.charAt(0).toUpperCase() + state.database.slice(1);
  const tables = state.diagram.tables || [];
  const tableCount = tables.length;
  const columns = tableCount === 0 ? 1 : Math.ceil(Math.sqrt(tableCount));
  
  let html = `
    <div class="db-block" data-block="database" style="left: ${pos.x}px; top: ${pos.y}px;">
      <div class="db-header" data-block-header="database">
        <span class="db-icon">🗄️</span>
        <span class="db-name">${dbName}</span>
      </div>
      <div class="db-tables" style="--columns: ${columns};">
  `;
  
  tables.forEach((table, tableIndex) => {
    html += `
      <div class="table-block" data-table-index="${tableIndex}">
        <div class="table-header">
          <input type="text" 
            class="table-name-input" 
            data-table-index="${tableIndex}"
            ${table.name ? `value="${table.name}"` : ''}
            placeholder="Table name">
          <button class="table-remove-btn" data-table-index="${tableIndex}">×</button>
        </div>
        <div class="table-fields">
    `;
    
    if (table.fields && table.fields.length > 0) {
      table.fields.forEach((field, fieldIndex) => {
        const isEditing = state.diagram.editingField?.tableIndex === tableIndex && 
                         state.diagram.editingField?.fieldIndex === fieldIndex;
        html += renderField(field, tableIndex, fieldIndex, isEditing, state);
      });
    }
    
    html += `
          <button class="add-field-btn" data-table-index="${tableIndex}">+ Add Field</button>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      <button class="add-table-btn">+ Add Table</button>
    </div>
  `;
  
  return html;
}

function renderMongoDBBlock(state) {
  const pos = state.diagram.databasePosition || { x: 50, y: 50 };
  const tables = state.diagram.tables || [];
  const tableCount = tables.length;
  const columns = tableCount === 0 ? 1 : Math.ceil(Math.sqrt(tableCount));
  
  let html = `
    <div class="db-block" data-block="database" style="left: ${pos.x}px; top: ${pos.y}px;">
      <div class="db-header" data-block-header="database">
        <span class="db-icon">🍃</span>
        <span class="db-name">MongoDB</span>
      </div>
      <div class="db-tables" style="--columns: ${columns};">
  `;
  
  tables.forEach((table, tableIndex) => {
    html += `
      <div class="table-block" data-table-index="${tableIndex}">
        <div class="table-header">
          <input type="text" 
            class="table-name-input" 
            data-table-index="${tableIndex}"
            ${table.name ? `value="${table.name}"` : ''}
            placeholder="Collection name">
          <button class="table-remove-btn" data-table-index="${tableIndex}">×</button>
        </div>
        <div class="table-fields">
    `;
    
    if (table.fields && table.fields.length > 0) {
      table.fields.forEach((field, fieldIndex) => {
        const isEditing = state.diagram.editingField?.tableIndex === tableIndex && 
                         state.diagram.editingField?.fieldIndex === fieldIndex;
        html += renderMongoField(field, tableIndex, fieldIndex, isEditing, state);
      });
    }
    
    html += `
          <button class="add-field-btn" data-table-index="${tableIndex}">+ Add Field</button>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      <button class="add-table-btn">+ Add Collection</button>
    </div>
  `;
  
  return html;
}

function renderField(field, tableIndex, fieldIndex, isEditing, state) {
  const typeDisplay = getTypeDisplay(field);
  
  if (!isEditing && field.name) {
    return `
      <div class="table-field-display" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">
        <div class="field-display-content">
          <span class="field-name-display">${field.name}</span>
          <span class="field-type-display">${typeDisplay}</span>
          ${field.primaryKey ? '<span class="field-badge field-badge-pk">PK</span>' : ''}
          ${field.unique ? '<span class="field-badge field-badge-unique">UNIQUE</span>' : ''}
          ${field.foreignKey ? '<span class="field-badge field-badge-fk">FK</span>' : ''}
        </div>
        <button class="field-settings-btn" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">⚙️</button>
      </div>
    `;
  }
  
  const showTabs = isEditing && state.diagram.tempFieldData !== null;
  const activeTab = state.diagram.activeTab || 'type';
  
  return `
    <div class="table-field-edit-container" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">
      <div class="field-basic-row">
        <input type="text" 
          class="field-name-input" 
          data-table-index="${tableIndex}"
          data-field-index="${fieldIndex}"
          ${field.name ? `value="${field.name}"` : ''} 
          placeholder="Field name">
        <span class="field-type-preview">${typeDisplay}</span>
        <button class="field-settings-toggle-btn ${showTabs ? 'active' : ''}" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">⚙️</button>
        <button class="field-remove-btn" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">×</button>
      </div>
      
      ${showTabs ? `
        <div class="field-editor-tabs">
          <button class="field-tab-btn ${activeTab === 'type' ? 'active' : ''}" data-tab="type" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Type</button>
          <button class="field-tab-btn ${activeTab === 'constraints' ? 'active' : ''}" data-tab="constraints" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Constraints</button>
          <button class="field-tab-btn ${activeTab === 'foreign-key' ? 'active' : ''}" data-tab="foreign-key" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Foreign Key</button>
          <button class="field-tab-btn ${activeTab === 'validation' ? 'active' : ''}" data-tab="validation" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Validation</button>
          <button class="field-tab-btn ${activeTab === 'index' ? 'active' : ''}" data-tab="index" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Index</button>
          <button class="field-tab-btn ${activeTab === 'additional' ? 'active' : ''}" data-tab="additional" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Additional</button>
        </div>
        
        <div class="field-editor-content" data-table-index="${tableIndex}" data-field-index="${fieldIndex}"></div>
      ` : ''}
    </div>
  `;
}

function renderMongoField(field, tableIndex, fieldIndex, isEditing, state) {
  const typeDisplay = field.type || 'String';
  
  if (!isEditing && field.name) {
    const badges = [];
    if (field.required) badges.push('<span class="field-badge" style="background: rgba(255, 85, 85, 0.2); color: #ff5555;">REQUIRED</span>');
    if (field.unique) badges.push('<span class="field-badge field-badge-unique">UNIQUE</span>');
    if (field.indexed) badges.push('<span class="field-badge field-badge-fk">INDEX</span>');
    if (field.ref) badges.push(`<span class="field-badge" style="background: rgba(76, 175, 80, 0.2); color: #4caf50;">REF: ${field.ref}</span>`);
    if (field.isArray) badges.push(`<span class="field-badge" style="background: rgba(156, 39, 176, 0.2); color: #9c27b0;">ARRAY</span>`);
    
    return `
      <div class="table-field-display" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">
        <div class="field-display-content">
          <span class="field-name-display">${field.name}</span>
          <span class="field-type-display">${typeDisplay}</span>
          ${badges.join('')}
        </div>
        <button class="field-settings-btn" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">⚙️</button>
      </div>
    `;
  }
  
  const showTabs = isEditing && state.diagram.tempFieldData !== null;
  const activeTab = state.diagram.activeTab || 'type';
  
  return `
    <div class="table-field-edit-container" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">
      <div class="field-basic-row">
        <input type="text" 
          class="field-name-input" 
          data-table-index="${tableIndex}"
          data-field-index="${fieldIndex}"
          ${field.name ? `value="${field.name}"` : ''} 
          placeholder="Field name">
        <span class="field-type-preview">${typeDisplay}</span>
        <button class="field-settings-toggle-btn ${showTabs ? 'active' : ''}" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">⚙️</button>
        <button class="field-remove-btn" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">×</button>
      </div>
      
      ${showTabs ? `
        <div class="field-editor-tabs">
          <button class="field-tab-btn ${activeTab === 'type' ? 'active' : ''}" data-tab="type" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Type</button>
          <button class="field-tab-btn ${activeTab === 'validation' ? 'active' : ''}" data-tab="validation" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Validation</button>
          <button class="field-tab-btn ${activeTab === 'index' ? 'active' : ''}" data-tab="index" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Index</button>
          <button class="field-tab-btn ${activeTab === 'reference' ? 'active' : ''}" data-tab="reference" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Reference</button>
          <button class="field-tab-btn ${activeTab === 'default' ? 'active' : ''}" data-tab="default" data-table-index="${tableIndex}" data-field-index="${fieldIndex}">Default</button>
        </div>
        
        <div class="field-editor-content" data-table-index="${tableIndex}" data-field-index="${fieldIndex}"></div>
      ` : ''}
    </div>
  `;
}

function getTypeDisplay(field) {
  let display = field.type || 'VARCHAR';
  
  if (field.size && (field.type === 'VARCHAR' || field.type === 'CHAR')) {
    display += `(${field.size})`;
  } else if (field.precision && field.scale !== undefined) {
    display += `(${field.precision},${field.scale})`;
  } else if (field.precision) {
    display += `(${field.precision})`;
  }
  
  if (field.isArray) {
    display += '[]';
  }
  
  return display;
}

function renderCacheBlock(state) {
  if (state.cache === 'redis') {
    return renderRedisBlock(state);
  }
  
  if (state.cache === 'in-memory') {
    return renderInMemoryBlock(state);
  }
  
  if (state.cache === 'caffeine') {
    return renderCaffeineBlock(state);
  }
  
  return '';
}

function renderRedisBlock(state) {
  const pos = state.diagram.cachePosition || { x: 500, y: 50 };
  const keys = state.diagram.cacheKeys || [];
  const showingSettings = state.diagram.showingRedisSettings;
  
  return `
    <div class="db-block" data-block="cache" style="left: ${pos.x}px; top: ${pos.y}px;">
      ${showingSettings 
        ? `<button class="redis-settings-close-btn field-settings-toggle-btn" title="Close Settings" style="position: absolute; top: 10px; right: 10px; z-index: 10;">×</button>`
        : `<button class="redis-settings-toggle-btn field-settings-toggle-btn" title="Redis Settings">⚙️</button>`
      }
      <div class="db-header" data-block-header="cache" style="position: relative; width: 100%;">
        <span class="db-icon">🔴</span>
        <span class="db-name">Redis</span>
      </div>
      ${showingSettings ? renderRedisSettingsPanel(state) : `
        <div class="cache-keys">
          ${keys.map((key, index) => renderRedisKey(key, index, state)).join('')}
          <button class="add-redis-key-btn">+ Add Key Pattern</button>
        </div>
      `}
    </div>
  `;
}

function renderRedisKey(key, keyIndex, state) {
  const typeDisplay = key.type || 'String';
  const showTabs = state.diagram.tempKeyData !== null && state.diagram.editingKey?.keyIndex === keyIndex;
  const activeTab = state.diagram.activeCacheTab;
  
  return `
    <div class="table-field-edit-container" data-key-index="${keyIndex}">
      <div class="field-basic-row">
        <input type="text" 
          class="field-name-input redis-key-pattern-input" 
          data-key-index="${keyIndex}"
          ${key.pattern ? `value="${key.pattern}"` : ''}
          placeholder="Key pattern (e.g., user:{id})">
        <button class="redis-key-settings-toggle-btn ${showTabs ? 'active' : ''}" data-key-index="${keyIndex}">⚙️</button>
        <button class="redis-key-remove-btn" data-key-index="${keyIndex}">×</button>
      </div>
      
      ${showTabs ? `
        <div class="field-editor-tabs">
          <button class="redis-tab-btn ${activeTab === 'type' ? 'active' : ''}" data-tab="type" data-key-index="${keyIndex}">Type</button>
          <button class="redis-tab-btn ${activeTab === 'ttl' ? 'active' : ''}" data-tab="ttl" data-key-index="${keyIndex}">TTL</button>
          <button class="redis-tab-btn ${activeTab === 'serialization' ? 'active' : ''}" data-tab="serialization" data-key-index="${keyIndex}">Serialization</button>
          <button class="redis-tab-btn ${activeTab === 'eviction' ? 'active' : ''}" data-tab="eviction" data-key-index="${keyIndex}">Eviction</button>
        </div>
        
        ${activeTab ? `<div class="redis-editor-content" data-key-index="${keyIndex}"></div>` : ''}
      ` : ''}
    </div>
  `;
}

function renderRedisSettingsPanel(state) {
  const settings = state.diagram.redisSettings || {};
  
  return `
    <div class="cache-settings-panel">
      <div class="settings-panel-header">
        <h3>Redis Global Settings</h3>
      </div>
      <div class="editor-section">
        <div class="editor-group">
          <label>Max Memory</label>
          <input type="text" class="editor-input redis-max-memory" 
            value="${settings.maxMemory || '256mb'}" 
            placeholder="256mb">
        </div>
        <div class="editor-group">
          <label>Default TTL (seconds)</label>
          <input type="number" class="editor-input redis-default-ttl" 
            value="${settings.defaultTTL || ''}" 
            placeholder="Optional">
        </div>
        <div class="editor-group">
          <label>Global Eviction Policy</label>
          <select class="editor-select redis-global-eviction">
            <option value="noeviction" ${settings.eviction === 'noeviction' ? 'selected' : ''}>No Eviction</option>
            <option value="allkeys-lru" ${settings.eviction === 'allkeys-lru' ? 'selected' : ''}>All Keys LRU</option>
            <option value="allkeys-lfu" ${settings.eviction === 'allkeys-lfu' ? 'selected' : ''}>All Keys LFU</option>
            <option value="volatile-lru" ${settings.eviction === 'volatile-lru' ? 'selected' : ''}>Volatile LRU</option>
            <option value="volatile-lfu" ${settings.eviction === 'volatile-lfu' ? 'selected' : ''}>Volatile LFU</option>
            <option value="allkeys-random" ${settings.eviction === 'allkeys-random' ? 'selected' : ''}>All Keys Random</option>
            <option value="volatile-random" ${settings.eviction === 'volatile-random' ? 'selected' : ''}>Volatile Random</option>
            <option value="volatile-ttl" ${settings.eviction === 'volatile-ttl' ? 'selected' : ''}>Volatile TTL</option>
          </select>
        </div>
        <div class="editor-group">
          <label>Persistence Strategy</label>
          <select class="editor-select redis-persistence">
            <option value="none" ${settings.persistence === 'none' ? 'selected' : ''}>None</option>
            <option value="rdb" ${settings.persistence === 'rdb' ? 'selected' : ''}>RDB</option>
            <option value="aof" ${settings.persistence === 'aof' ? 'selected' : ''}>AOF</option>
            <option value="rdb-aof" ${settings.persistence === 'rdb-aof' ? 'selected' : ''}>RDB + AOF</option>
          </select>
        </div>
        <div class="editor-group">
          <label>Max Connections</label>
          <input type="number" class="editor-input redis-max-connections" 
            value="${settings.maxConnections || ''}" 
            placeholder="Optional">
        </div>
        <div class="editor-group">
          <label>Timeout (seconds)</label>
          <input type="number" class="editor-input redis-timeout" 
            value="${settings.timeout || ''}" 
            placeholder="Optional">
        </div>
        <button class="editor-save-btn redis-settings-save-btn">Save Settings</button>
      </div>
    </div>
  `;
}

function renderInMemoryBlock(state) {
  const pos = state.diagram.cachePosition || { x: 500, y: 50 };
  const keys = state.diagram.inMemoryKeys || [];
  const showingSettings = state.diagram.showingInMemorySettings;
  
  return `
    <div class="db-block" data-block="cache" style="left: ${pos.x}px; top: ${pos.y}px;">
      ${showingSettings 
        ? `<button class="inmemory-settings-close-btn field-settings-toggle-btn" title="Close Settings" style="position: absolute; top: 10px; right: 10px; z-index: 10;">×</button>`
        : `<button class="inmemory-settings-toggle-btn field-settings-toggle-btn" title="Cache Settings">⚙️</button>`
      }
      <div class="db-header" data-block-header="cache" style="position: relative; width: 100%;">
        <span class="db-icon">💾</span>
        <span class="db-name">In-Memory Cache</span>
      </div>
      ${showingSettings ? renderInMemorySettingsPanel(state) : `
        <div class="cache-keys">
          ${keys.map((key, index) => renderInMemoryKey(key, index, state)).join('')}
          <button class="add-inmemory-key-btn">+ Add Key</button>
        </div>
      `}
    </div>
  `;
}

function renderInMemoryKey(key, keyIndex, state) {
  const isEditing = state.diagram.editingInMemoryKey?.keyIndex === keyIndex;
  const showContent = state.diagram.activeInMemoryTab !== null && isEditing;
  
  return `
    <div class="table-field-edit-container" data-key-index="${keyIndex}">
      <div class="field-basic-row">
        <input type="text" 
          class="field-name-input inmemory-key-name-input" 
          data-key-index="${keyIndex}"
          ${key.name ? `value="${key.name}"` : ''}
          placeholder="Key name">
        <button class="inmemory-key-settings-toggle-btn ${isEditing ? 'active' : ''}" data-key-index="${keyIndex}">⚙️</button>
        <button class="inmemory-key-remove-btn" data-key-index="${keyIndex}">×</button>
      </div>
      ${showContent ? `<div class="inmemory-editor-content" data-key-index="${keyIndex}"></div>` : ''}
    </div>
  `;
}

function renderInMemorySettingsPanel(state) {
  const settings = state.diagram.inMemorySettings || {};
  
  return `
    <div class="cache-settings-panel">
      <div class="settings-panel-header">
        <h3>In-Memory Cache Global Settings</h3>
      </div>
      <div class="editor-section">
        <div class="editor-group">
          <label>Max Size</label>
          <input type="number" class="editor-input inmemory-max-size" 
            ${settings.maxSize ? `value="${settings.maxSize}"` : ''}
            placeholder="1000">
          <span class="editor-hint">Maximum number of entries</span>
        </div>
        <div class="editor-group">
          <label>Default TTL (seconds)</label>
          <input type="number" class="editor-input inmemory-default-ttl" 
            ${settings.defaultTTL ? `value="${settings.defaultTTL}"` : ''}
            placeholder="Optional">
          <span class="editor-hint">Default expiration time</span>
        </div>
        <div class="editor-group">
          <label>Eviction Policy</label>
          <select class="editor-select inmemory-eviction-policy">
            <option value="LRU" ${settings.evictionPolicy === 'LRU' ? 'selected' : ''}>LRU (Least Recently Used)</option>
            <option value="LFU" ${settings.evictionPolicy === 'LFU' ? 'selected' : ''}>LFU (Least Frequently Used)</option>
            <option value="FIFO" ${settings.evictionPolicy === 'FIFO' ? 'selected' : ''}>FIFO (First In First Out)</option>
            <option value="Random" ${settings.evictionPolicy === 'Random' ? 'selected' : ''}>Random</option>
          </select>
          <span class="editor-hint">Strategy for removing entries when cache is full</span>
        </div>
        <button class="editor-save-btn inmemory-settings-save-btn">Save Settings</button>
      </div>
    </div>
  `;
}

function renderCaffeineBlock(state) {
  const pos = state.diagram.cachePosition || { x: 500, y: 50 };
  const caches = state.diagram.caffeineCaches || [];
  
  return `
    <div class="db-block" data-block="cache" style="left: ${pos.x}px; top: ${pos.y}px;">
      <div class="db-header" data-block-header="cache" style="position: relative; width: 100%;">
        <span class="db-icon">☕</span>
        <span class="db-name">Caffeine</span>
      </div>
      <div class="cache-keys">
        ${caches.map((cache, index) => renderCaffeineCache(cache, index, state)).join('')}
        <button class="add-caffeine-cache-btn">+ Add Cache</button>
      </div>
    </div>
  `;
}

function renderCaffeineCache(cache, cacheIndex, state) {
  const isEditing = state.diagram.editingCaffeineCache?.cacheIndex === cacheIndex;
  const showSelector = isEditing && state.diagram.activeCaffeineTab === 'selector';
  const showContent = isEditing && state.diagram.caffeineSelectedType !== null;
  
  return `
    <div class="table-field-edit-container" data-cache-index="${cacheIndex}">
      <div class="field-basic-row">
        <input type="text" 
          class="field-name-input caffeine-cache-name-input" 
          data-cache-index="${cacheIndex}"
          ${cache.name ? `value="${cache.name}"` : ''}
          placeholder="Cache name">
        <button class="caffeine-cache-settings-toggle-btn ${isEditing ? 'active' : ''}" data-cache-index="${cacheIndex}">⚙️</button>
        <button class="caffeine-cache-remove-btn" data-cache-index="${cacheIndex}">×</button>
      </div>
      
      ${showSelector || showContent ? `
        <div class="caffeine-editor-content" data-cache-index="${cacheIndex}"></div>
      ` : ''}
    </div>
  `;
}

function renderFeatureBlocks(state) {
  let html = '';
  const existingWidgets = getExistingWidgets(state);
  
  // Group features by parent
  const parentFeatures = [];
  
  state.selectedFeatures.forEach(featureId => {
    // Check if this is a parent feature (exists in HIERARCHICAL_CONFIG keys)
    if (HIERARCHICAL_CONFIG[featureId]) {
      parentFeatures.push(featureId);
    }
  });
  
  parentFeatures.forEach((parentId, index) => {
    const parentData = HIERARCHICAL_CONFIG[parentId];
    
    // Find position
    let pos = state.diagram[parentId + 'Position'];
    if (!pos) {
      pos = findFreePosition(existingWidgets, 400, 200);
      existingWidgets.push({ x: pos.x, y: pos.y, width: 400, height: 200 });
    }
    
    html += `
      <div class="db-block hierarchical-parent" 
           data-block="${parentId}" 
           data-widget-type="parent"
           style="left: ${pos.x}px; top: ${pos.y}px; width: 400px; height: auto;">
        <div class="db-header hierarchical-header" data-block-header="${parentId}">
          <span class="db-icon hierarchical-icon">${parentData.icon || '📦'}</span>
          <span class="db-name hierarchical-name">${parentData.name}</span>
        </div>
        <div class="hierarchical-children-container">
          ${renderHierarchicalChildren(parentId, parentData, state)}
        </div>
      </div>
    `;
  });
  
  return html;
}

/**
 * Check if feature has columns to show (helper for hasColumns check)
 */
function hasFeatureColumns(featureId, featureReq, selectedFeatures) {
  if (!featureReq) return false;
  
  // Use getFeatureColumnsWithIncrements to get all columns including increments
  const allColumns = getFeatureColumnsWithIncrements(featureId, selectedFeatures);
  
  // Count total columns
  let totalColumns = 0;
  if (allColumns.tables) {
    for (const cols of Object.values(allColumns.tables)) {
      totalColumns += (cols.required || []).length;
      totalColumns += (cols.optional || []).length;
    }
  }
  
  // Check cache
  const hasCache = featureReq.cache && !featureReq.cache.increment &&
                  ((featureReq.cache.required || 0) > 0 || (featureReq.cache.optional || 0) > 0);
  
  return totalColumns > 0 || hasCache;
}

function renderHierarchicalChildren(parentId, parentData, state) {
  if (!parentData.children) {
    return '<div class="hierarchical-empty">No items</div>';
  }
  
  let html = '';
  let hasAnySelected = false;
  
  parentData.children.forEach(child => {
    // Check if child is selected
    if (state.selectedFeatures.includes(child.id)) {
      hasAnySelected = true;
      
      // Check if child has its own children (nested structure)
      if (child.children && child.children.length > 0) {
        // Render as parent-child
        const featureReq = FEATURE_REQUIREMENTS[child.id];
        const hasColumns = hasFeatureColumns(child.id, featureReq, state.selectedFeatures);
        
        html += `
          <div class="hierarchical-parent-child" 
               data-widget-type="parent-child"
               data-child-id="${child.id}"
               data-parent-id="${parentId}">
            <div class="hierarchical-parent-child-header ${hasColumns ? 'clickable' : ''}" data-child-id="${child.id}">
              ${child.icon ? `<span class="hierarchical-icon">${child.icon}</span>` : ''}
              <span class="hierarchical-parent-child-name">${child.name}</span>
              ${hasColumns ? `<span class="hierarchical-child-expand-icon" data-child-id="${child.id}">▼</span>` : ''}
            </div>
            ${hasColumns ? renderColumnSelector(child.id, featureReq, state) : ''}
            <div class="hierarchical-parent-child-children">
              ${renderNestedChildren(child, state)}
            </div>
          </div>
        `;
      } else {
        // Render as simple child
        const featureReq = FEATURE_REQUIREMENTS[child.id];
        const hasColumns = hasFeatureColumns(child.id, featureReq, state.selectedFeatures);
        
        html += `
          <div class="hierarchical-child" 
               data-widget-type="child"
               data-child-id="${child.id}"
               data-parent-id="${parentId}">
            <div class="hierarchical-child-header-row ${hasColumns ? 'clickable' : ''}" data-child-id="${child.id}">
              <span class="hierarchical-child-name">${child.name}</span>
              ${hasColumns ? `<span class="hierarchical-child-expand-icon" data-child-id="${child.id}">▼</span>` : ''}
            </div>
            ${hasColumns ? renderColumnSelector(child.id, featureReq, state) : ''}
          </div>
        `;
      }
    }
  });
  
  return html || '<div class="hierarchical-empty">Select items from features panel</div>';
}

function renderNestedChildren(parentChild, state) {
  if (!parentChild.children) return '';
  
  let html = '';
  
  parentChild.children.forEach(nestedChild => {
    if (state.selectedFeatures.includes(nestedChild.id)) {
      const featureReq = FEATURE_REQUIREMENTS[nestedChild.id];
      const hasColumns = hasFeatureColumns(nestedChild.id, featureReq, state.selectedFeatures);
      
      html += `
        <div class="hierarchical-nested-child" 
             data-widget-type="child"
             data-child-id="${nestedChild.id}"
             data-parent-id="${parentChild.id}">
          <div class="hierarchical-child-header-row ${hasColumns ? 'clickable' : ''}" data-child-id="${nestedChild.id}">
            <span class="hierarchical-nested-child-name">${nestedChild.name}</span>
            ${hasColumns ? `<span class="hierarchical-child-expand-icon" data-child-id="${nestedChild.id}">▼</span>` : ''}
          </div>
          ${hasColumns ? renderColumnSelector(nestedChild.id, featureReq, state) : ''}
        </div>
      `;
      }
  });
  
  return html;
}

function getRequiredMicroservices(state) {
  const services = new Set();
  state.selectedFeatures.forEach(featureId => {
    const linked = FEATURE_MICROSERVICE_LINKS[featureId];
    if (linked) {
      linked.forEach(s => services.add(s));
    }
  });
  return Array.from(services);
}

function renderMicroservices(state, microservices) {
  let html = '';
  
  microservices.forEach((serviceId, index) => {
    const service = MICROSERVICES[serviceId];
    if (!service) return;
    
    let pos = state.diagram[serviceId + 'Position'];
    if (!pos) {
      pos = { x: 1600, y: 50 + index * 200 };
    }
    
    html += `
      <div class="microservice-cloud" 
           data-block="${serviceId}" 
           style="left: ${pos.x}px; top: ${pos.y}px; position: absolute; width: 200px; height: 120px; cursor: move;">
        <svg data-block-header="${serviceId}" viewBox="0 0 200 120" style="width: 100%; height: 100%; display: block;">
          <path d="M 30,85 Q 10,85 10,65 Q 10,45 30,45 Q 35,15 65,15 Q 95,15 100,45 Q 120,38 135,52 Q 155,58 150,78 Q 150,95 130,95 L 30,95 Z" 
                fill="#2a2a2a" stroke="#7b3ff2" stroke-width="2.5"/>
          <text x="80" y="58" 
                text-anchor="middle" 
                dominant-baseline="middle"
                fill="#7b3ff2" 
                font-size="13" 
                font-weight="600"
                font-family="-apple-system, BlinkMacSystemFont, sans-serif">${service.name}</text>
        </svg>
      </div>
    `;
  });
  
  return html;
}

function renderLines(state, microservices) {
  let html = '<svg class="diagram-lines" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1;">';
  
  state.selectedFeatures.forEach(featureId => {
    const services = FEATURE_MICROSERVICE_LINKS[featureId];
    if (!services) return;
    
    // Check if this is a parent feature
    if (!HIERARCHICAL_CONFIG[featureId]) return;
    
    const featurePos = state.diagram[featureId + 'Position'];
    if (!featurePos) return;
    
    const parentData = HIERARCHICAL_CONFIG[featureId];
    let childIndex = 0;
    
    services.forEach(serviceId => {
      if (!microservices.includes(serviceId)) return;
      
      const servicePos = state.diagram[serviceId + 'Position'] || { x: 1600, y: 50 + microservices.indexOf(serviceId) * 200 };
      
      // Calculate Y offset for children
      const baseY = featurePos.y + 80;
      const yOffset = childIndex * 32;
      
      const startX = featurePos.x + 400;
      const startY = baseY + yOffset;
      const endX = servicePos.x + 90;
      const endY = servicePos.y + 50;
      
      html += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#7b3ff2" stroke-width="2"/>`;
      
      childIndex++;
    });
  });
  
  html += '</svg>';
  
  return html;
}
// ============================================================================
// Feature Column Selector Functions
// ============================================================================

function renderColumnSelector(featureId, featureReq, state) {
  if (!featureReq) return '';
  
  // Get all columns including increments from children
  const allColumns = getFeatureColumnsWithIncrements(featureId, state.selectedFeatures);
  
  // Count required and optional columns from allColumns
  let totalRequired = 0;
  let totalOptional = 0;
  
  if (allColumns.tables && Object.keys(allColumns.tables).length > 0) {
    for (const [tableName, cols] of Object.entries(allColumns.tables)) {
      totalRequired += (cols.required || []).length;
      totalOptional += (cols.optional || []).length;
    }
  }
  
  const hasDatabase = totalRequired > 0 || totalOptional > 0;
  const hasCache = featureReq.cache && !featureReq.cache.increment;
  
  if (!hasDatabase && !hasCache) return '';
  
  return `
    <div class="hierarchical-columns-container" data-feature-id="${featureId}" style="display: none;">
      <div class="hierarchical-columns-list">
        ${hasDatabase ? renderDatabaseSection(featureId, totalRequired, totalOptional) : ''}
        ${hasCache ? renderCacheSection(featureId, featureReq.cache) : ''}
      </div>
    </div>
  `;
}

function renderDatabaseSection(featureId, required, optional) {
  if (required === 0 && optional === 0) return '';
  
  return `
    <div class="hierarchical-section database-section">
      <div class="hierarchical-section-title">Database Columns</div>
      ${renderRequiredColumns(featureId, 'database', required)}
      ${renderOptionalColumns(featureId, 'database', optional)}
    </div>
  `;
}

function renderCacheSection(featureId, cacheReq) {
  const required = cacheReq.required || 0;
  const optional = cacheReq.optional || 0;
  
  if (required === 0 && optional === 0) return '';
  
  return `
    <div class="hierarchical-section cache-section">
      <div class="hierarchical-section-title">Cache Keys</div>
      ${renderRequiredColumns(featureId, 'cache', required)}
      ${renderOptionalColumns(featureId, 'cache', optional)}
    </div>
  `;
}

function renderRequiredColumns(featureId, type, count) {
  if (count === 0) return '';
  
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="hierarchical-column-row" data-required="true" data-type="${type}">
        <select class="hierarchical-column-select" data-feature-id="${featureId}" data-column-index="${i}" data-type="${type}">
          <option value="">Select ${type === 'database' ? 'column' : 'key'}...</option>
        </select>
        <span class="hierarchical-column-badge required">R</span>
      </div>
    `;
  }
  return html;
}

function renderOptionalColumns(featureId, type, maxCount) {
  if (maxCount === 0) return '';
  
  return `
    <div class="hierarchical-optional-columns" data-feature-id="${featureId}" data-max="${maxCount}" data-type="${type}">
      <button class="hierarchical-add-column-btn" data-feature-id="${featureId}" data-type="${type}">+ Add ${type === 'database' ? 'column' : 'key'}</button>
    </div>
  `;
}