// Drag and Drop manager - eliminates ~80 lines of duplicated drag logic

export class DragAndDropManager {
  constructor(containerSelector, options = {}) {
    this.containerSelector = containerSelector;
    this.onPositionUpdate = options.onPositionUpdate || (() => {});
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.getZoom = options.getZoom || (() => 1);
    
    this.draggedElement = null;
    this.dragOffset = { x: 0, y: 0 };
    this.initialPosition = { x: 0, y: 0 };
    this.isDragging = false;
    
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    
    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * Attach drag handlers to elements
   */
  attachToHeaders(selector) {
    const headers = document.querySelectorAll(selector);
    
    headers.forEach(header => {
      header.style.cursor = 'move';
      header.addEventListener('mousedown', (e) => this.handleMouseDown(e, header));
    });
    
    return headers.length;
  }

  /**
   * Handle mouse down event
   */
  handleMouseDown(e, header) {
    const blockId = header.getAttribute('data-block-header');
    const block = document.querySelector(`[data-block="${blockId}"]`);
    
    if (!block) return;

    this.draggedElement = block;
    this.isDragging = false;
    
    const container = document.querySelector(this.containerSelector);
    if (!container) return;

    const rect = block.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const zoom = this.getZoom();
    
    // Calculate offset from mouse to element position
    this.dragOffset.x = (e.clientX - rect.left) / zoom;
    this.dragOffset.y = (e.clientY - rect.top) / zoom;
    
    // Store initial position
    this.initialPosition.x = (rect.left - containerRect.left) / zoom;
    this.initialPosition.y = (rect.top - containerRect.top) / zoom;
    
    document.body.style.cursor = 'grabbing';
    
    // Call start callback
    this.onDragStart({
      blockId,
      element: block,
      position: this.initialPosition
    });
  }

  /**
   * Handle mouse move event
   */
  handleMouseMove(e) {
    if (!this.draggedElement) return;

    this.isDragging = true;
    
    const container = document.querySelector(this.containerSelector);
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const zoom = this.getZoom();
    
    // Calculate new position
    const newX = (e.clientX - containerRect.left) / zoom - this.dragOffset.x;
    const newY = (e.clientY - containerRect.top) / zoom - this.dragOffset.y;
    
    // Apply position
    this.draggedElement.style.left = `${newX}px`;
    this.draggedElement.style.top = `${newY}px`;
  }

  /**
   * Handle mouse up event
   */
  handleMouseUp() {
    if (!this.draggedElement) return;

    const blockId = this.draggedElement.getAttribute('data-block');
    const left = parseFloat(this.draggedElement.style.left) || 0;
    const top = parseFloat(this.draggedElement.style.top) || 0;
    
    // Only update if actually dragged
    if (this.isDragging) {
      this.onPositionUpdate(blockId, { x: left, y: top });
    }
    
    // Call end callback
    this.onDragEnd({
      blockId,
      element: this.draggedElement,
      position: { x: left, y: top },
      wasDragged: this.isDragging
    });
    
    // Reset state
    this.draggedElement = null;
    this.isDragging = false;
    document.body.style.cursor = 'default';
  }

  /**
   * Enable/disable dragging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    if (!enabled && this.draggedElement) {
      this.handleMouseUp();
    }
  }

  /**
   * Get current dragged element
   */
  getDraggedElement() {
    return this.draggedElement;
  }

  /**
   * Check if currently dragging
   */
  isDraggingNow() {
    return this.isDragging;
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    this.draggedElement = null;
    this.isDragging = false;
  }
}

/**
 * Touch support for mobile (optional enhancement)
 */
export class TouchDragManager extends DragAndDropManager {
  init() {
    super.init();
    
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  attachToHeaders(selector) {
    const count = super.attachToHeaders(selector);
    
    const headers = document.querySelectorAll(selector);
    headers.forEach(header => {
      header.addEventListener('touchstart', (e) => this.handleTouchStart(e, header));
    });
    
    return count;
  }

  handleTouchStart(e, header) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true
    });
    
    this.handleMouseDown(mouseEvent, header);
  }

  handleTouchMove(e) {
    if (!this.draggedElement || e.touches.length !== 1) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true
    });
    
    this.handleMouseMove(mouseEvent);
  }

  handleTouchEnd() {
    this.handleMouseUp();
  }

  destroy() {
    super.destroy();
    
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  }
}