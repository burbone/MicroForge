// Feature tree utilities - eliminates ~40 lines of duplicated tree traversal logic

export class FeatureTree {
  constructor(config) {
    this.config = config;
    this._cache = new Map();
  }

  /**
   * Check if a feature has children
   */
  hasChildren(featureId) {
    const node = this.findNode(featureId);
    return node?.children && node.children.length > 0;
  }

  /**
   * Get all child IDs of a feature
   */
  getChildrenIds(featureId) {
    const node = this.findNode(featureId);
    return node?.children?.map(c => c.id) || [];
  }

  /**
   * Find a node in the tree (with caching for performance)
   */
  findNode(featureId, tree = null) {
    // Check cache first
    if (this._cache.has(featureId)) {
      return this._cache.get(featureId);
    }

    const searchTree = tree || this.config;
    
    // Check if it's a top-level node
    if (searchTree[featureId]) {
      this._cache.set(featureId, searchTree[featureId]);
      return searchTree[featureId];
    }

    // Search in children
    for (const [groupId, groupData] of Object.entries(searchTree)) {
      if (groupData.children) {
        const found = this._findInChildren(featureId, groupData.children);
        if (found) {
          this._cache.set(featureId, found);
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Search recursively in children array
   */
  _findInChildren(featureId, children) {
    for (const child of children) {
      if (child.id === featureId) {
        return child;
      }
      
      if (child.children) {
        const found = this._findInChildren(featureId, child.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Check if a feature is disabled based on requirements
   */
  isFeatureDisabled(feature, selectedFeatures) {
    if (!feature.requiresAny) return false;

    // Feature is enabled if ANY of the required features are selected
    return !feature.requiresAny.some(reqId => {
      // If required feature has children, check if any child is selected
      if (this.hasChildren(reqId)) {
        const childIds = this.getChildrenIds(reqId);
        return childIds.some(childId => selectedFeatures.includes(childId));
      }
      
      // Otherwise check if the feature itself is selected
      return selectedFeatures.includes(reqId);
    });
  }

  /**
   * Get all descendants of a feature (children, grandchildren, etc.)
   */
  getAllDescendants(featureId) {
    const node = this.findNode(featureId);
    if (!node?.children) return [];

    const descendants = [];
    const traverse = (children) => {
      for (const child of children) {
        descendants.push(child.id);
        if (child.children) {
          traverse(child.children);
        }
      }
    };

    traverse(node.children);
    return descendants;
  }

  /**
   * Get the path from root to a feature
   */
  getPath(featureId) {
    const path = [];
    
    const findPath = (tree, targetId, currentPath = []) => {
      for (const [groupId, groupData] of Object.entries(tree)) {
        const newPath = [...currentPath, groupId];
        
        if (groupId === targetId) {
          return newPath;
        }
        
        if (groupData.children) {
          const foundInChildren = this._findPathInChildren(
            targetId, 
            groupData.children, 
            newPath
          );
          if (foundInChildren) return foundInChildren;
        }
      }
      return null;
    };

    return findPath(this.config, featureId) || [];
  }

  _findPathInChildren(targetId, children, currentPath) {
    for (const child of children) {
      const newPath = [...currentPath, child.id];
      
      if (child.id === targetId) {
        return newPath;
      }
      
      if (child.children) {
        const found = this._findPathInChildren(targetId, child.children, newPath);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Clear the cache (useful when config changes)
   */
  clearCache() {
    this._cache.clear();
  }
}

// Singleton instance for easy access
let _instance = null;

export function getFeatureTree(config) {
  if (!_instance || config) {
    _instance = new FeatureTree(config);
  }
  return _instance;
}

// Helper functions for backward compatibility
export function hasChildren(featureId, config) {
  return getFeatureTree(config).hasChildren(featureId);
}

export function getChildrenIds(featureId, config) {
  return getFeatureTree(config).getChildrenIds(featureId);
}

export function isFeatureDisabled(feature, selectedFeatures, config) {
  return getFeatureTree(config).isFeatureDisabled(feature, selectedFeatures);
}