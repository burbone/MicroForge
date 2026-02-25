// Cache widgets handlers - extracted from data-widgets.js
import {
  renderRedisTypeEditor,
  renderRedisTTLEditor,
  renderRedisSerializationEditor,
  renderRedisEvictionEditor,
  renderInMemoryTTLEditor,
  renderCaffeineSettingsEditor,
  renderCaffeineAdvancedEditor
} from './editors/cacheEditors.js';

import { EditorHandlerManager } from './editors/editorHandlers.js';
import { useStore } from '../store/store.js';

/**
 * Initialize all cache widget handlers
 */
export function initCacheHandlers(updateDiagram) {
  initRedisHandlers(updateDiagram);
  initInMemoryHandlers(updateDiagram);
  initCaffeineHandlers(updateDiagram);
}

// ============================================================================
// Redis Cache Handlers
// ============================================================================

function initRedisHandlers(updateDiagram) {
  // Add Redis Key button
  const addRedisKeyBtn = document.querySelector('.add-redis-key-btn');
  if (addRedisKeyBtn) {
    addRedisKeyBtn.onclick = () => {
      const state = useStore.getState();
      // Сбрасываем старые открытые editors
      useStore.setState({
        diagram: {
          ...state.diagram,
          editingKey: null,
          activeCacheTab: null,
          tempKeyData: null
        }
      });
      
      useStore.getState().addRedisKey();
      updateDiagram();
    };
  }
  
  // Redis pattern input
  document.querySelectorAll('.redis-key-pattern-input').forEach(input => {
    input.oninput = () => {
      const keyIndex = parseInt(input.dataset.keyIndex);
      const state = useStore.getState();
      // Обновляем только данные, БЕЗ перерисовки
      state.diagram.cacheKeys[keyIndex].pattern = input.value;
    };
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.target.blur();
        updateDiagram();
      }
    };
  });
  
  // Redis settings toggle button (⚙️)
  document.querySelectorAll('.redis-key-settings-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const keyIndex = parseInt(btn.dataset.keyIndex);
      const state = useStore.getState();
      const key = state.diagram.cacheKeys[keyIndex];
      
      if (state.diagram.tempKeyData !== null && state.diagram.editingKey?.keyIndex === keyIndex) {
        // Close editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            activeCacheTab: null,
            tempKeyData: null
          }
        });
      } else {
        // Open editor (show tab buttons only)
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingKey: { keyIndex },
            activeCacheTab: null,
            tempKeyData: { ...key }
          }
        });
      }
      
      updateDiagram();
    };
  });
  
  // Redis remove button
  document.querySelectorAll('.redis-key-remove-btn').forEach(btn => {
    btn.onclick = () => {
      const keyIndex = parseInt(btn.dataset.keyIndex);
      useStore.getState().removeRedisKey(keyIndex);
      updateDiagram();
    };
  });
  
  // Redis tab buttons
  document.querySelectorAll('.redis-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      const tab = btn.dataset.tab;
      const keyIndex = parseInt(btn.dataset.keyIndex);
      const state = useStore.getState();
      
      useStore.setState({
        diagram: {
          ...state.diagram,
          activeCacheTab: tab
        }
      });
      
      // Update tab active state
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      btn.classList.add('active');
      
      // Сначала обновляем DOM
      updateDiagram();
      
      // Теперь container существует, рендерим в него
      setTimeout(() => {
        const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
        if (container) {
          const key = state.diagram.cacheKeys[keyIndex];
          renderRedisTab(tab, container, key, keyIndex);
        }
      }, 0);
    };
  });
  
  // Redis settings button (global settings)
  const redisSettingsBtn = document.querySelector('.redis-settings-toggle-btn');
  if (redisSettingsBtn) {
    redisSettingsBtn.onclick = () => {
      const state = useStore.getState();
      useStore.setState({
        diagram: {
          ...state.diagram,
          showingRedisSettings: true
        }
      });
      updateDiagram();
    };
  }
  
  // Redis settings close button
  const redisSettingsCloseBtn = document.querySelector('.redis-settings-close-btn');
  if (redisSettingsCloseBtn) {
    redisSettingsCloseBtn.onclick = () => {
      const state = useStore.getState();
      useStore.setState({
        diagram: {
          ...state.diagram,
          showingRedisSettings: false
        }
      });
      updateDiagram();
    };
  }
  
  // Redis settings save button
  const redisSettingsSaveBtn = document.querySelector('.redis-settings-save-btn');
  if (redisSettingsSaveBtn) {
    redisSettingsSaveBtn.onclick = () => {
      const state = useStore.getState();
      const settings = state.diagram.redisSettings || {};
      
      const maxMemoryInput = document.querySelector('.redis-max-memory');
      const defaultTTLInput = document.querySelector('.redis-default-ttl');
      const globalEvictionSelect = document.querySelector('.redis-global-eviction');
      const persistenceSelect = document.querySelector('.redis-persistence');
      const maxConnectionsInput = document.querySelector('.redis-max-connections');
      const timeoutInput = document.querySelector('.redis-timeout');
      
      if (maxMemoryInput) settings.maxMemory = maxMemoryInput.value;
      if (defaultTTLInput) settings.defaultTTL = parseInt(defaultTTLInput.value);
      if (globalEvictionSelect) settings.eviction = globalEvictionSelect.value;
      if (persistenceSelect) settings.persistence = persistenceSelect.value;
      if (maxConnectionsInput) settings.maxConnections = parseInt(maxConnectionsInput.value);
      if (timeoutInput) settings.timeout = parseInt(timeoutInput.value);
      
      useStore.setState({
        diagram: {
          ...state.diagram,
          redisSettings: settings,
          showingRedisSettings: false
        }
      });
      
      updateDiagram();
    };
  }
}

/**
 * Render Redis tab content
 */
function renderRedisTab(tab, container, key, keyIndex) {
  switch(tab) {
    case 'type':
      container.innerHTML = renderRedisTypeEditor(key);
      initRedisTypeEditorHandlers(keyIndex);
      break;
    case 'ttl':
      container.innerHTML = renderRedisTTLEditor(key);
      initRedisTTLEditorHandlers(keyIndex);
      break;
    case 'serialization':
      container.innerHTML = renderRedisSerializationEditor(key);
      initRedisSerializationEditorHandlers(keyIndex);
      break;
    case 'eviction':
      container.innerHTML = renderRedisEvictionEditor(key);
      initRedisEvictionEditorHandlers(keyIndex);
      break;
  }
}

/**
 * Redis editor handlers
 */
function initRedisTypeEditorHandlers(keyIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных для этого таба
  let localData = { ...state.diagram.cacheKeys[keyIndex] };
  
  // При изменении Type сразу перерендериваем editor
  const typeSelect = container.querySelector('.redis-type-select');
  if (typeSelect) {
    typeSelect.onchange = () => {
      localData.type = typeSelect.value;
      
      // Перерендериваем editor с новым типом
      container.innerHTML = renderRedisTypeEditor(localData);
      
      // Переинициализируем handlers (с теми же localData!)
      initRedisTypeEditorHandlersWithData(keyIndex, localData);
    };
  }
  
  // Hash fields
  const hashFieldsTextarea = container.querySelector('.redis-hash-fields');
  if (hashFieldsTextarea) {
    hashFieldsTextarea.oninput = () => {
      localData.hashFields = hashFieldsTextarea.value.split(',').map(f => f.trim()).filter(Boolean);
    };
  }
  
  // Score field
  const scoreFieldInput = container.querySelector('.redis-score-field');
  if (scoreFieldInput) {
    scoreFieldInput.oninput = () => {
      localData.scoreField = scoreFieldInput.value;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем localData в реальные данные
      state.diagram.cacheKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную (как в старом коде)
      const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state
      state.diagram.activeCacheTab = null;
      state.diagram.tempKeyData = { ...state.diagram.cacheKeys[keyIndex] };
    };
  }
}

// Helper для реинициализации с существующими данными
function initRedisTypeEditorHandlersWithData(keyIndex, localData) {
  const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // При изменении Type сразу перерендериваем editor
  const typeSelect = container.querySelector('.redis-type-select');
  if (typeSelect) {
    typeSelect.onchange = () => {
      localData.type = typeSelect.value;
      
      // Перерендериваем editor с новым типом
      container.innerHTML = renderRedisTypeEditor(localData);
      
      // Переинициализируем handlers (рекурсивно)
      initRedisTypeEditorHandlersWithData(keyIndex, localData);
    };
  }
  
  // Hash fields
  const hashFieldsTextarea = container.querySelector('.redis-hash-fields');
  if (hashFieldsTextarea) {
    hashFieldsTextarea.oninput = () => {
      localData.hashFields = hashFieldsTextarea.value.split(',').map(f => f.trim()).filter(Boolean);
    };
  }
  
  // Score field
  const scoreFieldInput = container.querySelector('.redis-score-field');
  if (scoreFieldInput) {
    scoreFieldInput.oninput = () => {
      localData.scoreField = scoreFieldInput.value;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем localData в реальные данные
      state.diagram.cacheKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state
      state.diagram.activeCacheTab = null;
      state.diagram.tempKeyData = { ...state.diagram.cacheKeys[keyIndex] };
    };
  }
}

function initRedisTTLEditorHandlers(keyIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных для этого таба
  let localData = { ...state.diagram.cacheKeys[keyIndex] };
  
  // TTL input
  const ttlInput = container.querySelector('.redis-ttl-input');
  if (ttlInput) {
    ttlInput.oninput = () => {
      localData.ttl = ttlInput.value ? parseInt(ttlInput.value) : null;
    };
  }
  
  // Expire strategy select
  const strategySelect = container.querySelector('.redis-expire-strategy-select');
  if (strategySelect) {
    strategySelect.onchange = () => {
      localData.expireStrategy = strategySelect.value;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем localData в реальные данные
      state.diagram.cacheKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state
      state.diagram.activeCacheTab = null;
      state.diagram.tempKeyData = { ...state.diagram.cacheKeys[keyIndex] };
    };
  }
}

function initRedisSerializationEditorHandlers(keyIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных для этого таба
  let localData = { ...state.diagram.cacheKeys[keyIndex] };
  
  // Serialization select
  const serializationSelect = container.querySelector('.redis-serialization-select');
  if (serializationSelect) {
    serializationSelect.onchange = () => {
      localData.serialization = serializationSelect.value;
    };
  }
  
  // Compression select
  const compressionSelect = container.querySelector('.redis-compression-select');
  if (compressionSelect) {
    compressionSelect.onchange = () => {
      localData.compression = compressionSelect.value;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем localData в реальные данные
      state.diagram.cacheKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state
      state.diagram.activeCacheTab = null;
      state.diagram.tempKeyData = { ...state.diagram.cacheKeys[keyIndex] };
    };
  }
}

function initRedisEvictionEditorHandlers(keyIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных для этого таба
  let localData = { ...state.diagram.cacheKeys[keyIndex] };
  
  // Eviction select
  const evictionSelect = container.querySelector('.redis-eviction-select');
  if (evictionSelect) {
    evictionSelect.onchange = () => {
      localData.eviction = evictionSelect.value;
    };
  }
  
  // Max memory input
  const maxMemoryInput = container.querySelector('.redis-max-memory-input');
  if (maxMemoryInput) {
    maxMemoryInput.oninput = () => {
      localData.maxMemory = maxMemoryInput.value;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем localData в реальные данные
      state.diagram.cacheKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.redis-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(`.redis-tab-btn[data-key-index="${keyIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state
      state.diagram.activeCacheTab = null;
      state.diagram.tempKeyData = { ...state.diagram.cacheKeys[keyIndex] };
    };
  }
}

// ============================================================================
// In-Memory Cache Handlers
// ============================================================================

function initInMemoryHandlers(updateDiagram) {
  // Add In-Memory Key button
  const addInMemoryKeyBtn = document.querySelector('.add-inmemory-key-btn');
  if (addInMemoryKeyBtn) {
    addInMemoryKeyBtn.onclick = () => {
      const state = useStore.getState();
      // Сбрасываем старые открытые editors
      useStore.setState({
        diagram: {
          ...state.diagram,
          editingInMemoryKey: null,
          activeInMemoryTab: null,
          tempInMemoryData: null
        }
      });
      
      useStore.getState().addInMemoryKey();
      updateDiagram();
    };
  }
  
  // In-Memory name input
  document.querySelectorAll('.inmemory-key-name-input').forEach(input => {
    input.oninput = () => {
      const keyIndex = parseInt(input.dataset.keyIndex);
      const state = useStore.getState();
      // Обновляем только данные, БЕЗ перерисовки
      state.diagram.inMemoryKeys[keyIndex].name = input.value;
    };
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.target.blur();
        updateDiagram();
      }
    };
  });
  
  // In-Memory settings toggle button (⚙️)
  document.querySelectorAll('.inmemory-key-settings-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const keyIndex = parseInt(btn.dataset.keyIndex);
      const state = useStore.getState();
      const isCurrentlyEditing = state.diagram.editingInMemoryKey?.keyIndex === keyIndex;
      
      if (isCurrentlyEditing) {
        // Close editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingInMemoryKey: null,
            activeInMemoryTab: null
          }
        });
      } else {
        // Open editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingInMemoryKey: { keyIndex },
            activeInMemoryTab: 'ttl'
          }
        });
        
        updateDiagram();
        
        // Initialize TTL editor
        setTimeout(() => {
          const container = document.querySelector(`.inmemory-editor-content[data-key-index="${keyIndex}"]`);
          if (container) {
            const key = useStore.getState().diagram.inMemoryKeys[keyIndex];
            container.innerHTML = renderInMemoryTTLEditor(key);
            initInMemoryTTLEditorHandlers(keyIndex);
          }
        }, 0);
        return;
      }
      
      updateDiagram();
    };
  });
  
  // In-Memory remove button
  document.querySelectorAll('.inmemory-key-remove-btn').forEach(btn => {
    btn.onclick = () => {
      const keyIndex = parseInt(btn.dataset.keyIndex);
      useStore.getState().removeInMemoryKey(keyIndex);
      updateDiagram();
    };
  });
  
  // In-Memory settings button (global settings)
  const inMemorySettingsBtn = document.querySelector('.inmemory-settings-toggle-btn');
  if (inMemorySettingsBtn) {
    inMemorySettingsBtn.onclick = () => {
      const state = useStore.getState();
      useStore.setState({
        diagram: {
          ...state.diagram,
          showingInMemorySettings: true
        }
      });
      updateDiagram();
    };
  }
  
  // In-Memory settings close button
  const inMemorySettingsCloseBtn = document.querySelector('.inmemory-settings-close-btn');
  if (inMemorySettingsCloseBtn) {
    inMemorySettingsCloseBtn.onclick = () => {
      const state = useStore.getState();
      useStore.setState({
        diagram: {
          ...state.diagram,
          showingInMemorySettings: false
        }
      });
      updateDiagram();
    };
  }
  
  // In-Memory settings save button
  const inMemorySettingsSaveBtn = document.querySelector('.inmemory-settings-save-btn');
  if (inMemorySettingsSaveBtn) {
    inMemorySettingsSaveBtn.onclick = () => {
      const state = useStore.getState();
      const settings = state.diagram.inMemorySettings || {};
      
      const maxSizeInput = document.querySelector('.inmemory-max-size');
      const defaultTTLInput = document.querySelector('.inmemory-default-ttl');
      const evictionPolicySelect = document.querySelector('.inmemory-eviction-policy');
      
      if (maxSizeInput) settings.maxSize = parseInt(maxSizeInput.value);
      if (defaultTTLInput) settings.defaultTTL = defaultTTLInput.value ? parseInt(defaultTTLInput.value) : null;
      if (evictionPolicySelect) settings.evictionPolicy = evictionPolicySelect.value;
      
      useStore.setState({
        diagram: {
          ...state.diagram,
          inMemorySettings: settings,
          showingInMemorySettings: false
        }
      });
      
      updateDiagram();
    };
  }
}

/**
 * In-Memory TTL editor handlers
 */
function initInMemoryTTLEditorHandlers(keyIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.inmemory-editor-content[data-key-index="${keyIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных
  let localData = { ...state.diagram.inMemoryKeys[keyIndex] };
  
  // TTL input
  const ttlInput = container.querySelector('.inmemory-ttl-input');
  if (ttlInput) {
    ttlInput.oninput = () => {
      localData.ttl = ttlInput.value ? parseInt(ttlInput.value) : null;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      const keyIndex = state.diagram.editingInMemoryKey.keyIndex;
      
      // Копируем localData в реальные данные
      state.diagram.inMemoryKeys[keyIndex] = { ...localData };
      
      // Очищаем контент вручную (как Redis)
      const container = document.querySelector(`.inmemory-editor-content[data-key-index="${keyIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с кнопки ⚙️
      const settingsBtn = document.querySelector(`.inmemory-key-settings-toggle-btn[data-key-index="${keyIndex}"]`);
      if (settingsBtn) {
        settingsBtn.classList.remove('active');
      }
      
      // Закрываем полностью
      state.diagram.editingInMemoryKey = null;
      state.diagram.activeInMemoryTab = null;
    };
  }
}

// ============================================================================
// Caffeine Cache Handlers
// ============================================================================

function initCaffeineHandlers(updateDiagram) {
  // Add Caffeine Cache button
  const addCaffeineCacheBtn = document.querySelector('.add-caffeine-cache-btn');
  if (addCaffeineCacheBtn) {
    addCaffeineCacheBtn.onclick = () => {
      const state = useStore.getState();
      // Сбрасываем старые открытые editors
      useStore.setState({
        diagram: {
          ...state.diagram,
          editingCaffeineCache: null,
          activeCaffeineTab: null,
          tempCaffeineData: null,
          caffeineSelectedType: null
        }
      });
      
      useStore.getState().addCaffeineCache();
      updateDiagram();
    };
  }
  
  // Caffeine name input
  document.querySelectorAll('.caffeine-cache-name-input').forEach(input => {
    input.oninput = () => {
      const cacheIndex = parseInt(input.dataset.cacheIndex);
      const state = useStore.getState();
      // Обновляем только данные, БЕЗ перерисовки
      state.diagram.caffeineCaches[cacheIndex].name = input.value;
    };
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.target.blur();
        updateDiagram();
      }
    };
  });
  
  // Caffeine settings toggle button (⚙️)
  document.querySelectorAll('.caffeine-cache-settings-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cacheIndex = parseInt(btn.dataset.cacheIndex);
      const state = useStore.getState();
      const cache = state.diagram.caffeineCaches[cacheIndex];
      
      if (state.diagram.activeCaffeineTab !== null && state.diagram.editingCaffeineCache?.cacheIndex === cacheIndex) {
        // Close editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            activeCaffeineTab: null,
            caffeineSelectedType: null
          }
        });
      } else {
        // Open editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingCaffeineCache: { cacheIndex },
            activeCaffeineTab: 'selector',
            caffeineSelectedType: null,
            tempCaffeineData: { ...cache }
          }
        });
        
        updateDiagram();
        
        // Initialize type selector - используем setTimeout чтобы DOM обновился
        setTimeout(() => {
          const container = document.querySelector(`.caffeine-editor-content[data-cache-index="${cacheIndex}"]`);
          if (container) {
            container.innerHTML = renderCaffeineTypesSelector(cacheIndex);
            initCaffeineTypeSelectorHandlers(cacheIndex);
          }
        }, 0);
        return; // Выходим, чтобы не вызывать updateDiagram дважды
      }
      
      updateDiagram();
    };
  });
  
  // Caffeine remove button
  document.querySelectorAll('.caffeine-cache-remove-btn').forEach(btn => {
    btn.onclick = () => {
      const cacheIndex = parseInt(btn.dataset.cacheIndex);
      useStore.getState().removeCaffeineCache(cacheIndex);
      updateDiagram();
    };
  });
  
  // Caffeine delete button (inside editing)
  document.querySelectorAll('.caffeine-cache-delete-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cacheIndex = parseInt(btn.dataset.cacheIndex);
      useStore.getState().removeCaffeineCache(cacheIndex);
      useStore.setState({
        diagram: {
          ...useStore.getState().diagram,
          editingCaffeineCache: null,
          activeCaffeineTab: null
        }
      });
      updateDiagram();
    };
  });
}

/**
 * Caffeine type selector handlers
 */
function initCaffeineTypeSelectorHandlers(cacheIndex) {
  const state = useStore.getState();
  
  // Type buttons - показывают редактор для выбранного типа
  document.querySelectorAll('.field-tab-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      
      useStore.setState({
        diagram: {
          ...state.diagram,
          caffeineSelectedType: type
        }
      });
      
      const container = document.querySelector(`.caffeine-type-content[data-cache-index="${cacheIndex}"]`);
      if (container) {
        // Render editor for selected type
        if (type === 'settings') {
          container.innerHTML = renderCaffeineSettingsEditor(state.diagram.tempCaffeineData);
          initCaffeineSettingsEditorHandlers(cacheIndex);
        } else if (type === 'advanced') {
          container.innerHTML = renderCaffeineAdvancedEditor(state.diagram.tempCaffeineData);
          initCaffeineAdvancedEditorHandlers(cacheIndex);
        }
        
        // Update active tab
        document.querySelectorAll('.field-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    };
  });
}

/**
 * Render Caffeine type selector
 */
function renderCaffeineTypesSelector(cacheIndex) {
  return `
    <div class="field-editor-tabs">
      <button class="field-tab-btn" data-type="settings" data-cache-index="${cacheIndex}">Settings</button>
      <button class="field-tab-btn" data-type="advanced" data-cache-index="${cacheIndex}">Advanced</button>
    </div>
    <div class="caffeine-type-content" data-cache-index="${cacheIndex}"></div>
  `;
}

/**
 * Initialize Caffeine settings editor handlers
 */
function initCaffeineSettingsEditorHandlers(cacheIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.caffeine-type-content[data-cache-index="${cacheIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных
  let localData = { ...state.diagram.caffeineCaches[cacheIndex] };
  
  // MaxSize input
  const maxSizeInput = container.querySelector('.caffeine-maxsize-input');
  if (maxSizeInput) {
    maxSizeInput.oninput = () => {
      localData.maxSize = maxSizeInput.value ? parseInt(maxSizeInput.value) : null;
    };
  }
  
  // Expire after write input
  const expireWriteInput = container.querySelector('.caffeine-expire-write-input');
  if (expireWriteInput) {
    expireWriteInput.oninput = () => {
      localData.expireAfterWrite = expireWriteInput.value ? parseInt(expireWriteInput.value) : null;
    };
  }
  
  // Expire after access input
  const expireAccessInput = container.querySelector('.caffeine-expire-access-input');
  if (expireAccessInput) {
    expireAccessInput.oninput = () => {
      localData.expireAfterAccess = expireAccessInput.value ? parseInt(expireAccessInput.value) : null;
    };
  }
  
  // Refresh after write input
  const refreshInput = container.querySelector('.caffeine-refresh-input');
  if (refreshInput) {
    refreshInput.oninput = () => {
      localData.refreshAfterWrite = refreshInput.value ? parseInt(refreshInput.value) : null;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      const cacheIndex = state.diagram.editingCaffeineCache.cacheIndex;
      
      // Копируем localData в реальные данные
      state.diagram.caffeineCaches[cacheIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.caffeine-type-content[data-cache-index="${cacheIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с кнопок selector
      document.querySelectorAll(`.field-tab-btn[data-cache-index="${cacheIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state - закрываем только контент, selector остается
      state.diagram.caffeineSelectedType = null;
    };
  }
}

/**
 * Initialize Caffeine advanced editor handlers
 */
function initCaffeineAdvancedEditorHandlers(cacheIndex) {
  const state = useStore.getState();
  const container = document.querySelector(`.caffeine-type-content[data-cache-index="${cacheIndex}"]`);
  if (!container) return;
  
  // Создаем ЛОКАЛЬНУЮ копию данных
  let localData = { ...state.diagram.caffeineCaches[cacheIndex] };
  
  // Weak keys checkbox
  const weakKeysCheckbox = container.querySelector('.caffeine-weak-keys-checkbox');
  if (weakKeysCheckbox) {
    weakKeysCheckbox.onchange = () => {
      localData.weakKeys = weakKeysCheckbox.checked;
    };
  }
  
  // Weak values checkbox
  const weakValuesCheckbox = container.querySelector('.caffeine-weak-values-checkbox');
  if (weakValuesCheckbox) {
    weakValuesCheckbox.onchange = () => {
      localData.weakValues = weakValuesCheckbox.checked;
    };
  }
  
  // Record stats checkbox
  const recordStatsCheckbox = container.querySelector('.caffeine-record-stats-checkbox');
  if (recordStatsCheckbox) {
    recordStatsCheckbox.onchange = () => {
      localData.recordStats = recordStatsCheckbox.checked;
    };
  }
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      const cacheIndex = state.diagram.editingCaffeineCache.cacheIndex;
      
      // Копируем localData в реальные данные
      state.diagram.caffeineCaches[cacheIndex] = { ...localData };
      
      // Очищаем контент вручную
      const container = document.querySelector(`.caffeine-type-content[data-cache-index="${cacheIndex}"]`);
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с кнопок selector
      document.querySelectorAll(`.field-tab-btn[data-cache-index="${cacheIndex}"]`).forEach(b => 
        b.classList.remove('active')
      );
      
      // Обновляем state - закрываем только контент, selector остается
      state.diagram.caffeineSelectedType = null;
    };
  }
}