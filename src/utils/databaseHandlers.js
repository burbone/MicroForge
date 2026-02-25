// Database widgets handlers - extracted from data-widgets.js
import { 
  renderTypeEditor,
  renderConstraintsEditor,
  renderForeignKeyEditor,
  renderValidationEditor,
  renderIndexEditor,
  renderAdditionalEditor,
  renderMongoTypeEditor,
  renderMongoValidationEditor,
  renderMongoIndexEditor,
  renderMongoReferenceEditor,
  renderMongoDefaultEditor
} from './editors/fieldEditors.js';

import { EditorHandlerManager } from './editors/editorHandlers.js';
import { useStore } from '../store/store.js';

/**
 * Initialize all database widget handlers
 */
export function initDatabaseHandlers(updateDiagram) {
  const state = useStore.getState();
  
  // Add Table button
  const addTableBtn = document.querySelector('.add-table-btn');
  if (addTableBtn) {
    addTableBtn.onclick = () => {
      useStore.getState().addTable();
      updateDiagram();
    };
  }
  
  // Remove Table buttons
  document.querySelectorAll('.table-remove-btn').forEach(btn => {
    btn.onclick = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      if (confirm('Delete this table?')) {
        useStore.getState().removeTable(tableIndex);
        updateDiagram();
      }
    };
  });
  
  // Table name inputs with auto-save
  document.querySelectorAll('.table-name-input').forEach(input => {
    let originalValue = input.value;
    
    input.onfocus = () => {
      originalValue = input.value;
    };
    
    input.oninput = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      const state = useStore.getState();
      state.diagram.tables[tableIndex].name = e.target.value;
    };
    
    input.onblur = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      useStore.getState().updateTableName(tableIndex, e.target.value);
      updateDiagram();
    };
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tableIndex = parseInt(e.target.dataset.tableIndex);
        useStore.getState().updateTableName(tableIndex, e.target.value);
        updateDiagram();
        e.target.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.target.value = originalValue;
        const tableIndex = parseInt(e.target.dataset.tableIndex);
        const state = useStore.getState();
        state.diagram.tables[tableIndex].name = originalValue;
        updateDiagram();
        e.target.blur();
      }
    };
  });
  
  // Add Field buttons
  document.querySelectorAll('.add-field-btn').forEach(btn => {
    btn.onclick = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      useStore.getState().addField(tableIndex);
      updateDiagram();
      
      // Focus on new field after render
      setTimeout(() => {
        const state = useStore.getState();
        const fieldCount = state.diagram.tables[tableIndex]?.fields?.length || 0;
        const fieldInput = document.querySelector(
          `.field-name-input[data-table-index="${tableIndex}"][data-field-index="${fieldCount - 1}"]`
        );
        if (fieldInput) fieldInput.focus();
      }, 0);
    };
  });
  
  // Remove Field buttons
  document.querySelectorAll('.field-remove-btn').forEach(btn => {
    btn.onclick = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      const fieldIndex = parseInt(e.target.dataset.fieldIndex);
      useStore.getState().removeField(tableIndex, fieldIndex);
      updateDiagram();
    };
  });
  
  // Field name inputs with auto-save
  document.querySelectorAll('.field-name-input').forEach(input => {
    let originalValue = input.value;
    
    input.onfocus = () => {
      originalValue = input.value;
    };
    
    input.oninput = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      const fieldIndex = parseInt(e.target.dataset.fieldIndex);
      const state = useStore.getState();
      state.diagram.tables[tableIndex].fields[fieldIndex].name = e.target.value;
      updateFieldPreview(tableIndex, fieldIndex);
    };
    
    input.onblur = (e) => {
      const tableIndex = parseInt(e.target.dataset.tableIndex);
      const fieldIndex = parseInt(e.target.dataset.fieldIndex);
      useStore.getState().updateFieldName(tableIndex, fieldIndex, e.target.value);
      updateDiagram();
    };
    
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tableIndex = parseInt(e.target.dataset.tableIndex);
        const fieldIndex = parseInt(e.target.dataset.fieldIndex);
        useStore.getState().updateFieldName(tableIndex, fieldIndex, e.target.value);
        updateDiagram();
        e.target.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.target.value = originalValue;
        const tableIndex = parseInt(e.target.dataset.tableIndex);
        const fieldIndex = parseInt(e.target.dataset.fieldIndex);
        const state = useStore.getState();
        state.diagram.tables[tableIndex].fields[fieldIndex].name = originalValue;
        updateDiagram();
        e.target.blur();
      }
    };
  });
  
  // Field settings button (⚙️) - opens editor with type tab
  document.querySelectorAll('.field-settings-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tableIndex = parseInt(btn.dataset.tableIndex);
      const fieldIndex = parseInt(btn.dataset.fieldIndex);
      const state = useStore.getState();
      const field = state.diagram.tables[tableIndex].fields[fieldIndex];
      
      // Set editing state
      useStore.setState({
        diagram: {
          ...state.diagram,
          editingField: { tableIndex, fieldIndex },
          activeTab: 'type',
          tempFieldData: { ...field }
        }
      });
      
      updateDiagram();
      
      // Initialize first tab content after render
      setTimeout(() => {
        const container = document.querySelector(
          `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
        );
        if (container) {
          const tempData = useStore.getState().diagram.tempFieldData;
          container.innerHTML = renderTypeEditor(tempData, state);
          initTypeEditorHandlers(tableIndex, fieldIndex);
        }
      }, 0);
    };
  });
  
  // Field settings toggle button (⚙️) - toggles editor visibility
  document.querySelectorAll('.field-settings-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tableIndex = parseInt(btn.dataset.tableIndex);
      const fieldIndex = parseInt(btn.dataset.fieldIndex);
      const state = useStore.getState();
      const field = state.diagram.tables[tableIndex].fields[fieldIndex];
      
      if (state.diagram.tempFieldData !== null) {
        // Close editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingField: null,
            activeTab: null,
            tempFieldData: null
          }
        });
      } else {
        // Open editor
        useStore.setState({
          diagram: {
            ...state.diagram,
            editingField: { tableIndex, fieldIndex },
            activeTab: null,
            tempFieldData: { ...field }
          }
        });
      }
      
      updateDiagram();
    };
  });
  
  // Field tab buttons
  document.querySelectorAll('.field-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      const tab = btn.dataset.tab;
      const tableIndex = parseInt(btn.dataset.tableIndex);
      const fieldIndex = parseInt(btn.dataset.fieldIndex);
      const state = useStore.getState();
      
      useStore.setState({
        diagram: {
          ...state.diagram,
          activeTab: tab
        }
      });
      
      // Update tab active state
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Сначала обновляем DOM
      updateDiagram();
      
      // Теперь container существует, рендерим в него
      setTimeout(() => {
        const container = document.querySelector(
          `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
        );
        const state = useStore.getState();
        // Берем свежую копию из оригинального поля (НЕ из tempFieldData!)
        const originalField = state.diagram.tables[tableIndex].fields[fieldIndex];
        const field = { ...originalField };
        
        // Обновляем tempFieldData на свежую копию
        state.diagram.tempFieldData = field;
        
        // Render appropriate editor based on database type
        if (state.database === 'mongodb') {
          renderMongoTab(tab, container, field, state, tableIndex, fieldIndex);
        } else {
          renderSQLTab(tab, container, field, state, tableIndex, fieldIndex);
        }
      }, 0);
    };
  });
}

/**
 * Render MongoDB tab content
 */
function renderMongoTab(tab, container, field, state, tableIndex, fieldIndex) {
  switch(tab) {
    case 'type':
      container.innerHTML = renderMongoTypeEditor(field, state);
      initMongoTypeEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'validation':
      container.innerHTML = renderMongoValidationEditor(field);
      initMongoValidationEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'index':
      container.innerHTML = renderMongoIndexEditor(field);
      initMongoIndexEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'reference':
      container.innerHTML = renderMongoReferenceEditor(field, state);
      initMongoReferenceEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'default':
      container.innerHTML = renderMongoDefaultEditor(field);
      initMongoDefaultEditorHandlers(tableIndex, fieldIndex);
      break;
  }
}

/**
 * Render SQL tab content
 */
function renderSQLTab(tab, container, field, state, tableIndex, fieldIndex) {
  switch(tab) {
    case 'type':
      container.innerHTML = renderTypeEditor(field, state);
      initTypeEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'constraints':
      container.innerHTML = renderConstraintsEditor(field, state);
      initConstraintsEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'foreign-key':
      container.innerHTML = renderForeignKeyEditor(field);
      initForeignKeyEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'validation':
      container.innerHTML = renderValidationEditor(field);
      initValidationEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'index':
      container.innerHTML = renderIndexEditor(field);
      initIndexEditorHandlers(tableIndex, fieldIndex);
      break;
    case 'additional':
      container.innerHTML = renderAdditionalEditor(field);
      initAdditionalEditorHandlers(tableIndex, fieldIndex);
      break;
  }
}

/**
 * Update field type preview
 */
function updateFieldPreview(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const field = state.diagram.tables[tableIndex]?.fields[fieldIndex];
  if (!field) return;
  
  const preview = document.querySelector(
    `.field-type-preview[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (preview) {
    preview.textContent = getTypeDisplay(field);
  }
}

/**
 * Get display string for field type
 */
function getTypeDisplay(field) {
  if (!field.type) return '';
  
  let display = field.type;
  
  if (field.size && ['VARCHAR', 'CHAR'].includes(field.type)) {
    display += `(${field.size})`;
  } else if (field.precision && field.type === 'DECIMAL') {
    display += field.scale ? `(${field.precision},${field.scale})` : `(${field.precision})`;
  }
  
  return display;
}

// ============================================================================
// SQL Field Editor Handlers
// ============================================================================

function initTypeEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onSelectChange('.type-select', 'type', true);
  manager.onInputChange('.size-input', 'size', parseInt);
  manager.onInputChange('.precision-input', 'precision', parseInt);
  manager.onInputChange('.scale-input', 'scale', parseInt);
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initConstraintsEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onCheckboxChange('.nullable-checkbox', 'nullable');
  manager.onCheckboxChange('.unique-checkbox', 'unique');
  manager.onCheckboxChange('.primary-key-checkbox', 'primaryKey');
  manager.onCheckboxChange('.auto-increment-checkbox', 'autoIncrement');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initForeignKeyEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData.foreignKey || {},
    null,
    null
  );
  
  manager.onSelectChange('.fk-table-select', 'table');
  manager.onSelectChange('.fk-field-select', 'field');
  manager.onSelectChange('.fk-on-delete-select', 'onDelete');
  manager.onSelectChange('.fk-on-update-select', 'onUpdate');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initValidationEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onInputChange('.min-input', 'min', parseFloat);
  manager.onInputChange('.max-input', 'max', parseFloat);
  manager.onInputChange('.pattern-input', 'pattern');
  manager.onTextareaChange('.enum-input', 'enum');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initIndexEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onSelectChange('.index-type-select', 'indexType');
  manager.onCheckboxChange('.unique-index-checkbox', 'uniqueIndex');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initAdditionalEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onInputChange('.default-input', 'default');
  manager.onInputChange('.comment-input', 'comment');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

// ============================================================================
// MongoDB Field Editor Handlers
// ============================================================================

function initMongoTypeEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onSelectChange('.mongo-type-select', 'type');
  manager.onCheckboxChange('.mongo-array-checkbox', 'isArray');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initMongoValidationEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onCheckboxChange('.mongo-required-checkbox', 'required');
  manager.onInputChange('.mongo-min-input', 'min', parseFloat);
  manager.onInputChange('.mongo-max-input', 'max', parseFloat);
  manager.onTextareaChange('.mongo-enum-input', 'enum');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initMongoIndexEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onCheckboxChange('.mongo-indexed-checkbox', 'indexed');
  manager.onCheckboxChange('.mongo-unique-checkbox', 'unique');
  manager.onCheckboxChange('.mongo-sparse-checkbox', 'sparse');
  manager.onInputChange('.mongo-ttl-input', 'ttl', parseInt);
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initMongoReferenceEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onSelectChange('.mongo-ref-select', 'ref');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}

function initMongoDefaultEditorHandlers(tableIndex, fieldIndex) {
  const state = useStore.getState();
  const container = document.querySelector(
    `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
  );
  if (!container) return;
  
  const manager = new EditorHandlerManager(
    container,
    state.diagram.tempFieldData,
    null,
    null
  );
  
  manager.onInputChange('.mongo-default-input', 'default');
  
  // Save button
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const state = useStore.getState();
      
      // Копируем tempFieldData в реальные данные (как у кеша)
      state.diagram.tables[tableIndex].fields[fieldIndex] = { ...state.diagram.tempFieldData };
      
      // Очищаем контент вручную
      const container = document.querySelector(
        `.field-editor-content[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      );
      if (container) {
        container.innerHTML = '';
      }
      
      // Убираем active класс с табов
      document.querySelectorAll(
        `.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`
      ).forEach(b => b.classList.remove('active'));
      
      // Обновляем state
      state.diagram.editingField = null;
      state.diagram.activeTab = null;
      state.diagram.tempFieldData = null;
    };
  }
}