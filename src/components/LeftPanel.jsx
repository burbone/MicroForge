import { h } from 'preact';
import { useStore } from '../store/store';

export default function LeftPanel() {
  // State
  const serviceType = useStore(state => state.serviceType);
  const group = useStore(state => state.group);
  const artifact = useStore(state => state.artifact);
  const name = useStore(state => state.name);
  const description = useStore(state => state.description);
  const packageName = useStore(state => state.packageName);
  const model = useStore(state => state.model);
  const build = useStore(state => state.build);
  const databaseEnabled = useStore(state => state.databaseEnabled);
  const database = useStore(state => state.database);
  const cacheEnabled = useStore(state => state.cacheEnabled);
  const cache = useStore(state => state.cache);
  
  // Validation state
  const validationErrors = useStore(state => state.validationErrors);
  const showValidation = useStore(state => state.showValidation);
  
  // Actions
  const setServiceType = useStore(state => state.setServiceType);
  const setGroup = useStore(state => state.setGroup);
  const setArtifact = useStore(state => state.setArtifact);
  const setName = useStore(state => state.setName);
  const setDescription = useStore(state => state.setDescription);
  const setPackageName = useStore(state => state.setPackageName);
  const setModel = useStore(state => state.setModel);
  const setBuild = useStore(state => state.setBuild);
  const toggleDatabase = useStore(state => state.toggleDatabase);
  const setDatabase = useStore(state => state.setDatabase);
  const toggleCache = useStore(state => state.toggleCache);
  const setCache = useStore(state => state.setCache);
  
  // Helper: check if field is valid (has value and no error)
  const isValid = (fieldName, value) => {
    return showValidation && value && !validationErrors[fieldName];
  };
  
  // Helper: check if field has error
  const hasError = (fieldName) => {
    return showValidation && validationErrors[fieldName];
  };

  return (
    <div className="left-panel">
      <div className="header-section">
        <h1>Microservice generator</h1>
        
        <div className="form-group">
          <label htmlFor="service-type">Service Type</label>
          <select 
            className={`service-select ${hasError('serviceType') ? 'error' : ''} ${isValid('serviceType', serviceType) ? 'valid' : ''}`}
            id="service-type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">Select type...</option>
            <option value="auth">auth service</option>
            <option value="test">test</option>
          </select>
          {hasError('serviceType') && (
            <span className="error-message">⚠️ {validationErrors.serviceType}</span>
          )}
        </div>
      </div>
      
      {serviceType && (
        <>
          <div className="form-section">
            <h2>Project Metadata</h2>
            
            <div className="form-group">
              <label htmlFor="group">
                Group
                {isValid('group', group) && <span className="success-icon">✓</span>}
              </label>
              <input 
                type="text" 
                id="group"
                className={hasError('group') ? 'error' : isValid('group', group) ? 'valid' : ''}
                placeholder="com.example"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />
              {hasError('group') && (
                <span className="error-message">⚠️ {validationErrors.group}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="artifact">
                Artifact
                {isValid('artifact', artifact) && <span className="success-icon">✓</span>}
              </label>
              <input 
                type="text" 
                id="artifact"
                className={hasError('artifact') ? 'error' : isValid('artifact', artifact) ? 'valid' : ''}
                placeholder="demo"
                value={artifact}
                onChange={(e) => setArtifact(e.target.value)}
              />
              {hasError('artifact') && (
                <span className="error-message">⚠️ {validationErrors.artifact}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="name">
                Name
                {isValid('name', name) && <span className="success-icon">✓</span>}
              </label>
              <input 
                type="text" 
                id="name"
                className={hasError('name') ? 'error' : isValid('name', name) ? 'valid' : ''}
                placeholder="demo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {hasError('name') && (
                <span className="error-message">⚠️ {validationErrors.name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <input 
                type="text" 
                id="description"
                placeholder="Demo project for Spring Boot"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="package-name">
                Package name
                {isValid('packageName', packageName) && <span className="success-icon">✓</span>}
              </label>
              <input 
                type="text" 
                id="package-name"
                className={hasError('packageName') ? 'error' : isValid('packageName', packageName) ? 'valid' : ''}
                placeholder="com.example.demo"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
              />
              {hasError('packageName') && (
                <span className="error-message">⚠️ {validationErrors.packageName}</span>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h2>
              Model
              {isValid('model', model) && <span className="success-icon">✓</span>}
            </h2>
            <div className={`button-group ${hasError('model') ? 'error' : isValid('model', model) ? 'valid' : ''}`}>
              <button 
                className={`option-btn ${model === 'synchronous' ? 'selected' : ''}`}
                onClick={() => setModel('synchronous')}
              >
                Synchronous (Blocking)
              </button>
              <button 
                className={`option-btn ${model === 'async' ? 'selected' : ''}`}
                onClick={() => setModel('async')}
              >
                Asynchronous (CompletableFuture)
              </button>
              <button 
                className={`option-btn ${model === 'reactive' ? 'selected' : ''}`}
                onClick={() => setModel('reactive')}
              >
                Reactive (WebFlux + R2DBC)
              </button>
              <button 
                className={`option-btn ${model === 'virtual' ? 'selected' : ''}`}
                onClick={() => setModel('virtual')}
              >
                Virtual Threads (Java 21+)
              </button>
            </div>
            {hasError('model') && (
              <span className="error-message">⚠️ {validationErrors.model}</span>
            )}
          </div>
          
          <div className="form-section">
            <h2>
              Build
              {isValid('build', build) && <span className="success-icon">✓</span>}
            </h2>
            <div className={`button-group ${hasError('build') ? 'error' : isValid('build', build) ? 'valid' : ''}`}>
              <button 
                className={`option-btn ${build === 'gradle' ? 'selected' : ''}`}
                onClick={() => setBuild('gradle')}
              >
                Gradle
              </button>
              <button 
                className={`option-btn ${build === 'maven' ? 'selected' : ''}`}
                onClick={() => setBuild('maven')}
              >
                Maven
              </button>
            </div>
            {hasError('build') && (
              <span className="error-message">⚠️ {validationErrors.build}</span>
            )}
          </div>
          
          <div className="form-section">
            <div className="toggle-header">
              <button 
                className={`toggle-btn ${cacheEnabled ? 'active' : ''}`}
                onClick={toggleCache}
              >
                <span className="toggle-circle"></span>
                <span className="toggle-label">CACHE</span>
              </button>
            </div>
            {cacheEnabled && (
              <div className="sub-options">
                <div className="button-group">
                  <button 
                    className={`option-btn ${cache === 'redis' ? 'selected' : ''}`}
                    onClick={() => setCache('redis')}
                  >
                    Redis
                  </button>
                  <button 
                    className={`option-btn ${cache === 'in-memory' ? 'selected' : ''}`}
                    onClick={() => setCache('in-memory')}
                  >
                    In-Memory
                  </button>
                  <button 
                    className={`option-btn ${cache === 'caffeine' ? 'selected' : ''}`}
                    onClick={() => setCache('caffeine')}
                  >
                    Caffeine
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-section">
            <div className="toggle-header">
              <button 
                className={`toggle-btn ${databaseEnabled ? 'active' : ''}`}
                onClick={toggleDatabase}
              >
                <span className="toggle-circle"></span>
                <span className="toggle-label">DATABASE</span>
              </button>
            </div>
            {databaseEnabled && (
              <div className="sub-options">
                <div className="button-group">
                  <button 
                    className={`option-btn ${database === 'postgresql' ? 'selected' : ''}`}
                    onClick={() => setDatabase('postgresql')}
                  >
                    PostgreSQL
                  </button>
                  <button 
                    className={`option-btn ${database === 'mysql' ? 'selected' : ''}`}
                    onClick={() => setDatabase('mysql')}
                  >
                    MySQL
                  </button>
                  <button 
                    className={`option-btn ${database === 'h2' ? 'selected' : ''}`}
                    onClick={() => setDatabase('h2')}
                  >
                    H2
                  </button>
                  <button 
                    className={`option-btn ${database === 'mongodb' ? 'selected' : ''}`}
                    onClick={() => setDatabase('mongodb')}
                  >
                    MongoDB
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}