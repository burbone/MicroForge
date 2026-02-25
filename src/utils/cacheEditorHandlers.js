// Cache editor handlers for Redis, In-Memory, and Caffeine
import {
  renderRedisTypeEditor,
  renderRedisTTLEditor,
  renderRedisSerializationEditor,
  renderRedisEvictionEditor,
  renderInMemoryTTLEditor,
  renderCaffeineSettingsEditor,
  renderCaffeineAdvancedEditor
} from './editors/cacheEditors.js';

// ============================================================================
// Redis Cache Handlers
// ============================================================================

export function initRedisEditorHandlers(keyIndex, tab, container, useStore, updateDiagram) {
  const state = useStore.getState();
  const tempKey = state.diagram.tempKeyData;
  
  if (!tempKey) return;
  
  // Common save handler for all tabs
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const freshState = useStore.getState();
      const freshTempData = freshState.diagram.tempKeyData;
      
      // Update actual key
      const keys = [...freshState.diagram.cacheKeys];
      keys[keyIndex] = { ...freshTempData };
      
      useStore.setState({
        diagram: {
          ...freshState.diagram,
          cacheKeys: keys
        }
      });
      
      // Clear tab content
      container.innerHTML = '';
      
      // Deactivate tabs
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`)
        .forEach(b => b.classList.remove('active'));
      
      // Update state
      const newState = useStore.getState();
      useStore.setState({
        diagram: {
          ...newState.diagram,
          activeCacheTab: null,
          tempKeyData: { ...newState.diagram.cacheKeys[keyIndex] }
        }
      });
      
      updateDiagram();
    };
  }
  
  // Tab-specific handlers
  switch(tab) {
    case 'type':
      initRedisTypeHandlers(tempKey, keyIndex, container, useStore, updateDiagram);
      break;
    case 'ttl':
      initRedisTTLHandlers(tempKey, container);
      break;
    case 'serialization':
      initRedisSerializationHandlers(tempKey, keyIndex, container, useStore, updateDiagram);
      break;
    case 'eviction':
      initRedisEvictionHandlers(tempKey, container);
      break;
  }
}

function initRedisTypeHandlers(tempKey, keyIndex, container, useStore, updateDiagram) {
  const typeSelect = container.querySelector('.redis-type-select');
  if (typeSelect) {
    typeSelect.onchange = (e) => {
      tempKey.type = e.target.value;
      // Re-render to show/hide type-specific fields
      container.innerHTML = renderRedisTypeEditor(tempKey);
      initRedisEditorHandlers(keyIndex, 'type', container, useStore, updateDiagram);
    };
  }
  
  const hashFieldsTextarea = container.querySelector('.redis-hash-fields');
  if (hashFieldsTextarea) {
    hashFieldsTextarea.oninput = (e) => {
      tempKey.hashFields = e.target.value.split(',').map(f => f.trim()).filter(f => f);
    };
  }
  
  const scoreFieldInput = container.querySelector('.redis-score-field');
  if (scoreFieldInput) {
    scoreFieldInput.oninput = (e) => {
      tempKey.scoreField = e.target.value;
    };
  }
}

function initRedisTTLHandlers(tempKey, container) {
  const ttlInput = container.querySelector('.redis-ttl-input');
  if (ttlInput) {
    ttlInput.oninput = (e) => {
      tempKey.ttl = e.target.value ? parseInt(e.target.value) : null;
    };
  }
  
  const expireStrategySelect = container.querySelector('.redis-expire-strategy-select');
  if (expireStrategySelect) {
    expireStrategySelect.onchange = (e) => {
      tempKey.expireStrategy = e.target.value;
    };
  }
}

function initRedisSerializationHandlers(tempKey, keyIndex, container, useStore, updateDiagram) {
  const serializationSelect = container.querySelector('.redis-serialization-select');
  if (serializationSelect) {
    serializationSelect.onchange = (e) => {
      tempKey.serialization = e.target.value;
      // Re-render to show/hide JSON-specific options
      container.innerHTML = renderRedisSerializationEditor(tempKey);
      initRedisEditorHandlers(keyIndex, 'serialization', container, useStore, updateDiagram);
    };
  }
  
  const compressionSelect = container.querySelector('.redis-compression-select');
  if (compressionSelect) {
    compressionSelect.onchange = (e) => {
      tempKey.compression = e.target.value;
    };
  }
  
  const prettyJsonCheckbox = container.querySelector('.redis-pretty-json-checkbox');
  if (prettyJsonCheckbox) {
    prettyJsonCheckbox.onchange = (e) => {
      tempKey.prettyJson = e.target.checked;
    };
  }
}

function initRedisEvictionHandlers(tempKey, container) {
  const evictionSelect = container.querySelector('.redis-eviction-select');
  if (evictionSelect) {
    evictionSelect.onchange = (e) => {
      tempKey.eviction = e.target.value;
    };
  }
  
  const pinKeyCheckbox = container.querySelector('.redis-pin-key-checkbox');
  if (pinKeyCheckbox) {
    pinKeyCheckbox.onchange = (e) => {
      tempKey.pinned = e.target.checked;
    };
  }
}

// ============================================================================
// Redis Global Settings Handlers
// ============================================================================

export function initRedisSettingsHandlers(useStore, updateDiagram) {
  const saveBtn = document.querySelector('.redis-settings-save-btn');
  if (!saveBtn) return;
  
  saveBtn.onclick = () => {
    const state = useStore.getState();
    
    if (!state.diagram.redisSettings) {
      useStore.setState({
        diagram: {
          ...state.diagram,
          redisSettings: {}
        }
      });
    }
    
    const maxMemoryInput = document.querySelector('.redis-max-memory');
    const defaultTTLInput = document.querySelector('.redis-default-ttl');
    const globalEvictionSelect = document.querySelector('.redis-global-eviction');
    const persistenceSelect = document.querySelector('.redis-persistence');
    const maxConnectionsInput = document.querySelector('.redis-max-connections');
    const timeoutInput = document.querySelector('.redis-timeout');
    
    const newState = useStore.getState();
    const newSettings = { ...newState.diagram.redisSettings };
    
    if (maxMemoryInput) newSettings.maxMemory = maxMemoryInput.value;
    if (defaultTTLInput) newSettings.defaultTTL = defaultTTLInput.value ? parseInt(defaultTTLInput.value) : null;
    if (globalEvictionSelect) newSettings.eviction = globalEvictionSelect.value;
    if (persistenceSelect) newSettings.persistence = persistenceSelect.value;
    if (maxConnectionsInput) newSettings.maxConnections = parseInt(maxConnectionsInput.value);
    if (timeoutInput) newSettings.timeout = parseInt(timeoutInput.value);
    
    useStore.setState({
      diagram: {
        ...newState.diagram,
        redisSettings: newSettings,
        showingRedisSettings: false
      }
    });
    
    updateDiagram();
  };
}

// ============================================================================
// In-Memory Cache Handlers
// ============================================================================

export function initInMemoryEditorHandlers(keyIndex, container, useStore, updateDiagram) {
  const state = useStore.getState();
  const tempKey = state.diagram.tempInMemoryData;
  
  if (!tempKey) return;
  
  // Save handler
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const freshState = useStore.getState();
      const freshTempData = freshState.diagram.tempInMemoryData;
      
      // Update actual key
      const keys = [...freshState.diagram.inMemoryKeys];
      keys[keyIndex] = { ...freshTempData };
      
      useStore.setState({
        diagram: {
          ...freshState.diagram,
          inMemoryKeys: keys
        }
      });
      
      // Clear content
      container.innerHTML = '';
      
      // Update state
      const newState = useStore.getState();
      useStore.setState({
        diagram: {
          ...newState.diagram,
          activeInMemoryTab: null,
          tempInMemoryData: { ...newState.diagram.inMemoryKeys[keyIndex] }
        }
      });
      
      updateDiagram();
    };
  }
  
  // TTL input handler
  const ttlInput = container.querySelector('.inmemory-ttl-input');
  if (ttlInput) {
    ttlInput.oninput = (e) => {
      tempKey.ttl = e.target.value ? parseInt(e.target.value) : null;
    };
  }
}

// ============================================================================
// In-Memory Global Settings Handlers
// ============================================================================

export function initInMemorySettingsHandlers(useStore, updateDiagram) {
  const saveBtn = document.querySelector('.inmemory-settings-save-btn');
  if (!saveBtn) return;
  
  saveBtn.onclick = () => {
    const state = useStore.getState();
    
    if (!state.diagram.inMemorySettings) {
      useStore.setState({
        diagram: {
          ...state.diagram,
          inMemorySettings: {}
        }
      });
    }
    
    const maxSizeInput = document.querySelector('.inmemory-max-size');
    const defaultTTLInput = document.querySelector('.inmemory-default-ttl');
    const evictionPolicySelect = document.querySelector('.inmemory-eviction-policy');
    
    const newState = useStore.getState();
    const newSettings = { ...newState.diagram.inMemorySettings };
    
    if (maxSizeInput) newSettings.maxSize = parseInt(maxSizeInput.value);
    if (defaultTTLInput) newSettings.defaultTTL = defaultTTLInput.value ? parseInt(defaultTTLInput.value) : null;
    if (evictionPolicySelect) newSettings.evictionPolicy = evictionPolicySelect.value;
    
    useStore.setState({
      diagram: {
        ...newState.diagram,
        inMemorySettings: newSettings,
        showingInMemorySettings: false
      }
    });
    
    updateDiagram();
  };
}

// ============================================================================
// Caffeine Cache Handlers
// ============================================================================

export function initCaffeineEditorHandlers(cacheIndex, tab, container, useStore, updateDiagram) {
  const state = useStore.getState();
  const tempCache = state.diagram.tempCaffeineData;
  
  if (!tempCache) return;
  
  // Common save handler for all tabs
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const freshState = useStore.getState();
      const freshTempData = freshState.diagram.tempCaffeineData;
      
      // Update actual cache
      const caches = [...freshState.diagram.caffeineCaches];
      caches[cacheIndex] = { ...freshTempData };
      
      useStore.setState({
        diagram: {
          ...freshState.diagram,
          caffeineCaches: caches
        }
      });
      
      // Clear tab content
      container.innerHTML = '';
      
      // Deactivate tabs
      document.querySelectorAll(`.caffeine-tab-btn[data-cache-index="${cacheIndex}"]`)
        .forEach(b => b.classList.remove('active'));
      
      // Update state
      const newState = useStore.getState();
      useStore.setState({
        diagram: {
          ...newState.diagram,
          activeCaffeineTab: null,
          tempCaffeineData: { ...newState.diagram.caffeineCaches[cacheIndex] }
        }
      });
      
      updateDiagram();
    };
  }
  
  // Tab-specific handlers
  switch(tab) {
    case 'settings':
      initCaffeineSettingsHandlers(tempCache, container);
      break;
    case 'advanced':
      initCaffeineAdvancedHandlers(tempCache, container);
      break;
  }
}

function initCaffeineSettingsHandlers(tempCache, container) {
  const maxSizeInput = container.querySelector('.caffeine-maxsize-input');
  if (maxSizeInput) {
    maxSizeInput.oninput = (e) => {
      tempCache.maxSize = e.target.value ? parseInt(e.target.value) : null;
    };
  }
  
  const expireWriteInput = container.querySelector('.caffeine-expire-write-input');
  if (expireWriteInput) {
    expireWriteInput.oninput = (e) => {
      tempCache.expireAfterWrite = e.target.value ? parseInt(e.target.value) : null;
    };
  }
  
  const expireAccessInput = container.querySelector('.caffeine-expire-access-input');
  if (expireAccessInput) {
    expireAccessInput.oninput = (e) => {
      tempCache.expireAfterAccess = e.target.value ? parseInt(e.target.value) : null;
    };
  }
  
  const refreshInput = container.querySelector('.caffeine-refresh-input');
  if (refreshInput) {
    refreshInput.oninput = (e) => {
      tempCache.refreshAfterWrite = e.target.value ? parseInt(e.target.value) : null;
    };
  }
}

function initCaffeineAdvancedHandlers(tempCache, container) {
  const weakKeysCheckbox = container.querySelector('.caffeine-weak-keys-checkbox');
  if (weakKeysCheckbox) {
    weakKeysCheckbox.onchange = (e) => {
      tempCache.weakKeys = e.target.checked;
    };
  }
  
  const weakValuesCheckbox = container.querySelector('.caffeine-weak-values-checkbox');
  if (weakValuesCheckbox) {
    weakValuesCheckbox.onchange = (e) => {
      tempCache.weakValues = e.target.checked;
    };
  }
  
  const recordStatsCheckbox = container.querySelector('.caffeine-record-stats-checkbox');
  if (recordStatsCheckbox) {
    recordStatsCheckbox.onchange = (e) => {
      tempCache.recordStats = e.target.checked;
    };
  }
}