// Universal field editor handlers - optimized
import { 
  renderTypeEditor,
  renderConstraintsEditor,
  renderForeignKeyEditor,
  renderValidationEditor,
  renderIndexEditor,
  renderMongoReferenceEditor
} from './editors/fieldEditors.js';

export function initFieldEditorHandlers(tableIndex, fieldIndex, tab, container, useStore, updateDiagram) {
  const state = useStore.getState();
  const tempField = state.diagram.tempFieldData;
  
  if (!tempField) return;
  
  // Common save handler for all tabs
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const freshState = useStore.getState();
      const freshTempData = freshState.diagram.tempFieldData;
      
      // Update actual field
      useStore.getState().updateField(tableIndex, fieldIndex, freshTempData);
      
      // Clear tab content
      container.innerHTML = '';
      
      // Deactivate tabs
      document.querySelectorAll(`.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`)
        .forEach(b => b.classList.remove('active'));
      
      // Update state
      const newState = useStore.getState();
      useStore.setState({
        diagram: {
          ...newState.diagram,
          activeTab: null,
          tempFieldData: { ...newState.diagram.tables[tableIndex].fields[fieldIndex] }
        }
      });
      
      updateDiagram();
    };
  }
  
  // Tab-specific handlers
  switch(tab) {
    case 'type':
      initTypeHandlers(tempField, tableIndex, fieldIndex, container, state, useStore, updateDiagram);
      break;
    case 'constraints':
      initConstraintsHandlers(tempField, tableIndex, fieldIndex, container, state, useStore, updateDiagram);
      break;
    case 'foreign-key':
      initForeignKeyHandlers(tempField, container);
      break;
    case 'validation':
      initValidationHandlers(tempField, container, useStore, updateDiagram);
      break;
    case 'index':
      initIndexHandlers(tempField, container);
      break;
    case 'additional':
      initAdditionalHandlers(tempField, container);
      break;
  }
}

function initTypeHandlers(tempField, tableIndex, fieldIndex, container, state, useStore, updateDiagram) {
  const typeSelect = container.querySelector('.type-select');
  if (typeSelect) {
    typeSelect.onchange = (e) => {
      tempField.type = e.target.value;
      // Re-render to show/hide size/precision fields
      container.innerHTML = renderTypeEditor(tempField, state);
      initFieldEditorHandlers(tableIndex, fieldIndex, 'type', container, useStore, updateDiagram);
    };
  }
  
  const sizeInput = container.querySelector('.size-input');
  if (sizeInput) {
    sizeInput.oninput = (e) => {
      tempField.size = parseInt(e.target.value) || 255;
    };
  }
  
  const precisionInput = container.querySelector('.precision-input');
  if (precisionInput) {
    precisionInput.oninput = (e) => {
      tempField.precision = parseInt(e.target.value) || 10;
    };
  }
  
  const scaleInput = container.querySelector('.scale-input');
  if (scaleInput) {
    scaleInput.oninput = (e) => {
      tempField.scale = parseInt(e.target.value) || 2;
    };
  }
  
  const arrayCheckbox = container.querySelector('.array-checkbox');
  if (arrayCheckbox) {
    arrayCheckbox.onchange = (e) => {
      tempField.isArray = e.target.checked;
    };
  }
}

function initConstraintsHandlers(tempField, tableIndex, fieldIndex, container, state, useStore, updateDiagram) {
  const pkCheckbox = container.querySelector('.pk-checkbox');
  if (pkCheckbox) {
    pkCheckbox.onchange = (e) => {
      tempField.primaryKey = e.target.checked;
      if (e.target.checked) {
        tempField.nullable = false;
        tempField.unique = true;
      }
      // Re-render to update disabled states
      container.innerHTML = renderConstraintsEditor(tempField, state);
      initFieldEditorHandlers(tableIndex, fieldIndex, 'constraints', container, useStore, updateDiagram);
    };
  }
  
  const nullableRadios = container.querySelectorAll('input[name^="nullable"]');
  nullableRadios.forEach(radio => {
    radio.onchange = (e) => {
      tempField.nullable = e.target.value === 'true';
      // Re-render to update default value section
      container.innerHTML = renderConstraintsEditor(tempField, state);
      initFieldEditorHandlers(tableIndex, fieldIndex, 'constraints', container, useStore, updateDiagram);
    };
  });
  
  const uniqueCheckbox = container.querySelector('.unique-checkbox');
  if (uniqueCheckbox) {
    uniqueCheckbox.onchange = (e) => {
      tempField.unique = e.target.checked;
    };
  }
  
  const autoIncrementCheckbox = container.querySelector('.auto-increment-checkbox');
  if (autoIncrementCheckbox) {
    autoIncrementCheckbox.onchange = (e) => {
      tempField.autoIncrement = e.target.checked;
    };
  }
  
  const hasDefaultCheckbox = container.querySelector('.has-default-checkbox');
  if (hasDefaultCheckbox) {
    hasDefaultCheckbox.onchange = (e) => {
      if (e.target.checked) {
        tempField.default = '';
      } else {
        tempField.default = null;
      }
      // Re-render to show/hide default value config
      container.innerHTML = renderConstraintsEditor(tempField, state);
      initFieldEditorHandlers(tableIndex, fieldIndex, 'constraints', container, useStore, updateDiagram);
    };
  }
  
  const defaultTypeSelect = container.querySelector('.default-type-select');
  if (defaultTypeSelect) {
    defaultTypeSelect.onchange = (e) => {
      const value = e.target.value;
      if (value === 'custom') {
        tempField.default = '';
      } else {
        tempField.default = value;
      }
      // Re-render to show/hide custom input
      container.innerHTML = renderConstraintsEditor(tempField, state);
      initFieldEditorHandlers(tableIndex, fieldIndex, 'constraints', container, useStore, updateDiagram);
    };
  }
  
  const defaultCustomInput = container.querySelector('.default-custom-input');
  if (defaultCustomInput) {
    defaultCustomInput.oninput = (e) => {
      tempField.default = e.target.value;
    };
  }
}

function initForeignKeyHandlers(tempField, container) {
  const fkEnabledCheckbox = container.querySelector('.fk-enabled-checkbox');
  if (fkEnabledCheckbox) {
    fkEnabledCheckbox.onchange = (e) => {
      if (e.target.checked) {
        tempField.foreignKey = { table: '', column: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' };
      } else {
        tempField.foreignKey = null;
      }
      // Re-render to show/hide FK config
      container.innerHTML = renderForeignKeyEditor(tempField);
      initFieldEditorHandlers(null, null, 'foreign-key', container, null, null);
    };
  }
  
  const fkTableInput = container.querySelector('.fk-table-input');
  if (fkTableInput) {
    fkTableInput.oninput = (e) => {
      if (!tempField.foreignKey) tempField.foreignKey = {};
      tempField.foreignKey.table = e.target.value;
    };
  }
  
  const fkColumnInput = container.querySelector('.fk-column-input');
  if (fkColumnInput) {
    fkColumnInput.oninput = (e) => {
      if (!tempField.foreignKey) tempField.foreignKey = {};
      tempField.foreignKey.column = e.target.value;
    };
  }
  
  const fkOnDeleteSelect = container.querySelector('.fk-on-delete-select');
  if (fkOnDeleteSelect) {
    fkOnDeleteSelect.onchange = (e) => {
      if (!tempField.foreignKey) tempField.foreignKey = {};
      tempField.foreignKey.onDelete = e.target.value;
    };
  }
  
  const fkOnUpdateSelect = container.querySelector('.fk-on-update-select');
  if (fkOnUpdateSelect) {
    fkOnUpdateSelect.onchange = (e) => {
      if (!tempField.foreignKey) tempField.foreignKey = {};
      tempField.foreignKey.onUpdate = e.target.value;
    };
  }
}

function initValidationHandlers(tempField, container, useStore, updateDiagram) {
  const checkEnabledCheckbox = container.querySelector('.check-enabled-checkbox');
  if (checkEnabledCheckbox) {
    checkEnabledCheckbox.onchange = (e) => {
      if (e.target.checked) {
        tempField.check = '';
      } else {
        tempField.check = null;
      }
      // Re-render to show/hide check config
      container.innerHTML = renderValidationEditor(tempField);
      initFieldEditorHandlers(null, null, 'validation', container, useStore, updateDiagram);
    };
  }
  
  const checkConditionInput = container.querySelector('.check-condition-input');
  if (checkConditionInput) {
    checkConditionInput.oninput = (e) => {
      tempField.check = e.target.value;
    };
  }
}

function initIndexHandlers(tempField, container) {
  const indexEnabledCheckbox = container.querySelector('.index-enabled-checkbox');
  if (indexEnabledCheckbox) {
    indexEnabledCheckbox.onchange = (e) => {
      if (e.target.checked) {
        tempField.indexType = 'BTREE';
      } else {
        tempField.indexType = null;
        tempField.uniqueIndex = false;
      }
      // Re-render to update disabled states
      container.innerHTML = renderIndexEditor(tempField);
      initFieldEditorHandlers(null, null, 'index', container, null, null);
    };
  }
  
  const indexTypeSelect = container.querySelector('.index-type-select');
  if (indexTypeSelect) {
    indexTypeSelect.onchange = (e) => {
      tempField.indexType = e.target.value;
    };
  }
  
  const uniqueIndexCheckbox = container.querySelector('.unique-index-checkbox');
  if (uniqueIndexCheckbox) {
    uniqueIndexCheckbox.onchange = (e) => {
      tempField.uniqueIndex = e.target.checked;
    };
  }
}

function initAdditionalHandlers(tempField, container) {
  const commentInput = container.querySelector('.comment-input');
  if (commentInput) {
    commentInput.oninput = (e) => {
      tempField.comment = e.target.value;
    };
  }
}

// MongoDB handlers
export function initMongoFieldEditorHandlers(tableIndex, fieldIndex, tab, container, useStore, updateDiagram) {
  const state = useStore.getState();
  const tempField = state.diagram.tempFieldData;
  
  if (!tempField) return;
  
  // Common save handler
  const saveBtn = container.querySelector('.editor-save-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const freshState = useStore.getState();
      const freshTempData = freshState.diagram.tempFieldData;
      
      useStore.getState().updateField(tableIndex, fieldIndex, freshTempData);
      
      container.innerHTML = '';
      
      document.querySelectorAll(`.field-tab-btn[data-table-index="${tableIndex}"][data-field-index="${fieldIndex}"]`)
        .forEach(b => b.classList.remove('active'));
      
      const newState = useStore.getState();
      useStore.setState({
        diagram: {
          ...newState.diagram,
          activeTab: null,
          tempFieldData: { ...newState.diagram.tables[tableIndex].fields[fieldIndex] }
        }
      });
      
      updateDiagram();
    };
  }
  
  // Tab-specific handlers
  switch(tab) {
    case 'type':
      initMongoTypeHandlers(tempField, container);
      break;
    case 'validation':
      initMongoValidationHandlers(tempField, container);
      break;
    case 'index':
      initMongoIndexHandlers(tempField, container);
      break;
    case 'reference':
      initMongoReferenceHandlers(tempField, container, useStore, updateDiagram);
      break;
    case 'default':
      initMongoDefaultHandlers(tempField, container);
      break;
  }
}

function initMongoTypeHandlers(tempField, container) {
  const typeSelect = container.querySelector('.mongo-type-select');
  if (typeSelect) {
    typeSelect.onchange = (e) => {
      tempField.type = e.target.value;
    };
  }
  
  const arrayCheckbox = container.querySelector('.mongo-array-checkbox');
  if (arrayCheckbox) {
    arrayCheckbox.onchange = (e) => {
      tempField.isArray = e.target.checked;
    };
  }
}

function initMongoValidationHandlers(tempField, container) {
  const requiredCheckbox = container.querySelector('.mongo-required-checkbox');
  if (requiredCheckbox) {
    requiredCheckbox.onchange = (e) => {
      tempField.required = e.target.checked;
    };
  }
  
  const uniqueCheckbox = container.querySelector('.mongo-unique-checkbox');
  if (uniqueCheckbox) {
    uniqueCheckbox.onchange = (e) => {
      tempField.unique = e.target.checked;
    };
  }
}

function initMongoIndexHandlers(tempField, container) {
  const indexedCheckbox = container.querySelector('.mongo-indexed-checkbox');
  if (indexedCheckbox) {
    indexedCheckbox.onchange = (e) => {
      tempField.indexed = e.target.checked;
    };
  }
}

function initMongoReferenceHandlers(tempField, container, useStore, updateDiagram) {
  const refEnabledCheckbox = container.querySelector('.mongo-ref-enabled-checkbox');
  if (refEnabledCheckbox) {
    refEnabledCheckbox.onchange = (e) => {
      if (e.target.checked) {
        tempField.ref = '';
      } else {
        tempField.ref = null;
      }
      const state = useStore.getState();
      container.innerHTML = renderMongoReferenceEditor(tempField, state);
      initMongoFieldEditorHandlers(null, null, 'reference', container, useStore, updateDiagram);
    };
  }
  
  const refInput = container.querySelector('.mongo-ref-input');
  if (refInput) {
    refInput.oninput = (e) => {
      tempField.ref = e.target.value;
    };
  }
}

function initMongoDefaultHandlers(tempField, container) {
  const defaultInput = container.querySelector('.mongo-default-input');
  if (defaultInput) {
    defaultInput.oninput = (e) => {
      tempField.default = e.target.value;
    };
  }
}