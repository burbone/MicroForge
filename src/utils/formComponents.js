// Reusable form component generators
// This eliminates 200+ lines of duplicated HTML generation code

/**
 * Generate a form group with label, input/select, and optional hint
 */
export const FormGroup = ({ label, hint, children }) => `
  <div class="editor-group">
    <label>${label}</label>
    ${children}
    ${hint ? `<span class="editor-hint">${hint}</span>` : ''}
  </div>
`;

/**
 * Generate a select dropdown
 */
export const Select = ({ className = '', options = [], selected = '', optgroups = null }) => {
  if (optgroups) {
    return `
      <select class="editor-select ${className}">
        ${optgroups.map(group => `
          <optgroup label="${group.label}">
            ${group.options.map(opt => 
              `<option value="${opt}" ${selected === opt ? 'selected' : ''}>${opt}</option>`
            ).join('')}
          </optgroup>
        `).join('')}
      </select>
    `;
  }
  
  return `
    <select class="editor-select ${className}">
      ${options.map(opt => {
        const value = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`;
      }).join('')}
    </select>
  `;
};

/**
 * Generate a checkbox with label
 */
export const Checkbox = ({ className = '', checked = false, label }) => `
  <label class="editor-checkbox">
    <input type="checkbox" class="${className}" ${checked ? 'checked' : ''}>
    <span>${label}</span>
  </label>
`;

/**
 * Generate an input field
 */
export const Input = ({ 
  type = 'text', 
  className = '', 
  value = '', 
  placeholder = '', 
  min, 
  max,
  step
}) => `
  <input 
    type="${type}" 
    class="editor-input ${className}" 
    value="${value || ''}" 
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${min !== undefined ? `min="${min}"` : ''}
    ${max !== undefined ? `max="${max}"` : ''}
    ${step !== undefined ? `step="${step}"` : ''}
  >
`;

/**
 * Generate a textarea
 */
export const Textarea = ({ className = '', value = '', placeholder = '', rows = 3 }) => `
  <textarea 
    class="editor-textarea ${className}" 
    placeholder="${placeholder}"
    rows="${rows}"
  >${value || ''}</textarea>
`;

/**
 * Generate a save button
 */
export const SaveButton = () => `<button class="editor-save-btn">Save</button>`;

/**
 * Generate an editor section wrapper
 */
export const EditorSection = ({ children }) => `
  <div class="editor-section">
    ${children}
  </div>
`;

/**
 * Generate a complete editor with multiple form groups
 */
export const Editor = (formGroups) => {
  return EditorSection({
    children: formGroups.join('') + SaveButton()
  });
};