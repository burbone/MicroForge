// Smart Placement Algorithm - REFACTORED using layout configuration

import { LAYOUT_CONFIG, GridHelpers } from '../config/layout.js';

/**
 * Find free position for a new widget using grid-based algorithm
 */
export function findFreePosition(existingWidgets, newWidgetWidth = 400, newWidgetHeight = 200) {
  const config = LAYOUT_CONFIG.placement;
  const candidates = [];
  
  // Generate candidate positions in a grid pattern
  for (let row = 0; row < config.grid.maxRows; row++) {
    for (let col = 0; col < config.grid.maxColumns; col++) {
      candidates.push(GridHelpers.getCellPosition(row, col, config));
    }
  }
  
  // Find first position without collision
  for (const position of candidates) {
    if (!hasCollision(position, newWidgetWidth, newWidgetHeight, existingWidgets, config.margin)) {
      return position;
    }
  }
  
  // Fallback: place to the right of all widgets
  return {
    x: config.startPosition.x + config.grid.maxColumns * config.grid.columnWidth,
    y: config.startPosition.y
  };
}

/**
 * Check if a position would collide with existing widgets
 */
export function hasCollision(position, width, height, existingWidgets, margin) {
  const newBounds = {
    left: position.x - margin,
    right: position.x + width + margin,
    top: position.y - margin,
    bottom: position.y + height + margin
  };
  
  for (const widget of existingWidgets) {
    const widgetBounds = {
      left: widget.x,
      right: widget.x + widget.width,
      top: widget.y,
      bottom: widget.y + height
    };
    
    // Check for overlap (AABB collision detection)
    const overlaps = !(
      newBounds.right < widgetBounds.left ||
      newBounds.left > widgetBounds.right ||
      newBounds.bottom < widgetBounds.top ||
      newBounds.top > widgetBounds.bottom
    );
    
    if (overlaps) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get list of existing widgets from state with their positions and dimensions
 */
export function getExistingWidgets(state) {
  const widgets = [];
  const widgetDimensions = LAYOUT_CONFIG.widgets;
  
  // Database widget
  if (state.databaseEnabled && state.database) {
    const pos = state.diagram.dbPosition || LAYOUT_CONFIG.placement.startPosition;
    widgets.push({
      x: pos.x,
      y: pos.y,
      width: widgetDimensions.database.minWidth,
      height: widgetDimensions.database.defaultHeight
    });
  }
  
  // Cache widget
  if (state.cacheEnabled && state.cache) {
    const pos = state.diagram.cachePosition || {
      x: LAYOUT_CONFIG.placement.startPosition.x + LAYOUT_CONFIG.placement.grid.columnWidth,
      y: LAYOUT_CONFIG.placement.startPosition.y
    };
    widgets.push({
      x: pos.x,
      y: pos.y,
      width: widgetDimensions.cache.minWidth,
      height: widgetDimensions.cache.defaultHeight
    });
  }
  
  // Feature widgets
  if (state.diagram.featureBlocks) {
    state.diagram.featureBlocks.forEach(block => {
      widgets.push({
        x: block.x,
        y: block.y,
        width: widgetDimensions.feature.minWidth,
        height: widgetDimensions.feature.defaultHeight
      });
    });
  }
  
  // Microservice widgets
  if (state.diagram.microserviceBlocks) {
    state.diagram.microserviceBlocks.forEach(block => {
      widgets.push({
        x: block.x,
        y: block.y,
        width: widgetDimensions.microservice.width,
        height: widgetDimensions.microservice.height
      });
    });
  }
  
  return widgets;
}

/**
 * Snap a position to the nearest grid cell
 */
export function snapToGrid(position) {
  return GridHelpers.snapToGrid(position);
}

/**
 * Find optimal position for a specific widget type
 */
export function findPositionForWidgetType(type, existingWidgets) {
  const dimensions = LAYOUT_CONFIG.widgets[type];
  
  if (!dimensions) {
    // Fallback to default dimensions
    return findFreePosition(existingWidgets, 400, 200);
  }
  
  return findFreePosition(
    existingWidgets,
    dimensions.width || dimensions.minWidth,
    dimensions.height || dimensions.defaultHeight
  );
}

/**
 * Calculate bounds for a set of widgets (useful for centering/framing)
 */
export function calculateBounds(widgets) {
  if (widgets.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  widgets.forEach(widget => {
    minX = Math.min(minX, widget.x);
    minY = Math.min(minY, widget.y);
    maxX = Math.max(maxX, widget.x + widget.width);
    maxY = Math.max(maxY, widget.y + widget.height);
  });
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Auto-layout widgets in a grid
 */
export function autoLayout(widgets) {
  const config = LAYOUT_CONFIG.placement;
  const layouted = [];
  
  widgets.forEach((widget, index) => {
    const row = Math.floor(index / config.grid.maxColumns);
    const col = index % config.grid.maxColumns;
    
    layouted.push({
      ...widget,
      ...GridHelpers.getCellPosition(row, col, config)
    });
  });
  
  return layouted;
}