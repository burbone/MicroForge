import { create } from 'zustand';
import { HIERARCHICAL_CONFIG, MICROSERVICES, FEATURE_MICROSERVICE_LINKS } from '../config.js';

// Helper: check if feature has children
function hasChildren(featureId) {
  // Check in top-level groups
  if (HIERARCHICAL_CONFIG[featureId] && HIERARCHICAL_CONFIG[featureId].children) {
    return HIERARCHICAL_CONFIG[featureId].children.length > 0;
  }
  
  // Check in children
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (groupData.children) {
      const child = groupData.children.find(c => c.id === featureId);
      if (child && child.children && child.children.length > 0) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper: get children IDs of a feature
function getChildrenIds(featureId) {
  // Check in top-level groups
  if (HIERARCHICAL_CONFIG[featureId] && HIERARCHICAL_CONFIG[featureId].children) {
    return HIERARCHICAL_CONFIG[featureId].children.map(c => c.id);
  }
  
  // Check in children
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (groupData.children) {
      const child = groupData.children.find(c => c.id === featureId);
      if (child && child.children) {
        return child.children.map(sc => sc.id);
      }
    }
  }
  
  return [];
}

// Helper functions
function isFeatureDisabled(feature, selectedFeatures) {
  if (!feature.requiresAny) return false;
  
  // Check each required feature
  for (const reqId of feature.requiresAny) {
    // If required feature has children, check if ANY child is selected
    if (hasChildren(reqId)) {
      const childIds = getChildrenIds(reqId);
      const hasSelectedChild = childIds.some(childId => selectedFeatures.includes(childId));
      if (hasSelectedChild) {
        return false; // At least one child is selected, requirement met
      }
    } else {
      // No children, check direct selection
      if (selectedFeatures.includes(reqId)) {
        return false; // Requirement met
      }
    }
  }
  
  return true; // No requirements met
}

function unselectAllChildren(selectedFeatures, parentId) {
  let newSelected = [...selectedFeatures];
  
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (groupId === parentId && groupData.children) {
      groupData.children.forEach(child => {
        newSelected = newSelected.filter(id => id !== child.id);
        
        if (child.children) {
          child.children.forEach(subchild => {
            newSelected = newSelected.filter(id => id !== subchild.id);
          });
        }
      });
    }
    
    if (groupData.children) {
      groupData.children.forEach(child => {
        if (child.id === parentId && child.children) {
          child.children.forEach(subchild => {
            newSelected = newSelected.filter(id => id !== subchild.id);
          });
        }
      });
    }
  }
  
  return newSelected;
}

function handleMutuallyExclusive(selectedFeatures, featureId) {
  let newSelected = [...selectedFeatures];
  
  let feature = null;
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (groupData.children) {
      const found = groupData.children.find(c => c.id === featureId);
      if (found) {
        feature = found;
        break;
      }
    }
  }
  
  if (!feature || !feature.mutuallyExclusive) return newSelected;
  
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (groupData.children) {
      groupData.children.forEach(child => {
        if (child.mutuallyExclusive === feature.mutuallyExclusive && 
            child.id !== featureId) {
          newSelected = newSelected.filter(id => id !== child.id);
          newSelected = unselectAllChildren(newSelected, child.id);
        }
      });
    }
  }
  
  return newSelected;
}

function cleanupDisabledSelections(selectedFeatures) {
  let newSelected = [...selectedFeatures];
  const toRemove = [];
  
  for (const [groupId, groupData] of Object.entries(HIERARCHICAL_CONFIG)) {
    if (isFeatureDisabled(groupData, newSelected) && newSelected.includes(groupId)) {
      toRemove.push(groupId);
    }
    
    if (groupData.children) {
      groupData.children.forEach(child => {
        if (isFeatureDisabled(child, newSelected) && newSelected.includes(child.id)) {
          toRemove.push(child.id);
        }
        
        if (child.children) {
          child.children.forEach(subchild => {
            if (isFeatureDisabled(subchild, newSelected) && newSelected.includes(subchild.id)) {
              toRemove.push(subchild.id);
            }
          });
        }
      });
    }
  }
  
  toRemove.forEach(id => {
    newSelected = newSelected.filter(f => f !== id);
    newSelected = unselectAllChildren(newSelected, id);
  });
  
  return newSelected;
}

export const useStore = create((set, get) => ({
  // Project Metadata
  serviceType: 'auth',
  group: '',
  artifact: '',
  name: '',
  description: '',
  packageName: '',
  
  // Architecture
  selectedFeatures: [],
  model: null,  // Initially null - nothing selected
  build: null,  // Initially null - nothing selected
  
  // Infrastructure
  databaseEnabled: false,  // Initially OFF
  database: null,
  cacheEnabled: false,     // Initially OFF
  cache: null,
  
  // UI State
  zoom: 1,
  featuresPanelOpen: false,
  
  // Diagram Data
  diagram: {
    tables: [],
    cacheKeys: [],
    inMemoryKeys: [],
    showingRedisSettings: false,
    redisSettings: { maxMemory: '256mb', evictionPolicy: 'noeviction' },
    showingInMemorySettings: false,
    inMemorySettings: { maxSize: 1000, evictionPolicy: 'LRU' },
    caffeineCaches: [],
    
    editingField: null,
    editingKey: null,
    editingInMemoryKey: null,
    editingCaffeineCache: null,
    
    activeTab: null,
    activeCacheTab: null,
    activeInMemoryTab: null,
    activeCaffeineTab: null,
    
    tempFieldData: null,
    tempKeyData: null,
    tempInMemoryData: null,
    tempCaffeineData: null,
    
    pan: { x: 0, y: 0 },
    isPanning: false,
    startPan: { x: 0, y: 0 },
    
    databasePosition: { x: 50, y: 50 },
    cachePosition: { x: 500, y: 50 },
    
    // Microservices positions (dynamically set via updateBlockPosition)
    'notifications-servicePosition': null,
    'oauth2-providersPosition': null,
    'analytics-servicePosition': null,
    'storage-servicePosition': null,
    'ldap-serverPosition': null,
    'saml-idpPosition': null,
    'kafka-rabbitmqPosition': null,
    
    // Feature column mappings
    // Structure: { featureId: { tableName: ['col1', 'col2'] } }
    featureColumnMappings: {},
    
    // Expanded features (for UI state)
    expandedFeatures: []
  },
  
  // Manually edited tracking
  manuallyEdited: {
    name: false,
    packageName: false
  },
  
  
  // Validation state
  validationErrors: {
    serviceType: null,
    group: null,
    artifact: null,
    name: null,
    packageName: null,
    model: null,
    build: null
  },
  showValidation: false,
  
  // Actions
  setServiceType: (serviceType) => set({ 
    serviceType,
    // Clear all state on service type change
    group: '',
    artifact: '',
    name: '',
    description: '',
    packageName: '',
    model: null,
    build: null,
    cacheEnabled: false,
    cache: null,
    databaseEnabled: false,
    database: null,
    selectedFeatures: [],
    diagram: {
      tables: [],
      cacheKeys: [],
      inMemoryKeys: [],
      caffeineCaches: [],
      editingField: null,
      editingKey: null,
      editingInMemoryKey: null,
      editingCaffeineCache: null,
      activeTab: null,
      activeCacheTab: null,
      activeInMemoryTab: null,
      activeCaffeineTab: null,
      tempFieldData: null,
      tempKeyData: null,
      tempInMemoryData: null,
      tempCaffeineData: null,
      pan: { x: 0, y: 0 },
      isPanning: false,
      startPan: { x: 0, y: 0 },
      databasePosition: { x: 50, y: 50 },
      cachePosition: { x: 500, y: 50 },
    },
    manuallyEdited: {
      name: false,
      packageName: false
    }
  }),
  
  setGroup: (group) => set((state) => {
    const updates = { group };
    
    // Auto-fill packageName if not manually edited
    if (!state.manuallyEdited.packageName) {
      const artifact = state.artifact || 'demo';
      updates.packageName = group ? `${group}.${artifact}` : '';
    }
    
    return updates;
  }),
  
  setArtifact: (artifact) => set((state) => {
    const updates = { artifact };
    
    // Auto-fill name if not manually edited
    if (!state.manuallyEdited.name) {
      updates.name = artifact;
    }
    
    // Auto-fill packageName if not manually edited
    if (!state.manuallyEdited.packageName) {
      const group = state.group || 'com.example';
      updates.packageName = artifact ? `${group}.${artifact}` : '';
    }
    
    return updates;
  }),
  
  setName: (name) => set((state) => ({
    name,
    manuallyEdited: { ...state.manuallyEdited, name: true }
  })),
  
  setDescription: (description) => set({ description }),
  
  setPackageName: (packageName) => set((state) => ({
    packageName,
    manuallyEdited: { ...state.manuallyEdited, packageName: true }
  })),
  
  setModel: (model) => set({ 
    model,
    selectedFeatures: [] // Clear features on model change
  }),
  
  setBuild: (build) => set({ build }),
  setFeaturesPanelOpen: (featuresPanelOpen) => set({ featuresPanelOpen }),
  
  toggleDatabase: () => set((state) => {
    if (state.databaseEnabled) {
      // Turning OFF
      return { 
        databaseEnabled: false,
        database: null,
        diagram: {
          ...state.diagram,
          tables: []
        }
      };
    } else {
      // Turning ON
      return { databaseEnabled: true };
    }
  }),
  
  setDatabase: (database) => set((state) => ({
    database,
    diagram: {
      ...state.diagram,
      tables: [] // Clear tables on database type change
    }
  })),
  
  toggleCache: () => set((state) => {
    if (state.cacheEnabled) {
      // Turning OFF
      return { 
        cacheEnabled: false,
        cache: null,
        diagram: {
          ...state.diagram,
          cacheKeys: [],
          inMemoryKeys: [],
          caffeineCaches: [],
          editingKey: null,
          editingInMemoryKey: null,
          editingCaffeineCache: null,
          activeCacheTab: null,
          activeInMemoryTab: null,
          activeCaffeineTab: null,
          tempKeyData: null,
          tempInMemoryData: null,
          tempCaffeineData: null,
        }
      };
    } else {
      // Turning ON
      return { cacheEnabled: true };
    }
  }),
  
  setCache: (cache) => set((state) => ({
    cache,
    diagram: {
      ...state.diagram,
      cacheKeys: [],
      inMemoryKeys: [],
      caffeineCaches: [],
      editingKey: null,
      editingInMemoryKey: null,
      editingCaffeineCache: null,
      activeCacheTab: null,
      activeInMemoryTab: null,
      activeCaffeineTab: null,
      tempKeyData: null,
      tempInMemoryData: null,
      tempCaffeineData: null,
    }
  })),
  
  toggleFeature: (featureId) => set((state) => {
    const isSelected = state.selectedFeatures.includes(featureId);
    let newSelected = [...state.selectedFeatures];
    
    if (isSelected) {
      // Deselect feature
      newSelected = newSelected.filter(id => id !== featureId);
      
      // Recursively unselect all children
      newSelected = unselectAllChildren(newSelected, featureId);
    } else {
      // Check mutually exclusive
      newSelected = handleMutuallyExclusive(newSelected, featureId);
      
      // Select feature
      newSelected.push(featureId);
    }
    
    // Cleanup disabled selections
    newSelected = cleanupDisabledSelections(newSelected);
    
    return { selectedFeatures: newSelected };
  }),
  
  updatePosition: (id, position) => set((state) => ({
    positions: { ...state.positions, [id]: position }
  })),
  
  getRequiredMicroservices: () => {
    const state = get();
    const services = new Set();
    state.selectedFeatures.forEach(featureId => {
      const linked = FEATURE_MICROSERVICE_LINKS[featureId];
      if (linked) {
        linked.forEach(s => services.add(s));
      }
    });
    return Array.from(services);
  },
  
  // Diagram actions
  addTable: () => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      tables: [...prevState.diagram.tables, { name: '', fields: [] }]
    }
  })),
  
  removeTable: (tableIndex) => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      tables: prevState.diagram.tables.filter((_, i) => i !== tableIndex)
    }
  })),
  
  updateTableName: (tableIndex, name) => set((prevState) => {
    const tables = [...prevState.diagram.tables];
    tables[tableIndex] = { ...tables[tableIndex], name };
    return {
      diagram: { ...prevState.diagram, tables }
    };
  }),
  
  addField: (tableIndex) => set((prevState) => {
    const tables = [...prevState.diagram.tables];
    const newField = {
      name: '',
      type: 'VARCHAR',
      size: 255,
      notNull: false,
      unique: false,
      primaryKey: false,
      autoIncrement: false
    };
    tables[tableIndex] = {
      ...tables[tableIndex],
      fields: [...(tables[tableIndex].fields || []), newField]
    };
    return {
      diagram: { ...prevState.diagram, tables }
    };
  }),
  
  removeField: (tableIndex, fieldIndex) => set((prevState) => {
    const tables = [...prevState.diagram.tables];
    tables[tableIndex] = {
      ...tables[tableIndex],
      fields: tables[tableIndex].fields.filter((_, i) => i !== fieldIndex)
    };
    return {
      diagram: { ...prevState.diagram, tables }
    };
  }),
  
  updateFieldName: (tableIndex, fieldIndex, name) => set((prevState) => {
    const tables = [...prevState.diagram.tables];
    const fields = [...tables[tableIndex].fields];
    fields[fieldIndex] = { ...fields[fieldIndex], name };
    tables[tableIndex] = { ...tables[tableIndex], fields };
    return {
      diagram: { ...prevState.diagram, tables }
    };
  }),
  
  updateField: (tableIndex, fieldIndex, fieldData) => set((prevState) => {
    const tables = [...prevState.diagram.tables];
    const fields = [...tables[tableIndex].fields];
    fields[fieldIndex] = { ...fieldData };
    tables[tableIndex] = { ...tables[tableIndex], fields };
    return {
      diagram: { ...prevState.diagram, tables }
    };
  }),
  
  // Redis actions
  addRedisKey: () => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      cacheKeys: [...prevState.diagram.cacheKeys, { pattern: '', valueType: 'String' }]
    }
  })),
  
  removeRedisKey: (keyIndex) => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      cacheKeys: prevState.diagram.cacheKeys.filter((_, i) => i !== keyIndex)
    }
  })),
  
  updateRedisKeyPattern: (keyIndex, pattern) => set((prevState) => {
    const keys = [...prevState.diagram.cacheKeys];
    keys[keyIndex] = { ...keys[keyIndex], pattern };
    return {
      diagram: { ...prevState.diagram, cacheKeys: keys }
    };
  }),
  
  // In-Memory actions
  addInMemoryKey: () => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      inMemoryKeys: [...prevState.diagram.inMemoryKeys, { name: '', ttl: null }]
    }
  })),
  
  removeInMemoryKey: (keyIndex) => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      inMemoryKeys: prevState.diagram.inMemoryKeys.filter((_, i) => i !== keyIndex)
    }
  })),
  
  updateInMemoryKeyName: (keyIndex, name) => set((state) => {
    const keys = [...state.diagram.inMemoryKeys];
    keys[keyIndex] = { ...keys[keyIndex], name };
    return {
      diagram: { ...prevState.diagram, inMemoryKeys: keys }
    };
  }),
  
  // Caffeine actions
  addCaffeineCache: () => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      caffeineCaches: [...prevState.diagram.caffeineCaches, { name: '', maxSize: 1000 }]
    }
  })),
  
  removeCaffeineCache: (cacheIndex) => set((prevState) => ({
    diagram: {
      ...prevState.diagram,
      caffeineCaches: prevState.diagram.caffeineCaches.filter((_, i) => i !== cacheIndex)
    }
  })),
  
  updateCaffeineCacheName: (cacheIndex, name) => set((state) => {
    const caches = [...state.diagram.caffeineCaches];
    caches[cacheIndex] = { ...caches[cacheIndex], name };
    return {
      diagram: { ...prevState.diagram, caffeineCaches: caches }
    };
  }),
  
  updateBlockPosition: (blockId, position) => set((state) => ({
    diagram: {
      ...state.diagram,
      [blockId + 'Position']: position
    }
  })),
  
  // Validation actions
  setValidationErrors: (errors) => set({ 
    validationErrors: errors,
    showValidation: true 
  }),
  
  clearValidation: () => set({ 
    validationErrors: {
      serviceType: null,
      group: null,
      artifact: null,
      name: null,
      packageName: null,
      model: null,
      build: null
    },
    showValidation: false 
  }),
  
  // Feature column mapping actions
  toggleFeatureExpanded: (featureId) => set((state) => {
    const expanded = state.diagram.expandedFeatures || [];
    const isExpanded = expanded.includes(featureId);
    
    return {
      diagram: {
        ...state.diagram,
        expandedFeatures: isExpanded 
          ? expanded.filter(id => id !== featureId)
          : [...expanded, featureId]
      }
    };
  }),
  
  setFeatureColumnMapping: (featureId, tableName, columns) => set((state) => {
    const mappings = state.diagram.featureColumnMappings || {};
    
    return {
      diagram: {
        ...state.diagram,
        featureColumnMappings: {
          ...mappings,
          [featureId]: {
            ...(mappings[featureId] || {}),
            [tableName]: columns
          }
        }
      }
    };
  }),
  
  toggleFeatureColumn: (featureId, tableName, columnName) => set((state) => {
    const mappings = state.diagram.featureColumnMappings || {};
    const featureMapping = mappings[featureId] || {};
    const tableColumns = featureMapping[tableName] || [];
    
    const hasColumn = tableColumns.includes(columnName);
    const newColumns = hasColumn
      ? tableColumns.filter(col => col !== columnName)
      : [...tableColumns, columnName];
    
    return {
      diagram: {
        ...state.diagram,
        featureColumnMappings: {
          ...mappings,
          [featureId]: {
            ...featureMapping,
            [tableName]: newColumns
          }
        }
      }
    };
  }),
  
  clearFeatureColumnMapping: (featureId) => set((state) => {
    const mappings = { ...(state.diagram.featureColumnMappings || {}) };
    delete mappings[featureId];
    
    return {
      diagram: {
        ...state.diagram,
        featureColumnMappings: mappings
      }
    };
  })
}));