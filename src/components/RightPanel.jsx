import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useStore } from '../store/store.js';
import { renderDiagram } from '../utils/diagramRenderer.js';
import { LAYOUT_CONFIG } from '../config/layout.js';
import { initDatabaseHandlers } from '../utils/databaseHandlers.js';
import { initCacheHandlers } from '../utils/cacheHandlers.js';
import { initFeatureHandlers } from '../utils/featureHandlers.js';

export default function RightPanel() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const zoom = useStore(state => state.zoom);
  const databaseEnabled = useStore(state => state.databaseEnabled);
  const database = useStore(state => state.database);
  const cacheEnabled = useStore(state => state.cacheEnabled);
  const cache = useStore(state => state.cache);
  const selectedFeatures = useStore(state => state.selectedFeatures);
  const diagram = useStore(state => state.diagram);
  
  useEffect(() => {
    const cleanupZoom = initZoomControls();
    const cleanupDiagram = initDiagramControls();
    
    return () => {
      cleanupZoom && cleanupZoom();
      cleanupDiagram && cleanupDiagram();
    };
  }, []);
  
  useEffect(() => {
    updateDiagram();
  }, [databaseEnabled, database, cacheEnabled, cache, selectedFeatures, diagram.tables, diagram.cacheKeys]);
  
  const hasCacheOrDb = (cacheEnabled && cache) || (databaseEnabled && database);
  const hasFeatures = selectedFeatures && selectedFeatures.length > 0;
  const showContent = hasCacheOrDb || hasFeatures;
  
  // ============================================================================
  // Zoom Controls
  // ============================================================================
  
  function initZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    if (!zoomInBtn || !zoomOutBtn) return;
    
    const handleZoomIn = () => {
      const currentZoom = useStore.getState().zoom;
      const newZoom = Math.min(LAYOUT_CONFIG.zoom.max, currentZoom + LAYOUT_CONFIG.zoom.step);
      useStore.setState({ zoom: newZoom });
      updateZoom();
    };
    
    const handleZoomOut = () => {
      const currentZoom = useStore.getState().zoom;
      const newZoom = Math.max(LAYOUT_CONFIG.zoom.min, currentZoom - LAYOUT_CONFIG.zoom.step);
      useStore.setState({ zoom: newZoom });
      updateZoom();
    };
    
    zoomInBtn.onclick = handleZoomIn;
    zoomOutBtn.onclick = handleZoomOut;
    
    return () => {
      zoomInBtn.onclick = null;
      zoomOutBtn.onclick = null;
    };
  }
  
  function updateZoom() {
    const state = useStore.getState();
    const diagramContainer = document.querySelector('.diagram-container');
    const zoomLevelSpan = document.getElementById('zoom-level');
    
    if (diagramContainer) {
      diagramContainer.style.transform = `scale(${state.zoom}) translate(${state.diagram.pan.x}px, ${state.diagram.pan.y}px)`;
    }
    
    if (zoomLevelSpan) {
      zoomLevelSpan.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  }
  
  // ============================================================================
  // Diagram Controls (Pan + Zoom with wheel + Touch)
  // ============================================================================
  
  function initDiagramControls() {
    const widgetContainer = containerRef.current;
    const widgetContent = contentRef.current;
    
    if (!widgetContainer || !widgetContent) return;
    
    let isPanning = false;
    let startX, startY;
    let lastTouchDistance = 0;
    let isPinching = false;
    
    // Wheel zoom (Ctrl + wheel) and pan (wheel without Ctrl)
    const handleWheel = (e) => {
      e.preventDefault();
      const state = useStore.getState();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * LAYOUT_CONFIG.zoom.wheelSensitivity;
        const newZoom = Math.max(
          LAYOUT_CONFIG.zoom.min, 
          Math.min(LAYOUT_CONFIG.zoom.max, state.zoom + delta)
        );
        
        if (newZoom !== state.zoom) {
          useStore.setState({ zoom: newZoom });
          updateZoom();
        }
      } else {
        // Pan
        useStore.setState({
          diagram: {
            ...state.diagram,
            pan: {
              x: state.diagram.pan.x - e.deltaX * LAYOUT_CONFIG.pan.wheelSpeed,
              y: state.diagram.pan.y - e.deltaY * LAYOUT_CONFIG.pan.wheelSpeed
            }
          }
        });
        updateZoom();
      }
    };
    
    // Pan with mouse drag on empty space
    const handleMouseDown = (e) => {
      if (e.target === widgetContainer || e.target === widgetContent || e.target.classList.contains('diagram-container')) {
        isPanning = true;
        const state = useStore.getState();
        startX = e.clientX - state.diagram.pan.x;
        startY = e.clientY - state.diagram.pan.y;
        widgetContainer.style.cursor = 'grabbing';
      }
    };
    
    const handleMouseMove = (e) => {
      if (isPanning) {
        const state = useStore.getState();
        useStore.setState({
          diagram: {
            ...state.diagram,
            pan: {
              x: e.clientX - startX,
              y: e.clientY - startY
            }
          }
        });
        updateZoom();
      }
    };
    
    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        widgetContainer.style.cursor = 'grab';
      }
    };
    
    // Touch gestures - pinch to zoom
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        lastTouchDistance = getTouchDistance(e.touches);
      }
    };
    
    const handleTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        const delta = (currentDistance - lastTouchDistance) * 0.01;
        
        const state = useStore.getState();
        const newZoom = Math.max(
          LAYOUT_CONFIG.zoom.min, 
          Math.min(LAYOUT_CONFIG.zoom.max, state.zoom + delta)
        );
        
        if (newZoom !== state.zoom) {
          useStore.setState({ zoom: newZoom });
          updateZoom();
        }
        
        lastTouchDistance = currentDistance;
      }
    };
    
    const handleTouchEnd = () => {
      isPinching = false;
    };
    
    function getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    
    widgetContainer.addEventListener('wheel', handleWheel, { passive: false });
    widgetContainer.addEventListener('mousedown', handleMouseDown);
    widgetContainer.addEventListener('touchstart', handleTouchStart);
    widgetContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    widgetContainer.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      widgetContainer.removeEventListener('wheel', handleWheel);
      widgetContainer.removeEventListener('mousedown', handleMouseDown);
      widgetContainer.removeEventListener('touchstart', handleTouchStart);
      widgetContainer.removeEventListener('touchmove', handleTouchMove);
      widgetContainer.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
  
  // ============================================================================
  // Diagram Rendering
  // ============================================================================
  
  function updateDiagram() {
    const state = useStore.getState();
    const widgetContent = contentRef.current;
    
    if (!widgetContent) return;
    
    let containerStyle = '';
    if (state.zoom !== 1 || state.diagram.pan.x !== 0 || state.diagram.pan.y !== 0) {
      containerStyle = `transform: scale(${state.zoom}) translate(${state.diagram.pan.x}px, ${state.diagram.pan.y}px);`;
    }
    
    let html = `<div class="diagram-container" style="${containerStyle}">`;
    
    if (showContent) {
      html += renderDiagram(state);
    } else {
      html += '<div class="diagram-empty">Configure your service to see the diagram</div>';
    }
    
    html += '</div>';
    
    // Create DOM elements instead of innerHTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Clear and append
    while (widgetContent.firstChild) {
      widgetContent.removeChild(widgetContent.firstChild);
    }
    
    while (tempDiv.firstChild) {
      widgetContent.appendChild(tempDiv.firstChild);
    }
    
    setTimeout(() => {
      initDiagramHandlers();
      initDatabaseHandlers(updateDiagram);
      initCacheHandlers(updateDiagram);
      initFeatureHandlers(updateDiagram);
    }, 0);
  }
  
  // ============================================================================
  // Drag & Drop with Collision Detection + Snap
  // ============================================================================
  
  function initDiagramHandlers() {
    const MARGIN = LAYOUT_CONFIG.placement.margin;
    const SNAP_THRESHOLD = 15;
    
    let draggedBlock = null;
    let dragOffset = { x: 0, y: 0 };
    
    // Helper: Get block bounds
    function getBlockBounds(block) {
      if (!block) return null;
      
      const rect = block.getBoundingClientRect();
      const containerRect = document.querySelector('.diagram-container').getBoundingClientRect();
      const state = useStore.getState();
      const zoom = state.zoom || 1;
      
      return {
        left: (rect.left - containerRect.left) / zoom,
        top: (rect.top - containerRect.top) / zoom,
        right: (rect.right - containerRect.left) / zoom,
        bottom: (rect.bottom - containerRect.top) / zoom,
        centerX: (rect.left + rect.width / 2 - containerRect.left) / zoom,
        centerY: (rect.top + rect.height / 2 - containerRect.top) / zoom,
        width: rect.width / zoom,
        height: rect.height / zoom
      };
    }
    
    // Helper: Get all blocks except current
    function getAllBlockBounds(excludeBlock) {
      const blocks = [];
      const allBlocks = document.querySelectorAll('[data-block]');
      
      allBlocks.forEach(block => {
        if (block !== excludeBlock) {
          const bounds = getBlockBounds(block);
          if (bounds) blocks.push(bounds);
        }
      });
      
      return blocks;
    }
    
    // Helper: Snap to center (магнит)
    function snapToCenter(x, y, width, height, excludeBlock) {
      const blocks = getAllBlockBounds(excludeBlock);
      
      const currentCenterX = x + width / 2;
      const currentCenterY = y + height / 2;
      
      let snappedX = x;
      let snappedY = y;
      
      for (const b of blocks) {
        // Vertical center snap
        const verticalCenterDist = Math.abs(currentCenterX - b.centerX);
        if (verticalCenterDist < SNAP_THRESHOLD) {
          snappedX = b.centerX - width / 2;
        }
        
        // Horizontal center snap
        const horizontalCenterDist = Math.abs(currentCenterY - b.centerY);
        if (horizontalCenterDist < SNAP_THRESHOLD) {
          snappedY = b.centerY - height / 2;
        }
      }
      
      return { x: snappedX, y: snappedY };
    }
    
    // Helper: Check and resolve collision
    function resolveCollision(x, y, width, height, excludeBlock) {
      const blocks = getAllBlockBounds(excludeBlock);
      
      for (const b of blocks) {
        // Check if too close or overlapping
        const distanceRight = b.left - (x + width);
        const distanceLeft = x - b.right;
        const distanceBottom = b.top - (y + height);
        const distanceTop = y - b.bottom;
        
        const overlapX = !(x + width < b.left || x > b.right);
        const overlapY = !(y + height < b.top || y > b.bottom);
        
        // If overlapping on X axis, push on Y axis
        if (overlapX) {
          if (distanceBottom >= 0 && distanceBottom < MARGIN) {
            y = b.top - height - MARGIN;
          } else if (distanceTop >= 0 && distanceTop < MARGIN) {
            y = b.bottom + MARGIN;
          } else if (distanceBottom < 0 && distanceTop < 0) {
            // Complete overlap - choose nearest side
            if (Math.abs(distanceBottom) < Math.abs(distanceTop)) {
              y = b.top - height - MARGIN;
            } else {
              y = b.bottom + MARGIN;
            }
          }
        }
        
        // If overlapping on Y axis, push on X axis
        if (overlapY) {
          if (distanceRight >= 0 && distanceRight < MARGIN) {
            x = b.left - width - MARGIN;
          } else if (distanceLeft >= 0 && distanceLeft < MARGIN) {
            x = b.right + MARGIN;
          } else if (distanceRight < 0 && distanceLeft < 0) {
            // Complete overlap - choose nearest side
            if (Math.abs(distanceRight) < Math.abs(distanceLeft)) {
              x = b.left - width - MARGIN;
            } else {
              x = b.right + MARGIN;
            }
          }
        }
      }
      
      return { x, y };
    }
    
    // Attach drag handlers to all block headers
    const headers = document.querySelectorAll('[data-block-header]');
    
    headers.forEach(header => {
      header.style.cursor = 'move';
      
      header.addEventListener('mousedown', (e) => {
        const blockId = header.getAttribute('data-block-header');
        const block = document.querySelector(`[data-block="${blockId}"]`);
        
        if (!block) return;
        
        draggedBlock = block;
        
        const rect = block.getBoundingClientRect();
        const containerRect = document.querySelector('.diagram-container').getBoundingClientRect();
        const state = useStore.getState();
        const zoom = state.zoom || 1;
        
        dragOffset.x = (e.clientX - rect.left) / zoom;
        dragOffset.y = (e.clientY - rect.top) / zoom;
        
        document.body.style.cursor = 'grabbing';
      });
    });
    
    // Mouse move - drag with snap
    const handleMouseMove = (e) => {
      if (draggedBlock) {
        const containerRect = document.querySelector('.diagram-container').getBoundingClientRect();
        const state = useStore.getState();
        const zoom = state.zoom || 1;
        
        let x = (e.clientX - containerRect.left) / zoom - dragOffset.x;
        let y = (e.clientY - containerRect.top) / zoom - dragOffset.y;
        
        const rect = draggedBlock.getBoundingClientRect();
        const width = rect.width / zoom;
        const height = rect.height / zoom;
        
        // Apply snap to center
        const snapped = snapToCenter(x, y, width, height, draggedBlock);
        
        draggedBlock.style.left = `${snapped.x}px`;
        draggedBlock.style.top = `${snapped.y}px`;
      }
    };
    
    // Mouse up - save position with collision resolution
    const handleMouseUp = () => {
      if (draggedBlock) {
        console.log("🖱️ Dragging block:", draggedBlock.getAttribute("data-block"));
        const blockId = draggedBlock.getAttribute('data-block');
        let x = parseFloat(draggedBlock.style.left || 0);
        let y = parseFloat(draggedBlock.style.top || 0);
        
        const rect = draggedBlock.getBoundingClientRect();
        const state = useStore.getState();
        const zoom = state.zoom || 1;
        const width = rect.width / zoom;
        const height = rect.height / zoom;
        
        // Apply collision resolution
        const resolved = resolveCollision(x, y, width, height, draggedBlock);
        
        draggedBlock.style.left = `${resolved.x}px`;
        draggedBlock.style.top = `${resolved.y}px`;
        
        // Save position to store
        const positionKey = `${blockId}Position`;
        useStore.setState({
          diagram: {
            ...state.diagram,
            [positionKey]: { x: resolved.x, y: resolved.y }
          }
        });
        
        draggedBlock = null;
        document.body.style.cursor = 'default';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  return (
    <div className="right-panel">
      <div className="widget-container" ref={containerRef}>
        <div className="widget-content" id="widget-content" ref={contentRef}></div>
      </div>
      <div className="zoom-controls">
        <button id="zoom-out">−</button>
        <span id="zoom-level">{Math.round(zoom * 100)}%</span>
        <button id="zoom-in">+</button>
      </div>
    </div>
  );
}