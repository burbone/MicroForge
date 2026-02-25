// Feature handlers for column selectors
// This file should be imported and called in RightPanel after diagram renders

import { useStore } from '../store/store.js';

export function initFeatureHandlers(updateDiagram) {
  const state = useStore.getState();
  
  // Expand/collapse column selectors - для обычных фич (child)
  document.querySelectorAll('.hierarchical-child-header-row.clickable').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const featureId = header.dataset.childId;
      const container = document.querySelector(`.hierarchical-columns-container[data-feature-id="${featureId}"]`);
      const icon = header.querySelector('.hierarchical-child-expand-icon');
      
      if (container && icon) {
        const isVisible = container.style.display !== 'none';
        container.style.display = isVisible ? 'none' : 'block';
        icon.textContent = isVisible ? '▼' : '▲';
      }
    });
    
    // Add hover effect
    header.style.cursor = 'pointer';
  });
  
  // Expand/collapse column selectors - для фич-родителей (parent-child, например RBAC)
  document.querySelectorAll('.hierarchical-parent-child-header.clickable').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const featureId = header.dataset.childId;
      const container = document.querySelector(`.hierarchical-columns-container[data-feature-id="${featureId}"]`);
      const icon = header.querySelector('.hierarchical-child-expand-icon');
      
      if (container && icon) {
        const isVisible = container.style.display !== 'none';
        container.style.display = isVisible ? 'none' : 'block';
        icon.textContent = isVisible ? '▼' : '▲';
      }
    });
    
    // Add hover effect
    header.style.cursor = 'pointer';
  });
  
  // Add optional column
  document.querySelectorAll('.hierarchical-add-column-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const featureId = btn.dataset.featureId;
      const type = btn.dataset.type; // 'database' or 'cache'
      const container = btn.closest('.hierarchical-optional-columns');
      const maxColumns = parseInt(container.dataset.max);
      const currentOptional = container.querySelectorAll(`.hierarchical-column-row[data-required="false"][data-type="${type}"]`).length;
      
      if (currentOptional < maxColumns) {
        const columnRow = document.createElement('div');
        columnRow.className = 'hierarchical-column-row';
        columnRow.dataset.required = 'false';
        columnRow.dataset.type = type;
        columnRow.innerHTML = `
          <select class="hierarchical-column-select" data-feature-id="${featureId}" data-type="${type}">
            <option value="">Select ${type === 'database' ? 'column' : 'key'}...</option>
          </select>
          <span class="hierarchical-column-badge optional">O</span>
          <button class="hierarchical-remove-column-btn">×</button>
        `;
        
        container.insertBefore(columnRow, btn);
        
        // Add remove handler
        const removeBtn = columnRow.querySelector('.hierarchical-remove-column-btn');
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          columnRow.remove();
          
          // Save after removal
          if (type === 'database') {
            saveColumnSelectionsToStore(featureId);
          } else if (type === 'cache') {
            saveCacheSelectionsToStore(featureId);
          }
          
          // Show add button again if we're under the limit
          const newCount = container.querySelectorAll(`.hierarchical-column-row[data-required="false"][data-type="${type}"]`).length;
          if (newCount < maxColumns) {
            btn.style.display = 'block';
          }
        });
        
        // Populate dropdown based on type
        const select = columnRow.querySelector('select');
        if (type === 'database') {
          populateColumnDropdown(select);
        } else if (type === 'cache') {
          populateCacheDropdown(select);
        }
        
        // Add change listener to new select
        select.addEventListener('change', () => {
          if (type === 'database') {
            saveColumnSelectionsToStore(featureId);
          } else if (type === 'cache') {
            saveCacheSelectionsToStore(featureId);
          }
          hideSelectedOptionsInFeature(featureId);
        });
        
        // Hide already selected options in this new select
        hideSelectedOptionsInFeature(featureId);
        
        // Hide add button if we reached the limit
        const newCount = currentOptional + 1;
        if (newCount >= maxColumns) {
          btn.style.display = 'none';
        }
      }
    });
  });
  
  // Populate all column dropdowns initially
  // Required селекты уже в DOM (созданы renderRequiredColumns) — просто заполняем опции
  document.querySelectorAll('.hierarchical-column-row[data-required="true"] .hierarchical-column-select').forEach(select => {
    const type = select.dataset.type;
    if (type === 'database') {
      populateColumnDropdown(select);
    } else if (type === 'cache') {
      populateCacheDropdown(select);
    }
  });

  // Восстанавливаем optional строки из store + заполняем required
  const mappings = state.diagram.featureColumnMappings || {};
  
  // Собираем уникальные featureId
  const allFeatureIds = new Set(
    Array.from(document.querySelectorAll('.hierarchical-column-select'))
      .map(s => s.dataset.featureId)
  );

  allFeatureIds.forEach(featureId => {
    const featureMappings = mappings[featureId] || {};

    // --- Восстановление database required ---
    const savedRequiredDb = featureMappings.__required_db__ || [];
    const savedOptionalDb = featureMappings.__optional_db__ || [];

    const requiredSelects = document.querySelectorAll(
      `.hierarchical-column-row[data-required="true"] .hierarchical-column-select[data-feature-id="${featureId}"][data-type="database"]`
    );
    requiredSelects.forEach((select, idx) => {
      if (savedRequiredDb[idx]) {
        select.value = savedRequiredDb[idx];
      }
    });

    // --- Восстановление database optional ---
    if (savedOptionalDb.length > 0) {
      const optionalContainer = document.querySelector(
        `.hierarchical-optional-columns[data-feature-id="${featureId}"]`
      );
      if (optionalContainer) {
        const addBtn = optionalContainer.querySelector('.hierarchical-add-column-btn');
        const maxColumns = parseInt(optionalContainer.dataset.max || '0');

        savedOptionalDb.forEach((savedValue, i) => {
          if (i >= maxColumns) return;

          // Создаём строку
          const columnRow = document.createElement('div');
          columnRow.className = 'hierarchical-column-row';
          columnRow.dataset.required = 'false';
          columnRow.dataset.type = 'database';
          columnRow.innerHTML = `
            <select class="hierarchical-column-select" data-feature-id="${featureId}" data-type="database">
              <option value="">Select column...</option>
            </select>
            <span class="hierarchical-column-badge optional">O</span>
            <button class="hierarchical-remove-column-btn">×</button>
          `;

          optionalContainer.insertBefore(columnRow, addBtn);

          const select = columnRow.querySelector('select');
          populateColumnDropdown(select);
          select.value = savedValue;

          // change + remove listeners
          select.addEventListener('change', () => {
            saveColumnSelectionsToStore(featureId);
            hideSelectedOptionsInFeature(featureId);
          });

          const removeBtn = columnRow.querySelector('.hierarchical-remove-column-btn');
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            columnRow.remove();
            saveColumnSelectionsToStore(featureId);
            const newCount = optionalContainer.querySelectorAll('.hierarchical-column-row[data-required="false"]').length;
            if (newCount < maxColumns) addBtn.style.display = 'block';
          });
        });

        // Скрываем кнопку если достигли лимита
        const currentCount = optionalContainer.querySelectorAll('.hierarchical-column-row[data-required="false"]').length;
        if (currentCount >= maxColumns && addBtn) {
          addBtn.style.display = 'none';
        }
      }
    }

    // --- Восстановление cache ---
    const savedKeys = featureMappings.__cache__ || [];
    if (savedKeys.length > 0) {
      const cacheContainer = document.querySelector(
        `.hierarchical-optional-columns[data-feature-id="${featureId}"][data-type="cache"]`
      );
      if (cacheContainer) {
        const addBtn = cacheContainer.querySelector('.hierarchical-add-column-btn');
        const maxColumns = parseInt(cacheContainer.dataset.max || '0');

        savedKeys.forEach((savedValue, i) => {
          if (i >= maxColumns) return;

          const columnRow = document.createElement('div');
          columnRow.className = 'hierarchical-column-row';
          columnRow.dataset.required = 'false';
          columnRow.dataset.type = 'cache';
          columnRow.innerHTML = `
            <select class="hierarchical-column-select" data-feature-id="${featureId}" data-type="cache">
              <option value="">Select key...</option>
            </select>
            <span class="hierarchical-column-badge optional">O</span>
            <button class="hierarchical-remove-column-btn">×</button>
          `;

          cacheContainer.insertBefore(columnRow, addBtn);

          const select = columnRow.querySelector('select');
          populateCacheDropdown(select);
          select.value = savedValue;

          select.addEventListener('change', () => {
            saveCacheSelectionsToStore(featureId);
            hideSelectedOptionsInFeature(featureId);
          });

          const removeBtn = columnRow.querySelector('.hierarchical-remove-column-btn');
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            columnRow.remove();
            saveCacheSelectionsToStore(featureId);
            const newCount = cacheContainer.querySelectorAll('.hierarchical-column-row[data-required="false"]').length;
            if (newCount < maxColumns) addBtn.style.display = 'block';
          });
        });

        const currentCount = cacheContainer.querySelectorAll('.hierarchical-column-row[data-required="false"]').length;
        if (currentCount >= maxColumns && addBtn) {
          addBtn.style.display = 'none';
        }
      }
    }
  });

  // Скрываем дубликаты после полного восстановления
  allFeatureIds.forEach(fId => hideSelectedOptionsInFeature(fId));
  
  // Add change listeners to all selects - save to store + hide duplicates
  document.querySelectorAll('.hierarchical-column-select').forEach(select => {
    select.addEventListener('change', () => {
      const featureId = select.dataset.featureId;
      const type = select.dataset.type;

      // Save all selected columns for this feature to store
      if (type === 'database') {
        saveColumnSelectionsToStore(featureId);
      } else if (type === 'cache') {
        saveCacheSelectionsToStore(featureId);
      }

      hideSelectedOptionsInFeature(featureId);
    });
  });

  
  console.log('Feature handlers initialized');
}

/**
 * Hide already selected options in all selects of the same feature
 */
function hideSelectedOptionsInFeature(featureId) {
  // Get all selects for this feature
  const selects = document.querySelectorAll(`.hierarchical-column-select[data-feature-id="${featureId}"]`);
  
  // Collect all selected values
  const selectedValues = new Set();
  selects.forEach(select => {
    if (select.value) {
      selectedValues.add(select.value);
    }
  });
  
  // Update each select to hide selected options (except its own value)
  selects.forEach(select => {
    const currentValue = select.value;
    
    Array.from(select.options).forEach(option => {
      if (option.value === '') {
        // Always show empty option
        option.style.display = '';
      } else if (option.value === currentValue) {
        // Always show current value
        option.style.display = '';
      } else if (selectedValues.has(option.value)) {
        // Hide if selected in another select
        option.style.display = 'none';
      } else {
        // Show if not selected anywhere
        option.style.display = '';
      }
    });
  });
}


function populateColumnDropdown(select) {
  // Всегда берём свежий state
  const freshState = useStore.getState();
  const columns = getAvailableDatabaseColumns(freshState);
  
  const currentValue = select.value;
  select.innerHTML = '<option value="">Select column...</option>';
  
  columns.forEach(col => {
    const option = document.createElement('option');
    option.value = `${col.table}.${col.name}`;
    option.textContent = `${col.table}.${col.name} (${col.type})`;
    select.appendChild(option);
  });

  // Восстанавливаем текущее значение если оно было
  if (currentValue) select.value = currentValue;
}

function populateCacheDropdown(select) {
  // Всегда берём свежий state
  const freshState = useStore.getState();
  const keys = getAvailableCacheKeys(freshState);
  
  const currentValue = select.value;
  select.innerHTML = '<option value="">Select key...</option>';
  
  keys.forEach(key => {
    const option = document.createElement('option');
    option.value = key.pattern;
    option.textContent = `${key.pattern} (${key.type})`;
    select.appendChild(option);
  });

  if (currentValue) select.value = currentValue;
}

function getAvailableDatabaseColumns(state) {
  const columns = [];
  
  if (state.diagram && state.diagram.tables && state.diagram.tables.length > 0) {
    state.diagram.tables.forEach(table => {
      if (table.name && table.fields && table.fields.length > 0) {
        table.fields.forEach(field => {
          if (field.name) {
            columns.push({
              table: table.name,
              name: field.name,
              type: field.type || 'VARCHAR'
            });
          }
        });
      }
    });
  }
  
  return columns;
}

function getAvailableCacheKeys(state) {
  const keys = [];
  
  // Get keys from Redis
  if (state.diagram && state.diagram.cacheKeys && state.diagram.cacheKeys.length > 0) {
    state.diagram.cacheKeys.forEach(key => {
      if (key.pattern) {
        keys.push({
          pattern: key.pattern,
          type: key.type || 'STRING'
        });
      }
    });
  }
  
  // Get keys from InMemory
  if (state.diagram && state.diagram.inMemoryKeys && state.diagram.inMemoryKeys.length > 0) {
    state.diagram.inMemoryKeys.forEach(key => {
      if (key.name) {
        keys.push({
          pattern: key.name,
          type: 'InMemory'
        });
      }
    });
  }
  
  // Get keys from Caffeine
  if (state.diagram && state.diagram.caffeineCaches && state.diagram.caffeineCaches.length > 0) {
    state.diagram.caffeineCaches.forEach(cache => {
      if (cache.name) {
        keys.push({
          pattern: cache.name,
          type: 'Caffeine'
        });
      }
    });
  }
  
  return keys;
}

/**
 * Сохраняет все выбранные database-колонки для фичи в store
 */
function saveColumnSelectionsToStore(featureId) {
  // Сохраняем required и optional раздельно
  // Optional — те что внутри .hierarchical-optional-columns с data-required="false"
  const optionalRows = document.querySelectorAll(
    `.hierarchical-optional-columns[data-feature-id="${featureId}"] .hierarchical-column-row[data-required="false"]`
  );
  const optionalSelectSet = new Set();
  optionalRows.forEach(row => {
    const sel = row.querySelector('.hierarchical-column-select');
    if (sel) optionalSelectSet.add(sel);
  });

  const requiredRows = document.querySelectorAll(
    `.hierarchical-column-row[data-required="true"] .hierarchical-column-select[data-feature-id="${featureId}"][data-type="database"]`
  );

  const requiredValues = [];
  const optionalValues = [];

  requiredRows.forEach(select => {
    requiredValues.push(select.value || '');
  });

  optionalRows.forEach(row => {
    const sel = row.querySelector(`.hierarchical-column-select[data-type="database"]`);
    if (sel && sel.value) optionalValues.push(sel.value);
  });

  const state = useStore.getState();
  const currentMappings = state.diagram.featureColumnMappings || {};

  useStore.setState({
    diagram: {
      ...state.diagram,
      featureColumnMappings: {
        ...currentMappings,
        [featureId]: {
          ...(currentMappings[featureId] || {}),
          __required_db__: requiredValues,
          __optional_db__: optionalValues,
        }
      }
    }
  });
}

/**
 * Сохраняет все выбранные cache-ключи для фичи в store
 */
function saveCacheSelectionsToStore(featureId) {
  const selects = document.querySelectorAll(`.hierarchical-column-select[data-feature-id="${featureId}"][data-type="cache"]`);

  const keys = [];
  selects.forEach(select => {
    if (select.value) keys.push(select.value);
  });

  const state = useStore.getState();
  const currentMappings = state.diagram.featureColumnMappings || {};

  useStore.setState({
    diagram: {
      ...state.diagram,
      featureColumnMappings: {
        ...currentMappings,
        [featureId]: {
          ...(currentMappings[featureId] || {}),
          __cache__: keys
        }
      }
    }
  });
}