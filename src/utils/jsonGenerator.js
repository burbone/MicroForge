// JSON Generator - converts application state to hierarchical JSON format
import { HIERARCHICAL_CONFIG, FEATURE_MICROSERVICE_LINKS, MICROSERVICES } from '../config.js';
import { FEATURE_REQUIREMENTS } from '../featureRequirements.js';

/**
 * Generate complete JSON from application state
 * @param {Object} state - Zustand store state
 * @returns {Object} - JSON ready to send to backend
 */
/**
 * Карта эндпоинтов каждого внешнего сервиса для каждой фичи
 */
const SERVICE_ENDPOINTS = {
  'notifications-service': {
    'phone-sms-login':               ['POST /notifications-service/send-sms', 'POST /notifications-service/verify-sms'],
    'magic-links':                   ['POST /notifications-service/send-magic-link', 'POST /notifications-service/verify-magic-link'],
    'passwordless-auth':             ['POST /notifications-service/send-passwordless', 'POST /notifications-service/verify-passwordless'],
    'password-reset':                ['POST /notifications-service/send-password-reset', 'POST /notifications-service/verify-password-reset'],
    'email-verification':            ['POST /notifications-service/send-verification-email', 'POST /notifications-service/verify-email'],
    'phone-verification':            ['POST /notifications-service/send-verification-sms', 'POST /notifications-service/verify-phone'],
    'sms-codes':                     ['POST /notifications-service/send-mfa-sms', 'POST /notifications-service/verify-mfa-sms'],
    'email-codes':                   ['POST /notifications-service/send-mfa-email', 'POST /notifications-service/verify-mfa-email'],
    'push-notifications':            ['POST /notifications-service/send-mfa-push', 'POST /notifications-service/verify-mfa-push'],
    'login-notifications':           ['POST /notifications-service/send-login-notification'],
    'registration-approval-workflow':['POST /notifications-service/send-approval-notification'],
    'account-deletion':              ['POST /notifications-service/send-deletion-notification'],
  },
  'oauth2-providers': {
    'social-login': ['OAuth2 Authorization Code Flow (Google, Facebook, GitHub)'],
  },
  'analytics-service': {
    'audit-logging':            ['POST /analytics-service/track-event'],
    'suspicious-activity':      ['POST /analytics-service/track-event'],
    'analytics-integration':    ['POST /analytics-service/track-event'],
    'security-event-correlation':['POST /analytics-service/get-metrics'],
    'anomaly-detection':        ['POST /analytics-service/get-metrics'],
  },
  'storage-service': {
    'user-profile-crud': ['POST /storage-service/upload'],
    'data-export':       ['POST /storage-service/upload', 'POST /export-service/generate'],
    'webhooks-outgoing': ['HTTP POST to client URLs'],
  },
  'ldap-server': {
    'ldap': ['LDAP protocol'],
  },
  'saml-idp': {
    'saml': ['SAML 2.0 protocol'],
  },
  'kafka-rabbitmq': {
    'event-publishing': ['POST /message-queue-service/publish'],
  },
};

/**
 * Генерирует список внешних сервисов с эндпоинтами
 */
function generateExternalServices(state) {
  const selectedFeatures = state.selectedFeatures || [];
  const servicesMap = {};

  selectedFeatures.forEach(featureId => {
    const linked = FEATURE_MICROSERVICE_LINKS[featureId];
    if (!linked) return;

    linked.forEach(serviceId => {
      if (!servicesMap[serviceId]) {
        const serviceMeta = MICROSERVICES[serviceId] || {};
        servicesMap[serviceId] = {
          id: serviceId,
          name: serviceMeta.name || serviceId,
          endpoints: []
        };
      }

      const endpoints = SERVICE_ENDPOINTS[serviceId]?.[featureId] || [];
      endpoints.forEach(ep => {
        if (!servicesMap[serviceId].endpoints.includes(ep)) {
          servicesMap[serviceId].endpoints.push(ep);
        }
      });
    });
  });

  return Object.values(servicesMap);
}

/**
 * Преобразует сырой маппинг из store в чистые usedColumns и usedCacheKeys
 */
function formatMapping(mapping) {
  if (!mapping) return null;

  const usedColumns = {};
  const usedCacheKeys = [];

  Object.entries(mapping).forEach(([key, value]) => {
    if (key === '__cache__') {
      // cache keys — массив строк
      if (Array.isArray(value)) {
        value.forEach(k => { if (k) usedCacheKeys.push(k); });
      }
    } else if (key === '__required_db__' || key === '__optional_db__') {
      // плоский массив "table.column" — парсим обратно
      if (Array.isArray(value)) {
        value.forEach(val => {
          if (!val) return;
          const dotIdx = val.indexOf('.');
          if (dotIdx === -1) return;
          const table = val.slice(0, dotIdx);
          const col = val.slice(dotIdx + 1);
          if (!usedColumns[table]) usedColumns[table] = [];
          if (!usedColumns[table].includes(col)) usedColumns[table].push(col);
        });
      }
    } else {
      // старый формат { tableName: [cols] } — оставляем как есть
      if (Array.isArray(value) && value.length > 0) {
        usedColumns[key] = value;
      }
    }
  });

  const result = {};
  if (Object.keys(usedColumns).length > 0) result.usedColumns = usedColumns;
  if (usedCacheKeys.length > 0) result.usedCacheKeys = usedCacheKeys;
  return Object.keys(result).length > 0 ? result : null;
}

export function generateJSON(state) {
  const features = generateHierarchicalFeatures(state);
  
  return {
    leftPanel: {
      serviceType: state.serviceType,
      project: {
        group: state.group,
        artifact: state.artifact,
        name: state.name,
        description: state.description || '',
        package: state.packageName
      },
      architecture: {
        model: state.model,
        build: state.build
      },
      infrastructure: {
        databaseEnabled: state.databaseEnabled,
        database: state.database || '',
        cacheEnabled: state.cacheEnabled,
        cache: state.cache || ''
      }
    },
    
    midPanel: {
      selectedFeatures: state.selectedFeatures
    },
    
    diagram: {
      database: generateDatabaseSection(state),
      cache: generateCacheSection(state),
      ...(Object.keys(features).length > 0 && { features })
    },
    
    externalServices: generateExternalServices(state)
  };
}

/**
 * Generate hierarchical features structure
 * Features are grouped by their parent groups (authentication, authorization, etc.)
 */
/**
 * Generate hierarchical features structure
 * Features are grouped by their parent groups (authentication, authorization, etc.)
 * 
 * Output structure:
 * {
 *   "authentication": {
 *     "email-password-login": { usedColumns: {...} },
 *     "oauth2": { usedColumns: {...} }
 *   },
 *   "authorization": {
 *     "rbac": {
 *       usedColumns: {...},
 *       children: {
 *         "hierarchical-roles": { usedColumns: {...} },
 *         "temporal-permissions": { usedColumns: {...} }
 *       }
 *     }
 *   }
 * }
 */
function generateHierarchicalFeatures(state) {
  const result = {};
  const featureColumnMappings = state.diagram.featureColumnMappings || {};
  const selectedFeatures = state.selectedFeatures || [];
  
  // Track which features we've already processed
  const processed = new Set();
  
  // Iterate through selected features
  selectedFeatures.forEach(featureId => {
    if (processed.has(featureId)) return;
    
    // Find which group this feature belongs to
    let groupId = null;
    let isGroupItself = false;
    let parentFeatureId = null;
    
    // Check if this IS a group
    if (HIERARCHICAL_CONFIG[featureId]) {
      groupId = featureId;
      isGroupItself = true;
    } else {
      // Find parent group
      for (const [gId, gData] of Object.entries(HIERARCHICAL_CONFIG)) {
        // Check if it's a direct child
        const directChild = gData.children?.find(c => c.id === featureId);
        if (directChild) {
          groupId = gId;
          break;
        }
        
        // Check if it's a nested child (grandchild)
        for (const child of (gData.children || [])) {
          const grandchild = child.children?.find(sc => sc.id === featureId);
          if (grandchild) {
            groupId = gId;
            parentFeatureId = child.id;
            break;
          }
        }
        
        if (groupId) break;
      }
    }
    
    if (!groupId) return; // Feature not found in config
    
    // Ensure group exists in result
    if (!result[groupId]) {
      result[groupId] = {};
    }
    
    // Get mapping for this feature
    const mapping = featureColumnMappings[featureId];
    const hasMapping = mapping && formatMapping(mapping) !== null;
    
    // If this feature is a group itself
    if (isGroupItself) {
      if (hasMapping) {
        const fmt = formatMapping(mapping);
        if (fmt) Object.assign(result[groupId], fmt);
      }
      
      // Check if this feature has children (like RBAC)
      const requirements = FEATURE_REQUIREMENTS[featureId];
      if (requirements?.type === 'parent' && requirements.children) {
        const childMappings = {};
        
        requirements.children.forEach(childId => {
          if (selectedFeatures.includes(childId)) {
            processed.add(childId);
            
            const childMapping = featureColumnMappings[childId];
            if (childMapping && Object.keys(childMapping).length > 0) {
              const childFmt = formatMapping(childMapping);
              if (childFmt) childMappings[childId] = childFmt;
            }
          }
        });
        
        if (Object.keys(childMappings).length > 0) {
          result[groupId].children = childMappings;
        }
      }
      
      processed.add(featureId);
    }
    // If this feature is a child of a parent feature (like hierarchical-roles is child of RBAC)
    else if (parentFeatureId) {
      // This is handled when we process the parent feature
      // So we just mark it as processed
      processed.add(featureId);
    }
    // If this feature is a regular child within a group
    else {
      if (hasMapping) {
        const featFmt = formatMapping(mapping);
        if (featFmt) result[groupId][featureId] = featFmt;
      }
      processed.add(featureId);
    }
  });
  
  return result;
}

/**
 * Generate database section
 */
function generateDatabaseSection(state) {
  if (!state.databaseEnabled && (!state.diagram.tables || state.diagram.tables.length === 0)) {
    return null;
  }
  
  return {
    type: state.database || '',
    tables: (state.diagram.tables || []).map(table => ({
      name: table.name,
      fields: (table.fields || []).map(field => formatField(field, state.database))
    }))
  };
}

/**
 * Format field based on database type
 */
function formatField(field, dbType) {
  const baseField = {
    name: field.name,
    type: field.type
  };
  
  // SQL databases
  if (dbType !== 'mongodb') {
    if (field.size !== null && field.size !== undefined) {
      baseField.size = field.size;
    }
    if (field.precision !== null && field.precision !== undefined) {
      baseField.precision = field.precision;
    }
    if (field.scale !== null && field.scale !== undefined) {
      baseField.scale = field.scale;
    }
    if (field.nullable !== undefined) {
      baseField.nullable = field.nullable;
    }
    if (field.unique) baseField.unique = true;
    if (field.primaryKey) baseField.primaryKey = true;
    if (field.autoIncrement) baseField.autoIncrement = true;
    if (field.default !== null && field.default !== undefined && field.default !== '') {
      baseField.default = field.default;
    }
    if (field.comment) baseField.comment = field.comment;
    if (field.isArray) baseField.isArray = true;
    
    if (field.foreignKey) {
      baseField.foreignKey = {
        table: field.foreignKey.table,
        column: field.foreignKey.column
      };
      if (field.foreignKey.onDelete) {
        baseField.foreignKey.onDelete = field.foreignKey.onDelete;
      }
      if (field.foreignKey.onUpdate) {
        baseField.foreignKey.onUpdate = field.foreignKey.onUpdate;
      }
    }
    
    if (field.index || field.indexType) {
      baseField.index = {
        type: field.indexType || 'BTREE',
        unique: field.uniqueIndex || false
      };
    }
    
    if (field.check) baseField.check = field.check;
  }
  
  // MongoDB
  if (dbType === 'mongodb') {
    if (field.required) baseField.required = true;
    if (field.unique) baseField.unique = true;
    if (field.indexed) baseField.indexed = true;
    if (field.ref) baseField.ref = field.ref;
    if (field.default !== null && field.default !== undefined) {
      baseField.default = field.default;
    }
    if (field.isArray) baseField.isArray = true;
  }
  
  return baseField;
}

/**
 * Generate cache section
 */
function generateCacheSection(state) {
  if (!state.cacheEnabled && !hasCacheKeys(state)) {
    return null;
  }
  
  const cacheType = state.cache;
  
  if (cacheType === 'redis') {
    return {
      type: 'redis',
      settings: state.diagram.redisSettings || {
        maxMemory: '256mb',
        evictionPolicy: 'noeviction'
      },
      keys: {
        redis: (state.diagram.cacheKeys || []).map(formatRedisKey)
      }
    };
  }
  
  if (cacheType === 'in-memory') {
    return {
      type: 'in-memory',
      settings: state.diagram.inMemorySettings || {
        maxSize: 10000,
        evictionPolicy: 'LRU'
      },
      keys: {
        inMemory: (state.diagram.inMemoryKeys || []).map(key => ({
          name: key.name,
          ttl: key.ttl || null
        }))
      }
    };
  }
  
  if (cacheType === 'caffeine') {
    return {
      type: 'caffeine',
      settings: {},
      keys: {
        caffeine: (state.diagram.caffeineCaches || []).map(formatCaffeineCache)
      }
    };
  }
  
  return null;
}

/**
 * Format Redis key
 */
function formatRedisKey(key) {
  const config = {
    pattern: key.pattern,
    type: key.type || 'String'
  };
  
  if (key.ttl) config.ttl = key.ttl;
  if (key.expireStrategy) config.expireStrategy = key.expireStrategy;
  if (key.serialization) config.serialization = key.serialization;
  if (key.compression) config.compression = key.compression;
  if (key.eviction) config.eviction = key.eviction;
  if (key.pinned) config.pinned = key.pinned;
  if (key.prettyJson) config.prettyJson = key.prettyJson;
  
  if (key.type === 'Hash' && key.hashFields) {
    config.hashFields = key.hashFields;
  }
  if (key.type === 'Sorted Set' && key.scoreField) {
    config.scoreField = key.scoreField;
  }
  
  return config;
}

/**
 * Format Caffeine cache
 */
function formatCaffeineCache(cache) {
  const config = {
    name: cache.name
  };
  
  if (cache.maxSize) config.maxSize = cache.maxSize;
  if (cache.expireAfterWrite) config.expireAfterWrite = cache.expireAfterWrite;
  if (cache.expireAfterAccess) config.expireAfterAccess = cache.expireAfterAccess;
  if (cache.refreshAfterWrite) config.refreshAfterWrite = cache.refreshAfterWrite;
  if (cache.weakKeys) config.weakKeys = cache.weakKeys;
  if (cache.weakValues) config.weakValues = cache.weakValues;
  if (cache.recordStats) config.recordStats = cache.recordStats;
  
  return config;
}

/**
 * Helper: Check if state has cache keys
 */
function hasCacheKeys(state) {
  return (
    (state.diagram.cacheKeys && state.diagram.cacheKeys.length > 0) ||
    (state.diagram.inMemoryKeys && state.diagram.inMemoryKeys.length > 0) ||
    (state.diagram.caffeineCaches && state.diagram.caffeineCaches.length > 0)
  );
}

/**
 * Pretty print JSON
 */
export function prettyPrintJSON(json) {
  return JSON.stringify(json, null, 2);
}

/**
 * Download JSON as file
 */
export function downloadJSON(json, filename = 'microservice-config.json') {
  const blob = new Blob([prettyPrintJSON(json)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Send JSON to backend
 */
export async function sendToBackend(json, apiEndpoint = '/api/generate') {
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(json)
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}