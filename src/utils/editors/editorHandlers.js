// Editor handler manager - eliminates ~150 lines of duplicated event handler code

export class EditorHandlerManager {
  constructor(container, data, renderFn, reInitFn) {
    this.container = container;
    this.data = data;
    this.renderFn = renderFn;
    this.reInitFn = reInitFn;
    this.handlers = [];
  }

  /**
   * Attach a select change handler
   */
  onSelectChange(selector, field, shouldRerender = false) {
    const element = this.container.querySelector(selector);
    if (!element) return;

    const handler = (e) => {
      this.data[field] = e.target.value;
      if (shouldRerender) {
        this.rerender();
      }
    };

    element.onchange = handler;
    this.handlers.push({ element, event: 'change', handler });
  }

  /**
   * Attach an input change handler
   */
  onInputChange(selector, field, parser = v => v) {
    const element = this.container.querySelector(selector);
    if (!element) return;

    const handler = (e) => {
      const value = e.target.value;
      this.data[field] = value ? parser(value) : null;
    };

    element.oninput = handler;
    this.handlers.push({ element, event: 'input', handler });
  }

  /**
   * Attach a checkbox change handler
   */
  onCheckboxChange(selector, field, shouldRerender = false, transformer = null) {
    const element = this.container.querySelector(selector);
    if (!element) return;

    const handler = (e) => {
      const checked = e.target.checked;
      
      if (transformer) {
        transformer(checked, this.data);
      } else {
        this.data[field] = checked;
      }
      
      if (shouldRerender) {
        this.rerender();
      }
    };

    element.onchange = handler;
    this.handlers.push({ element, event: 'change', handler });
  }

  /**
   * Attach a textarea change handler
   */
  onTextareaChange(selector, field, parser = v => v.split(',').map(s => s.trim()).filter(s => s)) {
    const element = this.container.querySelector(selector);
    if (!element) return;

    const handler = (e) => {
      this.data[field] = parser(e.target.value);
    };

    element.oninput = handler;
    this.handlers.push({ element, event: 'input', handler });
  }

  /**
   * Attach a radio button change handler
   */
  onRadioChange(name, field) {
    const radios = this.container.querySelectorAll(`input[name="${name}"]`);
    if (!radios.length) return;

    radios.forEach(radio => {
      const handler = (e) => {
        if (e.target.checked) {
          this.data[field] = e.target.value === 'true';
        }
      };

      radio.onchange = handler;
      this.handlers.push({ element: radio, event: 'change', handler });
    });
  }

  /**
   * Attach multiple handlers at once using configuration
   */
  attachHandlers(config) {
    config.forEach(({ type, selector, field, ...options }) => {
      switch (type) {
        case 'select':
          this.onSelectChange(selector, field, options.rerender);
          break;
        case 'input':
          this.onInputChange(selector, field, options.parser);
          break;
        case 'checkbox':
          this.onCheckboxChange(selector, field, options.rerender, options.transformer);
          break;
        case 'textarea':
          this.onTextareaChange(selector, field, options.parser);
          break;
        case 'radio':
          this.onRadioChange(selector, field);
          break;
      }
    });
  }

  /**
   * Re-render the editor
   */
  rerender() {
    this.cleanup();
    this.container.innerHTML = this.renderFn(this.data);
    this.reInitFn();
  }

  /**
   * Clean up all event handlers
   */
  cleanup() {
    this.handlers.forEach(({ element, event, handler }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler);
      }
    });
    this.handlers = [];
  }

  /**
   * Destroy the manager and clean up
   */
  destroy() {
    this.cleanup();
    this.container = null;
    this.data = null;
    this.renderFn = null;
    this.reInitFn = null;
  }
}

/**
 * Common parser functions
 */
export const Parsers = {
  int: (v) => parseInt(v) || 0,
  float: (v) => parseFloat(v) || 0,
  commaSeparated: (v) => v.split(',').map(s => s.trim()).filter(s => s),
  json: (v) => {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  },
  boolean: (v) => v === 'true' || v === true,
};

/**
 * Common transformers for checkboxes
 */
export const Transformers = {
  // When checkbox is checked, set field to empty string; when unchecked, set to null
  emptyOrNull: (checked, data, field) => {
    data[field] = checked ? '' : null;
  },
  
  // When checkbox is checked, set field to object; when unchecked, set to null
  objectOrNull: (checked, data, field, defaultObject = {}) => {
    data[field] = checked ? defaultObject : null;
  },
};