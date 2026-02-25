// Validator - validates LEFT PANEL only (simplified version)

/**
 * Validate LEFT PANEL fields
 * @param {Object} state - Zustand store state
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export function validateLeftPanel(state) {
  const errors = {};
  
  // Regex: английские буквы, цифры, точки, пробелы, дефисы
  const allowedChars = /^[a-zA-Z0-9 .-]+$/;
  
  // Service Type
  if (!state.serviceType || state.serviceType.trim() === '') {
    errors.serviceType = 'Select service type';
  }
  
  // Group
  if (!state.group || state.group.trim() === '') {
    errors.group = 'Group is required';
  } else if (!allowedChars.test(state.group)) {
    errors.group = 'Only English, numbers, dots, spaces and dashes allowed';
  }
  
  // Artifact
  if (!state.artifact || state.artifact.trim() === '') {
    errors.artifact = 'Artifact is required';
  } else if (!allowedChars.test(state.artifact)) {
    errors.artifact = 'Only English, numbers, dots, spaces and dashes allowed';
  }
  
  // Name
  if (!state.name || state.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (!allowedChars.test(state.name)) {
    errors.name = 'Only English, numbers, dots, spaces and dashes allowed';
  }
  
  // Description - НЕ обязательно, пропускаем
  
  // Package name
  if (!state.packageName || state.packageName.trim() === '') {
    errors.packageName = 'Package name is required';
  } else if (!allowedChars.test(state.packageName)) {
    errors.packageName = 'Only English, numbers, dots, spaces and dashes allowed';
  }
  
  // Model
  if (!state.model) {
    errors.model = 'Select a model';
  }
  
  // Build
  if (!state.build) {
    errors.build = 'Select a build tool';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format errors for modal display
 */
export function formatErrorsForModal(errors) {
  const messages = [];
  
  if (errors.serviceType) messages.push(`• ${errors.serviceType}`);
  if (errors.group) messages.push(`• Group: ${errors.group}`);
  if (errors.artifact) messages.push(`• Artifact: ${errors.artifact}`);
  if (errors.name) messages.push(`• Name: ${errors.name}`);
  if (errors.packageName) messages.push(`• Package name: ${errors.packageName}`);
  if (errors.model) messages.push(`• ${errors.model}`);
  if (errors.build) messages.push(`• ${errors.build}`);
  
  return messages;
}