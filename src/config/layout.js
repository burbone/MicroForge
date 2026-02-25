// Layout configuration - eliminates magic numbers throughout the codebase

export const LAYOUT_CONFIG = {
  // Placement algorithm settings
  placement: {
    margin: 50,
    startPosition: {
      x: 50,
      y: 50
    },
    grid: {
      columnWidth: 450,
      rowHeight: 300,
      maxColumns: 3,
      maxRows: 20
    }
  },

  // Zoom settings
  zoom: {
    min: 0.1,
    max: 3,
    default: 1,
    step: 0.1,
    wheelSensitivity: 0.005
  },

  // Pan settings
  pan: {
    default: { x: 0, y: 0 },
    wheelSpeed: 1
  },

  // Widget dimensions
  widgets: {
    database: {
      minWidth: 400,
      defaultHeight: 300
    },
    cache: {
      minWidth: 400,
      defaultHeight: 250
    },
    feature: {
      minWidth: 400,
      defaultHeight: 200
    },
    microservice: {
      width: 180,
      height: 100
    }
  },

  // Diagram container
  diagram: {
    minWidth: 800,
    minHeight: 600
  }
};

// Grid helper functions
export const GridHelpers = {
  /**
   * Get position for a specific grid cell
   */
  getCellPosition(row, col, config = LAYOUT_CONFIG.placement) {
    return {
      x: config.startPosition.x + col * config.grid.columnWidth,
      y: config.startPosition.y + row * config.grid.rowHeight
    };
  },

  /**
   * Find the nearest grid cell to a position
   */
  snapToGrid(position, config = LAYOUT_CONFIG.placement) {
    const col = Math.round((position.x - config.startPosition.x) / config.grid.columnWidth);
    const row = Math.round((position.y - config.startPosition.y) / config.grid.rowHeight);
    
    return this.getCellPosition(row, col, config);
  },

  /**
   * Check if position is within grid bounds
   */
  isInBounds(row, col, config = LAYOUT_CONFIG.placement) {
    return row >= 0 && row < config.grid.maxRows &&
           col >= 0 && col < config.grid.maxColumns;
  }
};

// Zoom helper functions
export const ZoomHelpers = {
  /**
   * Clamp zoom value to valid range
   */
  clamp(zoom, config = LAYOUT_CONFIG.zoom) {
    return Math.max(config.min, Math.min(config.max, zoom));
  },

  /**
   * Calculate new zoom from wheel delta
   */
  fromWheelDelta(currentZoom, delta, config = LAYOUT_CONFIG.zoom) {
    const change = -delta * config.wheelSensitivity;
    return this.clamp(currentZoom + change, config);
  },

  /**
   * Format zoom as percentage
   */
  toPercentage(zoom) {
    return Math.round(zoom * 100);
  },

  /**
   * Parse percentage to zoom value
   */
  fromPercentage(percentage, config = LAYOUT_CONFIG.zoom) {
    return this.clamp(percentage / 100, config);
  }
};