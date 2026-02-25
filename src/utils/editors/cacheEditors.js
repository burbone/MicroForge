// Cache editors - REFACTORED using form components

import { FormGroup, Select, Checkbox, Input, Textarea, Editor } from '../formComponents.js';

// Constants
const REDIS_TYPES = ['String', 'Hash', 'List', 'Set', 'Sorted Set', 'JSON', 'Stream'];
const SERIALIZATION_FORMATS = ['JSON', 'Protobuf', 'Avro', 'MessagePack', 'Java Serialization', 'String'];
const COMPRESSION_TYPES = ['None', 'Gzip', 'Snappy', 'LZ4', 'Zstd'];
const EVICTION_POLICIES = ['noeviction', 'allkeys-lru', 'volatile-lru', 'allkeys-lfu', 'volatile-lfu', 'allkeys-random', 'volatile-random', 'volatile-ttl'];
const PERSISTENCE_STRATEGIES = ['None', 'RDB', 'AOF', 'RDB + AOF'];

// ============================================================================
// Redis Cache Editors
// ============================================================================

export function renderRedisTypeEditor(key) {
  const formGroups = [
    FormGroup({
      label: 'Data Type',
      hint: 'Redis data structure type',
      children: Select({
        className: 'redis-type-select',
        options: REDIS_TYPES,
        selected: key.type
      })
    })
  ];

  if (key.type === 'Hash') {
    formGroups.push(FormGroup({
      label: 'Hash Fields',
      hint: 'Comma-separated field names',
      children: Textarea({
        className: 'redis-hash-fields',
        value: key.hashFields?.join(', ') || '',
        placeholder: 'field1, field2, field3'
      })
    }));
  }

  if (key.type === 'Sorted Set') {
    formGroups.push(FormGroup({
      label: 'Score Field',
      children: Input({
        className: 'redis-score-field',
        value: key.scoreField || '',
        placeholder: 'Field name for score'
      })
    }));
  }

  return Editor(formGroups);
}

export function renderRedisTTLEditor(key) {
  return Editor([
    FormGroup({
      label: 'TTL (Time To Live)',
      hint: 'Leave empty for no expiration',
      children: Input({
        type: 'number',
        className: 'redis-ttl-input',
        value: key.ttl || '',
        placeholder: 'Seconds',
        min: 0
      })
    }),
    FormGroup({
      label: 'Expire Strategy',
      hint: 'Fixed: expire after creation, Sliding: refresh on access',
      children: Select({
        className: 'redis-expire-strategy-select',
        options: [
          { value: 'fixed', label: 'Fixed TTL' },
          { value: 'sliding', label: 'Sliding Window' }
        ],
        selected: key.expireStrategy || 'fixed'
      })
    })
  ]);
}

export function renderRedisSerializationEditor(key) {
  const formGroups = [
    FormGroup({
      label: 'Serialization Format',
      hint: 'How data is serialized before storing',
      children: Select({
        className: 'redis-serialization-select',
        options: SERIALIZATION_FORMATS,
        selected: key.serialization || 'JSON'
      })
    }),
    FormGroup({
      label: 'Compression',
      hint: 'Compress data to save memory',
      children: Select({
        className: 'redis-compression-select',
        options: COMPRESSION_TYPES,
        selected: key.compression || 'None'
      })
    })
  ];

  if (key.serialization === 'JSON') {
    formGroups.push(FormGroup({
      label: '',
      hint: 'Format JSON for readability (uses more space)',
      children: Checkbox({
        className: 'redis-pretty-json-checkbox',
        checked: key.prettyJson,
        label: 'Pretty Print JSON'
      })
    }));
  }

  return Editor(formGroups);
}

export function renderRedisEvictionEditor(key) {
  return Editor([
    FormGroup({
      label: 'Eviction Policy',
      hint: 'How Redis handles memory when limit is reached',
      children: Select({
        className: 'redis-eviction-select',
        options: EVICTION_POLICIES,
        selected: key.eviction || 'allkeys-lru'
      })
    }),
    FormGroup({
      label: '',
      hint: 'Prevents this key from being evicted',
      children: Checkbox({
        className: 'redis-pin-key-checkbox',
        checked: key.pinned,
        label: 'Pin Key (never evict)'
      })
    })
  ]);
}

export function renderRedisSettingsPanel(state) {
  const settings = state.diagram.redisSettings || {};
  
  return `
    <div class="settings-panel">
      <h3>Redis Global Settings</h3>
      ${FormGroup({
        label: 'Max Memory',
        hint: 'e.g., 256mb, 2gb',
        children: Input({
          className: 'redis-max-memory',
          value: settings.maxMemory || '256mb',
          placeholder: '256mb'
        })
      })}
      ${FormGroup({
        label: 'Default TTL (seconds)',
        hint: 'Default expiration time for keys',
        children: Input({
          type: 'number',
          className: 'redis-default-ttl',
          value: settings.defaultTTL || '',
          placeholder: 'Leave empty for no expiration',
          min: 0
        })
      })}
      ${FormGroup({
        label: 'Global Eviction Policy',
        children: Select({
          className: 'redis-global-eviction',
          options: EVICTION_POLICIES,
          selected: settings.eviction || 'allkeys-lru'
        })
      })}
      ${FormGroup({
        label: 'Persistence Strategy',
        children: Select({
          className: 'redis-persistence',
          options: PERSISTENCE_STRATEGIES,
          selected: settings.persistence || 'RDB'
        })
      })}
      ${FormGroup({
        label: 'Max Connections',
        children: Input({
          type: 'number',
          className: 'redis-max-connections',
          value: settings.maxConnections || 10,
          min: 1,
          max: 1000
        })
      })}
      ${FormGroup({
        label: 'Timeout (ms)',
        children: Input({
          type: 'number',
          className: 'redis-timeout',
          value: settings.timeout || 3000,
          min: 100,
          max: 30000
        })
      })}
      <button class="redis-settings-save-btn editor-save-btn">Save Settings</button>
    </div>
  `;
}

// ============================================================================
// In-Memory Cache Editors
// ============================================================================

export function renderInMemoryTTLEditor(key) {
  return Editor([
    FormGroup({
      label: 'TTL (Time To Live)',
      hint: 'Seconds until entry expires',
      children: Input({
        type: 'number',
        className: 'inmemory-ttl-input',
        value: key.ttl || '',
        placeholder: 'Seconds',
        min: 0
      })
    })
  ]);
}

export function renderInMemorySettingsPanel(state) {
  const settings = state.diagram.inMemorySettings || {};
  
  return `
    <div class="settings-panel">
      <h3>In-Memory Cache Settings</h3>
      ${FormGroup({
        label: 'Max Size',
        hint: 'Maximum number of entries',
        children: Input({
          type: 'number',
          className: 'inmemory-max-size',
          value: settings.maxSize || 1000,
          min: 1,
          max: 1000000
        })
      })}
      ${FormGroup({
        label: 'Default TTL (seconds)',
        children: Input({
          type: 'number',
          className: 'inmemory-default-ttl',
          value: settings.defaultTTL || '',
          placeholder: 'Leave empty for no expiration',
          min: 0
        })
      })}
      ${FormGroup({
        label: 'Eviction Policy',
        children: Select({
          className: 'inmemory-eviction-policy',
          options: ['LRU', 'LFU', 'FIFO', 'RANDOM'],
          selected: settings.evictionPolicy || 'LRU'
        })
      })}
      <button class="inmemory-settings-save-btn editor-save-btn">Save Settings</button>
    </div>
  `;
}

// ============================================================================
// Caffeine Cache Editors
// ============================================================================

export function renderCaffeineSettingsEditor(cache) {
  return Editor([
    FormGroup({
      label: 'Maximum Size',
      hint: 'Max number of entries (0 = unlimited)',
      children: Input({
        type: 'number',
        className: 'caffeine-maxsize-input',
        value: cache.maxSize || '',
        placeholder: '10000',
        min: 0
      })
    }),
    FormGroup({
      label: 'Expire After Write (seconds)',
      hint: 'Expire entries after last write',
      children: Input({
        type: 'number',
        className: 'caffeine-expire-write-input',
        value: cache.expireAfterWrite || '',
        placeholder: '600',
        min: 0
      })
    }),
    FormGroup({
      label: 'Expire After Access (seconds)',
      hint: 'Expire entries after last access',
      children: Input({
        type: 'number',
        className: 'caffeine-expire-access-input',
        value: cache.expireAfterAccess || '',
        placeholder: '300',
        min: 0
      })
    }),
    FormGroup({
      label: 'Refresh After Write (seconds)',
      hint: 'Refresh entries asynchronously',
      children: Input({
        type: 'number',
        className: 'caffeine-refresh-input',
        value: cache.refreshAfterWrite || '',
        placeholder: '60',
        min: 0
      })
    })
  ]);
}

export function renderCaffeineAdvancedEditor(cache) {
  return Editor([
    FormGroup({
      label: '',
      hint: 'Use weak references for keys (allows GC)',
      children: Checkbox({
        className: 'caffeine-weak-keys-checkbox',
        checked: cache.weakKeys,
        label: 'Weak Keys'
      })
    }),
    FormGroup({
      label: '',
      hint: 'Use weak references for values (allows GC)',
      children: Checkbox({
        className: 'caffeine-weak-values-checkbox',
        checked: cache.weakValues,
        label: 'Weak Values'
      })
    }),
    FormGroup({
      label: '',
      hint: 'Enable statistics collection',
      children: Checkbox({
        className: 'caffeine-record-stats-checkbox',
        checked: cache.recordStats,
        label: 'Record Statistics'
      })
    })
  ]);
}