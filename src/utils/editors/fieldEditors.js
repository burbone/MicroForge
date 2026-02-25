// Field editors for database fields - REFACTORED VERSION
// Using new form components utilities - reduces code by ~150 lines

import { FormGroup, Select, Checkbox, Input, Editor } from '../formComponents.js';

// ============================================================================
// Database Type Definitions
// ============================================================================

const DATABASE_TYPES = {
  mysql: {
    numeric: ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE'],
    string: ['VARCHAR', 'CHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT'],
    date: ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'],
    other: ['BOOLEAN', 'JSON', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB', 'BINARY', 'VARBINARY', 'ENUM', 'SET']
  },
  h2: {
    numeric: ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION'],
    string: ['VARCHAR', 'CHAR', 'TEXT', 'CLOB'],
    date: ['DATE', 'TIME', 'TIMESTAMP'],
    other: ['BOOLEAN', 'JSON', 'BLOB', 'UUID', 'BINARY', 'VARBINARY', 'ARRAY']
  },
  postgresql: {
    numeric: ['SMALLINT', 'INTEGER', 'BIGINT', 'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION', 'SERIAL', 'BIGSERIAL'],
    string: ['VARCHAR', 'CHAR', 'TEXT'],
    date: ['DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'],
    other: ['BOOLEAN', 'JSON', 'JSONB', 'UUID', 'BYTEA', 'INET']
  },
  mongodb: {
    types: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array', 'Object', 'Mixed', 'Buffer']
  }
};

const AUTO_INCREMENT_TYPES = {
  mysql: ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT'],
  h2: ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT'],
  postgresql: ['SMALLINT', 'INTEGER', 'BIGINT', 'SERIAL', 'BIGSERIAL']
};

// ============================================================================
// SQL Database Editors (PostgreSQL, MySQL, H2)
// ============================================================================

export function renderTypeEditor(field, state) {
  const types = DATABASE_TYPES[state.database] || DATABASE_TYPES.postgresql;
  
  const optgroups = [
    { label: 'Numeric', options: types.numeric },
    { label: 'String', options: types.string },
    { label: 'Date/Time', options: types.date },
    { label: 'Other', options: types.other }
  ];

  const needsSize = types.string.includes(field.type) || 
    (state.database === 'mysql' && ['VARCHAR', 'CHAR', 'VARBINARY', 'BINARY'].includes(field.type));
  const needsPrecision = ['DECIMAL', 'NUMERIC'].includes(field.type);
  const supportsArrays = state.database === 'postgresql' || state.database === 'h2';

  const formGroups = [
    FormGroup({
      label: 'Data Type',
      children: Select({
        className: 'type-select',
        optgroups,
        selected: field.type
      })
    })
  ];

  if (needsSize) {
    formGroups.push(FormGroup({
      label: 'Size',
      children: Input({
        type: 'number',
        className: 'size-input',
        value: field.size || 255,
        min: 1,
        max: 65535
      })
    }));
  }

  if (needsPrecision) {
    formGroups.push(
      FormGroup({
        label: 'Precision',
        children: Input({
          type: 'number',
          className: 'precision-input',
          value: field.precision || 10,
          min: 1,
          max: 1000
        })
      }),
      FormGroup({
        label: 'Scale',
        children: Input({
          type: 'number',
          className: 'scale-input',
          value: field.scale || 2,
          min: 0,
          max: 100
        })
      })
    );
  }

  if (supportsArrays) {
    formGroups.push(FormGroup({
      label: '',
      children: Checkbox({
        className: 'array-checkbox',
        checked: field.isArray,
        label: 'Array Type (e.g., VARCHAR[])'
      })
    }));
  }

  return Editor(formGroups);
}

export function renderConstraintsEditor(field, state) {
  const canAutoIncrement = AUTO_INCREMENT_TYPES[state.database]?.includes(field.type) || false;
  const isPrimaryKey = field.primaryKey;
  const isNotNull = field.nullable === false || isPrimaryKey;
  const radioName = `nullable-${Date.now()}`;

  const formGroups = [
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'pk-checkbox',
        checked: field.primaryKey,
        label: 'Primary Key'
      })
    }),
    FormGroup({
      label: 'Nullability',
      hint: isPrimaryKey ? 'Primary Key is always NOT NULL' : '',
      children: `
        <div class="radio-group">
          <label class="editor-radio">
            <input type="radio" name="${radioName}" value="true" 
              ${field.nullable && !isPrimaryKey ? 'checked' : ''} 
              ${isPrimaryKey ? 'disabled' : ''}>
            <span>NULL</span>
          </label>
          <label class="editor-radio">
            <input type="radio" name="${radioName}" value="false" 
              ${field.nullable === false || isPrimaryKey ? 'checked' : ''} 
              ${isPrimaryKey ? 'disabled' : ''}>
            <span>NOT NULL</span>
          </label>
        </div>
      `
    }),
    FormGroup({
      label: '',
      hint: isPrimaryKey ? 'Primary Key is always UNIQUE' : '',
      children: Checkbox({
        className: 'unique-checkbox',
        checked: field.unique,
        label: 'Unique'
      }) + (isPrimaryKey ? ' disabled' : '')
    })
  ];

  if (canAutoIncrement) {
    formGroups.push(FormGroup({
      label: '',
      children: Checkbox({
        className: 'auto-increment-checkbox',
        checked: field.autoIncrement,
        label: 'Auto Increment'
      })
    }));
  }

  formGroups.push(FormGroup({
    label: '',
    hint: !isNotNull ? 'Enable for nullable fields or set NOT NULL first' : '',
    children: Checkbox({
      className: 'has-default-checkbox',
      checked: field.default !== null && field.default !== undefined,
      label: 'Has Default Value'
    }) + (!isNotNull ? ' disabled' : '')
  }));

  if (field.default !== null && field.default !== undefined) {
    const defaultOptions = ['custom', 'CURRENT_TIMESTAMP', 'true', 'false'];
    const isCustom = !['CURRENT_TIMESTAMP', 'true', 'false'].includes(field.default);

    formGroups.push(
      FormGroup({
        label: 'Default Value',
        children: Select({
          className: 'default-type-select',
          options: defaultOptions.map(opt => ({
            value: opt,
            label: opt === 'custom' ? 'Custom' : opt
          })),
          selected: isCustom ? 'custom' : field.default
        })
      })
    );

    if (isCustom) {
      formGroups.push(FormGroup({
        label: 'Custom Value',
        children: Input({
          className: 'default-custom-input',
          value: field.default,
          placeholder: 'Enter default value'
        })
      }));
    }
  }

  return Editor(formGroups);
}

export function renderForeignKeyEditor(field) {
  const hasForeignKey = field.foreignKey !== null && field.foreignKey !== undefined;

  const formGroups = [
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'fk-enabled-checkbox',
        checked: hasForeignKey,
        label: 'Enable Foreign Key'
      })
    })
  ];

  if (hasForeignKey) {
    const fk = field.foreignKey;
    
    formGroups.push(
      FormGroup({
        label: 'Referenced Table',
        children: Input({
          className: 'fk-table-input',
          value: fk.table || '',
          placeholder: 'table_name'
        })
      }),
      FormGroup({
        label: 'Referenced Column',
        children: Input({
          className: 'fk-column-input',
          value: fk.column || 'id',
          placeholder: 'id'
        })
      }),
      FormGroup({
        label: 'On Delete',
        children: Select({
          className: 'fk-on-delete-select',
          options: ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'],
          selected: fk.onDelete || 'CASCADE'
        })
      }),
      FormGroup({
        label: 'On Update',
        children: Select({
          className: 'fk-on-update-select',
          options: ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'],
          selected: fk.onUpdate || 'CASCADE'
        })
      })
    );
  }

  return Editor(formGroups);
}

export function renderValidationEditor(field) {
  const hasCheck = field.check !== null && field.check !== undefined;

  const formGroups = [
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'check-enabled-checkbox',
        checked: hasCheck,
        label: 'Enable CHECK Constraint'
      })
    })
  ];

  if (hasCheck) {
    formGroups.push(FormGroup({
      label: 'CHECK Condition',
      hint: 'SQL expression (e.g., age >= 18)',
      children: Input({
        className: 'check-condition-input',
        value: field.check || '',
        placeholder: 'value > 0'
      })
    }));
  }

  return Editor(formGroups);
}

export function renderIndexEditor(field) {
  const hasIndex = field.indexType !== null && field.indexType !== undefined;

  const formGroups = [
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'index-enabled-checkbox',
        checked: hasIndex,
        label: 'Create Index'
      })
    })
  ];

  if (hasIndex) {
    formGroups.push(
      FormGroup({
        label: 'Index Type',
        children: Select({
          className: 'index-type-select',
          options: ['BTREE', 'HASH', 'GIST', 'GIN'],
          selected: field.indexType || 'BTREE'
        })
      }),
      FormGroup({
        label: '',
        children: Checkbox({
          className: 'unique-index-checkbox',
          checked: field.uniqueIndex,
          label: 'Unique Index'
        })
      })
    );
  }

  return Editor(formGroups);
}

export function renderAdditionalEditor(field) {
  return Editor([
    FormGroup({
      label: 'Comment',
      hint: 'Optional description for this field',
      children: Input({
        className: 'comment-input',
        value: field.comment || '',
        placeholder: 'Field description'
      })
    })
  ]);
}

// ============================================================================
// MongoDB Editors
// ============================================================================

export function renderMongoTypeEditor(field, state) {
  const types = DATABASE_TYPES.mongodb.types;

  return Editor([
    FormGroup({
      label: 'Data Type',
      children: Select({
        className: 'mongo-type-select',
        options: types,
        selected: field.type || 'String'
      })
    }),
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'mongo-array-checkbox',
        checked: field.isArray,
        label: 'Array Type'
      })
    })
  ]);
}

export function renderMongoValidationEditor(field) {
  return Editor([
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'mongo-required-checkbox',
        checked: field.required,
        label: 'Required'
      })
    }),
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'mongo-unique-checkbox',
        checked: field.unique,
        label: 'Unique'
      })
    })
  ]);
}

export function renderMongoIndexEditor(field) {
  return Editor([
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'mongo-indexed-checkbox',
        checked: field.indexed,
        label: 'Indexed'
      })
    })
  ]);
}

export function renderMongoReferenceEditor(field, state) {
  const hasRef = field.ref !== null && field.ref !== undefined;

  const formGroups = [
    FormGroup({
      label: '',
      children: Checkbox({
        className: 'mongo-ref-enabled-checkbox',
        checked: hasRef,
        label: 'Enable Reference (ref)'
      })
    })
  ];

  if (hasRef) {
    formGroups.push(FormGroup({
      label: 'Referenced Model',
      hint: 'Name of the model to reference',
      children: Input({
        className: 'mongo-ref-input',
        value: field.ref || '',
        placeholder: 'User'
      })
    }));
  }

  return Editor(formGroups);
}

export function renderMongoDefaultEditor(field) {
  return Editor([
    FormGroup({
      label: 'Default Value',
      hint: 'Default value for this field',
      children: Input({
        className: 'mongo-default-input',
        value: field.default || '',
        placeholder: 'Default value'
      })
    })
  ]);
}