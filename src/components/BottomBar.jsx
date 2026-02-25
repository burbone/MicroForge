import { h } from 'preact';
import { useStore } from '../store/store';
import { validateLeftPanel, formatErrorsForModal } from '../utils/validator';
import { generateJSON, prettyPrintJSON, downloadJSON } from '../utils/jsonGenerator';

export default function BottomBar() {
  const state = useStore();
  const setValidationErrors = useStore(state => state.setValidationErrors);
  const clearValidation = useStore(state => state.clearValidation);
  
  const handleGenerate = () => {
    try {
      // Clear previous validation
      clearValidation();
      
      // Step 1: Validate LEFT PANEL
      console.log('Validating LEFT PANEL...');
      const validation = validateLeftPanel(state);
      
      if (!validation.valid) {
        console.error('Validation failed:', validation.errors);
        
        // Save errors to store (will show in UI)
        setValidationErrors(validation.errors);
        
        // Show modal with errors
        showValidationModal(validation.errors);
        return;
      }
      
      console.log('✅ Validation passed');
      
      // Step 2: Generate JSON
      const json = generateJSON(state);
      console.log('Generated JSON:', json);
      
      // Step 3: Show preview modal
      showPreviewModal(json, state);
      
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  /**
   * Show validation errors modal
   */
  function showValidationModal(errors) {
    const errorMessages = formatErrorsForModal(errors);
    const errorCount = Object.keys(errors).length;
    
    const modal = document.createElement('div');
    modal.className = 'validation-modal';
    modal.innerHTML = `
      <div class="validation-overlay"></div>
      <div class="validation-content">
        <div class="validation-header">
          <h3>❌ Validation Failed</h3>
          <button class="validation-close">×</button>
        </div>
        <div class="validation-body">
          <p class="validation-summary">${errorCount} error(s) found. Please fix them:</p>
          <div class="validation-errors">
            ${errorMessages.map(msg => `<div class="error-item">${msg}</div>`).join('')}
          </div>
        </div>
        <div class="validation-footer">
          <button class="validation-ok">OK, I'll fix them</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const close = () => document.body.removeChild(modal);
    modal.querySelector('.validation-close').onclick = close;
    modal.querySelector('.validation-overlay').onclick = close;
    modal.querySelector('.validation-ok').onclick = close;
  }
  
  /**
   * Show JSON preview modal
   */
  function showPreviewModal(json, state) {
    const prettyJson = prettyPrintJSON(json);
    
    const modal = document.createElement('div');
    modal.className = 'json-preview-modal';
    modal.innerHTML = `
      <div class="json-preview-overlay"></div>
      <div class="json-preview-content">
        <div class="json-preview-header">
          <h3>📋 Generated Configuration</h3>
          <button class="json-preview-close">×</button>
        </div>
        <div class="json-preview-body">
          <div class="json-preview-stats">
            <div class="stat">
              <span class="stat-label">Service:</span>
              <span class="stat-value">${state.serviceType}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Model:</span>
              <span class="stat-value">${state.model}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Features:</span>
              <span class="stat-value">${state.selectedFeatures.length}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Tables:</span>
              <span class="stat-value">${state.diagram.tables.length}</span>
            </div>
          </div>
          <pre><code class="json-code">${escapeHtml(prettyJson)}</code></pre>
        </div>
        <div class="json-preview-footer">
          <button class="json-preview-copy">📋 Copy</button>
          <button class="json-preview-download">💾 Download</button>
          <button class="json-preview-send">🚀 Send to Backend</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const close = () => {
      document.body.removeChild(modal);
      // Clear validation on successful preview
      clearValidation();
    };
    
    modal.querySelector('.json-preview-close').onclick = close;
    modal.querySelector('.json-preview-overlay').onclick = close;
    
    modal.querySelector('.json-preview-copy').onclick = () => {
      navigator.clipboard.writeText(prettyJson);
      showToast('✅ Copied to clipboard!');
    };
    
    modal.querySelector('.json-preview-download').onclick = () => {
      const filename = `${state.artifact || 'microservice'}-config.json`;
      downloadJSON(json, filename);
      showToast('✅ Downloaded!');
    };
    
    modal.querySelector('.json-preview-send').onclick = async () => {
      const btn = modal.querySelector('.json-preview-send');
      const originalText = btn.textContent;
      
      try {
        btn.textContent = '⏳ Sending...';
        btn.disabled = true;
        
        // TODO: Send to backend
        // const result = await sendToBackend(json);
        
        console.log('Sending to backend:', json);
        
        // Simulate success
        setTimeout(() => {
          showToast('✅ Successfully sent to backend!');
          close();
        }, 1000);
        
      } catch (error) {
        console.error('Send failed:', error);
        showToast(`❌ Error: ${error.message}`);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };
  }
  
  /**
   * Show toast notification
   */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  return (
    <div className="bottom-bar">
      <button className="generate-btn" onClick={handleGenerate}>
        <span>🚀 Generate</span>
      </button>
    </div>
  );
}