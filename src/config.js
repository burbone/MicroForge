// Configuration constants for microservice generator

// ============================================================================
// Redis Configuration
// ============================================================================

export const REDIS_TYPES = [
    'String',
    'Hash',
    'List',
    'Set',
    'Sorted Set',
    'JSON',
    'Stream'
];

export const REDIS_SERIALIZATION_FORMATS = [
    'JSON',
    'Protobuf',
    'Avro',
    'MessagePack',
    'String'
];

export const REDIS_COMPRESSION_TYPES = [
    'None',
    'Gzip',
    'Snappy',
    'LZ4'
];

export const REDIS_EVICTION_POLICIES = [
    'noeviction',
    'allkeys-lru',
    'volatile-lru',
    'allkeys-lfu',
    'volatile-lfu',
    'allkeys-random',
    'volatile-random',
    'volatile-ttl'
];

export const REDIS_PERSISTENCE_STRATEGIES = [
    'None',
    'RDB',
    'AOF',
    'RDB + AOF'
];

export const REDIS_EXPIRE_STRATEGIES = [
    'On Write',
    'On Read',
    'Background'
];

// ============================================================================
// In-Memory Cache Configuration
// ============================================================================

export const INMEMORY_EVICTION_POLICIES = [
    'LRU',
    'LFU',
    'FIFO'
];

// ============================================================================
// Database Configuration
// ============================================================================

export const SQL_TYPES = {
    string: [
        'VARCHAR(255)',
        'TEXT',
        'CHAR(50)',
        'LONGTEXT'
    ],
    numeric: [
        'INT',
        'BIGINT',
        'DECIMAL(10,2)',
        'DOUBLE',
        'FLOAT',
        'SMALLINT',
        'TINYINT'
    ],
    datetime: [
        'TIMESTAMP',
        'DATE',
        'DATETIME',
        'TIME'
    ],
    boolean: [
        'BOOLEAN',
        'BIT'
    ],
    binary: [
        'BLOB',
        'LONGBLOB',
        'BINARY',
        'VARBINARY'
    ],
    json: [
        'JSON',
        'JSONB'
    ]
};

export const MONGODB_TYPES = [
    'String',
    'Number',
    'Boolean',
    'Date',
    'Array',
    'Object',
    'ObjectId',
    'Binary',
    'Decimal128',
    'Mixed'
];

export const INDEX_TYPES = [
    'BTREE',
    'HASH',
    'FULLTEXT',
    'SPATIAL'
];

export const ON_DELETE_ACTIONS = [
    'CASCADE',
    'SET NULL',
    'NO ACTION',
    'RESTRICT'
];

export const ON_UPDATE_ACTIONS = [
    'CASCADE',
    'SET NULL',
    'NO ACTION',
    'RESTRICT'
];

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_VALUES = {
    redis: {
        key: {
            pattern: '',
            type: 'String',
            ttl: null,
            expireStrategy: 'On Write',
            serialization: 'JSON',
            compression: 'None',
            evictionPolicy: 'noeviction',
            maxMemory: null
        },
        settings: {
            host: 'localhost',
            port: 6379,
            maxMemory: '256mb',
            defaultTTL: 3600,
            globalEvictionPolicy: 'noeviction',
            persistence: 'None',
            maxConnections: 10000,
            timeout: 0
        }
    },
    inMemory: {
        key: {
            name: '',
            ttl: null
        },
        settings: {
            maxSize: 10000,
            defaultTTL: 3600,
            evictionPolicy: 'LRU'
        }
    },
    caffeine: {
        cache: {
            name: '',
            maxSize: null,
            expireAfterWrite: null,
            expireAfterAccess: null,
            refreshAfterWrite: null,
            weakKeys: false,
            weakValues: false,
            recordStats: false
        }
    },
    database: {
        table: {
            name: '',
            fields: [],
            position: { x: 50, y: 50 }
        },
        field: {
            name: '',
            type: 'VARCHAR(255)',
            nullable: true,
            unique: false,
            primaryKey: false,
            autoIncrement: false,
            defaultValue: '',
            comment: '',
            foreignKey: null,
            index: false,
            indexType: 'BTREE',
            validation: {
                minLength: null,
                maxLength: null,
                pattern: '',
                min: null,
                max: null
            }
        }
    },
    positions: {
        cache: { x: 500, y: 50 },
        inMemory: { x: 500, y: 250 },
        caffeine: { x: 500, y: 450 }
    }
};

// ============================================================================
// UI Constants
// ============================================================================

export const BLOCK_DIMENSIONS = {
    database: { width: 400, height: 400 },
    cache: { width: 400, height: 300 },
    feature: { width: 350, height: 250 }
};

export const COLLISION_MARGIN = 50;

export const ZOOM_LIMITS = {
    min: 0.5,
    max: 3,
    step: 0.1
};

// ============================================================================
// Feature Icons and Colors
// ============================================================================

export const FEATURE_ICONS = {
    'Security': '🔒',
    'Logging': '📝',
    'Validation': '✅',
    'Exception Handling': '⚠️',
    'API Documentation': '📚',
    'Health Checks': '❤️',
    'Metrics': '📊',
    'Caching': '⚡'
};

export const FEATURE_COLORS = {
    'Security': '#ff4444',
    'Logging': '#44ff44',
    'Validation': '#4444ff',
    'Exception Handling': '#ffaa00',
    'API Documentation': '#00aaff',
    'Health Checks': '#ff00aa',
    'Metrics': '#aaff00',
    'Caching': '#aa00ff'
};
// ============================================================================
// Hierarchical Widgets Configuration
// ============================================================================

export const HIERARCHICAL_CONFIG = {
    'authentication': {
        name: 'AUTHENTICATION',
        icon: '🔐',
        children: [
            { id: 'email-password-login', name: 'Email/Password login', children: [] },
            { id: 'phone-sms-login', name: 'Phone/SMS login', children: [] },
            { id: 'magic-links', name: 'Magic links', children: [] },
            { id: 'social-login', name: 'Social login (OAuth2 Client)', children: [] },
            { id: 'account-merging', name: 'Account merging', requiresAny: ['social-login'], note: 'need Social login', children: [] },
            { id: 'ldap', name: 'LDAP', children: [] },
            { id: 'saml', name: 'SAML', children: [] },
            { id: 'webauthn', name: 'WebAuthn/FIDO2', children: [] },
            { id: 'certificate-mtls', name: 'Certificate-based (mTLS)', children: [] },
            { id: 'pin-pattern-login', name: 'PIN/Pattern login', children: [] },
            { id: 'passwordless-auth', name: 'Passwordless authentication', children: [] },
            { id: 'biometric-auth', name: 'Biometric authentication', children: [] },
            { id: 'anonymous-auth', name: 'Anonymous authentication', children: [] },
            { id: 'api-key-auth', name: 'API Key authentication', children: [] },
            { id: 'bearer-token-auth', name: 'Bearer token authentication', children: [] },
            { id: 'basic-auth-support', name: 'Basic Auth support', children: [] }
        ]
    },
    'token-system': {
        name: 'TOKEN SYSTEM',
        icon: '🎫',
        selectionType: 'single',
        note: 'выбрать РОВНО один',
        children: [
            { id: 'jwt-tokens', name: 'JWT (access + refresh)', mutuallyExclusive: 'token-system', children: [] },
            { id: 'opaque-tokens', name: 'Opaque tokens', mutuallyExclusive: 'token-system', children: [] }
        ]
    },
    'token-features': {
        name: 'TOKEN FEATURES',
        icon: '🔧',
        children: [
            { id: 'token-rotation', name: 'Token rotation', children: [] },
            { id: 'token-family-tracking', name: 'Token family tracking', children: [] },
            { id: 'sliding-sessions', name: 'Sliding sessions', children: [] },
            { id: 'concurrent-session-limits', name: 'Concurrent session limits', children: [] },
            { id: 'token-scopes', name: 'Token scopes (fine-grained)', children: [] },
            { id: 'refresh-token-reuse-detection', name: 'Refresh token reuse detection', children: [] },
            { id: 'token-binding', name: 'Token binding', children: [] },
            { id: 'jwt-claims-validation', name: 'JWT claims validation', children: [] }
        ]
    },
    'registration': {
        name: 'REGISTRATION',
        icon: '📝',
        children: [
            { id: 'email-verification', name: 'Email verification' },
            { id: 'phone-verification', name: 'Phone verification' },
            { id: 'invite-only-registration', name: 'Invite-only registration' },
            { id: 'registration-approval-workflow', name: 'Registration approval workflow' }
        ]
    },
    'password-management': {
        name: 'PASSWORD MANAGEMENT',
        icon: '🔑',
        requiresAny: ['email-password-login'],
        note: 'need Email or Phone login',
        children: [
            { id: 'password-reset', name: 'Password reset', children: [] },
            { id: 'password-change', name: 'Password change', children: [] },
            { id: 'password-history', name: 'Password history', children: [] },
            { id: 'password-policies', name: 'Password policies', children: [] },
            { id: 'password-strength-meter', name: 'Password strength meter', children: [] },
            { id: 'compromised-password-check', name: 'Compromised password check', children: [] }
        ]
    },
    'mfa': {
        name: 'MFA',
        icon: '🔒',
        children: [
            { id: 'totp', name: 'TOTP (Google Authenticator)', children: [] },
            { id: 'backup-codes', name: 'Backup codes', requiresAny: ['totp'], note: 'need TOTP', children: [] },
            { id: 'sms-codes', name: 'SMS codes', children: [] },
            { id: 'email-codes', name: 'Email codes', children: [] },
            { id: 'push-notifications', name: 'Push notifications', children: [] },
            { id: 'hardware-tokens', name: 'Hardware tokens (YubiKey, U2F)', children: [] },
            { id: 'recovery-email', name: 'Recovery email', children: [] },
            { id: 'trusted-devices', name: 'Trusted devices', children: [] },
            { id: 'mfa-grace-period', name: 'MFA grace period', children: [] },
            { id: 'adaptive-mfa', name: 'Adaptive MFA', children: [] },
            { id: 'risk-based-auth', name: 'Risk-based authentication', children: [] }
        ]
    },
    'authorization': {
        name: 'AUTHORIZATION',
        icon: '✅',
        children: [
            {
                id: 'rbac',
                name: 'RBAC',
                icon: '🎭',
                children: [
                    { id: 'hierarchical-roles', name: 'Hierarchical roles' },
                    { id: 'temporal-permissions', name: 'Temporal permissions' },
                    { id: 'dynamic-roles', name: 'Dynamic roles' },
                    { id: 'context-aware-permissions', name: 'Context-aware permissions' },
                    { id: 'time-based-access', name: 'Time-based access' },
                    { id: 'permission-delegation', name: 'Permission delegation' },
                    { id: 'policy-inheritance', name: 'Policy inheritance' }
                ]
            },
            {
                id: 'abac',
                name: 'ABAC',
                icon: '📋',
                children: [
                    { id: 'dynamic-attributes', name: 'Dynamic attributes' },
                    { id: 'policy-versioning', name: 'Policy versioning' },
                    { id: 'conflict-resolution', name: 'Conflict resolution' }
                ]
            },
            { id: 'rebac', name: 'Resource-based access control (ReBAC)', children: [] },
            { id: 'relationship-based-ac', name: 'Relationship-based access control', children: [] },
            { id: 'fine-grained-permissions', name: 'Fine-grained permissions', children: [] }
        ]
    },
    'audit-security': {
        name: 'AUDIT & SECURITY',
        icon: '🛡️',
        children: [
            { id: 'audit-logging', name: 'Audit logging', children: [] },
            { id: 'rate-limiting', name: 'Rate limiting', children: [] },
            { id: 'account-lockout', name: 'Account lockout', requiresAny: ['email-password-login'], note: 'need Email/Password login', children: [] },
            { id: 'login-history', name: 'Login history', children: [] },
            { id: 'login-notifications', name: 'Login notifications', requiresAny: ['login-history'], note: 'need Login history', children: [] },
            { id: 'ip-whitelisting', name: 'IP whitelisting/blacklisting', children: [] },
            { id: 'device-fingerprinting', name: 'Device fingerprinting', children: [] },
            { id: 'suspicious-activity', name: 'Suspicious activity detection', children: [] },
            { id: 'security-event-correlation', name: 'Security event correlation', children: [] },
            { id: 'threat-intelligence', name: 'Threat intelligence integration', children: [] },
            { id: 'anomaly-detection', name: 'Anomaly detection', children: [] },
            { id: 'security-posture-monitoring', name: 'Security posture monitoring', children: [] },
            { id: 'compliance-reporting', name: 'Compliance reporting', children: [] },
            { id: 'data-classification', name: 'Data classification', children: [] },
            { id: 'privacy-controls', name: 'Privacy controls', children: [] }
        ]
    },
    'admin-panel': {
        name: 'ADMIN PANEL',
        icon: '⚙️',
        requiresAny: ['rbac'],
        note: 'need RBAC',
        children: [
            { id: 'user-management', name: 'User management' },
            { id: 'role-permission-management', name: 'Role & permission management' },
            { id: 'system-configuration', name: 'System configuration' },
            { id: 'user-impersonation', name: 'User impersonation', requiresAny: ['audit-logging'], note: 'need Audit logging' },
            { id: 'bulk-operations', name: 'Bulk operations' },
            { id: 'admin-audit-trail', name: 'Admin audit trail' },
            { id: 'admin-mfa-requirement', name: 'Admin MFA requirement' },
            { id: 'admin-session-timeouts', name: 'Admin session timeouts' },
            { id: 'scheduled-tasks', name: 'Scheduled tasks' },
            { id: 'maintenance-mode', name: 'Maintenance mode' }
        ]
    },
    'oauth2': {
        name: 'OAUTH2 AUTHORIZATION SERVER',
        icon: '🔓',
        children: [
            { id: 'oauth2-scopes', name: 'Scopes' },
            { id: 'token-introspection', name: 'Token introspection' },
            { id: 'token-revocation', name: 'Token revocation' },
            { id: 'pkce-support', name: 'PKCE support' },
            { id: 'device-flow', name: 'Device flow' },
            { id: 'client-credentials-flow', name: 'Client credentials flow' },
            { id: 'token-exchange', name: 'Token exchange' },
            { id: 'dynamic-client-registration', name: 'Dynamic client registration' }
        ]
    },
    'multi-tenancy': {
        name: 'MULTI-TENANCY',
        icon: '🏢',
        children: [
            { id: 'tenant-isolation', name: 'Tenant isolation' },
            { id: 'tenant-provisioning', name: 'Tenant provisioning' },
            { id: 'tenant-customization', name: 'Tenant customization' },
            { id: 'tenant-analytics', name: 'Tenant analytics' },
            { id: 'cross-tenant-access', name: 'Cross-tenant access' },
            { id: 'tenant-backup-restore', name: 'Tenant backup/restore' },
            { id: 'tenant-migration', name: 'Tenant migration' }
        ]
    },
    'integrations': {
        name: 'INTEGRATIONS & EVENTS',
        icon: '🔌',
        children: [
            { id: 'event-publishing', name: 'Event publishing (Kafka/RabbitMQ)', children: [] },
            { id: 'webhooks-outgoing', name: 'Webhooks (outgoing)', children: [] },
            { id: 'webhooks-incoming', name: 'Webhooks (incoming)', children: [] },
            { id: 'analytics-integration', name: 'Analytics integration', children: [] },
            { id: 'saml-integration', name: 'SAML integration', children: [] },
            { id: 'cas-integration', name: 'CAS integration', children: [] },
            { id: 'external-identity-providers', name: 'External identity providers', children: [] },
            { id: 'custom-auth-providers', name: 'Custom authentication providers', children: [] }
        ]
    },
    'account-management': {
        name: 'ACCOUNT MANAGEMENT',
        icon: '👤',
        children: [
            { id: 'user-profile-crud', name: 'User profile CRUD', children: [] },
            { id: 'account-deletion', name: 'Account deletion', requiresAny: ['user-profile-crud'], note: 'need User profile', children: [] },
            { id: 'logout', name: 'Logout', children: [] },
            { id: 'token-blacklist', name: 'Token blacklist', requiresAny: ['logout'], note: 'need Logout', children: [] },
            { id: 'session-management', name: 'Session management', children: [] },
            { id: 'remember-me', name: 'Remember me', children: [] },
            { id: 'account-linking', name: 'Account linking', children: [] },
            { id: 'account-recovery', name: 'Account recovery', children: [] },
            { id: 'account-export', name: 'Account export', children: [] },
            { id: 'account-transfer', name: 'Account transfer', children: [] },
            { id: 'account-delegation', name: 'Account delegation', children: [] },
            { id: 'account-hierarchy', name: 'Account hierarchy', children: [] },
            { id: 'cross-account-permissions', name: 'Cross-account permissions', children: [] },
            { id: 'federated-identity', name: 'Federated identity', children: [] }
        ]
    },
    'compliance': {
        name: 'COMPLIANCE & LEGAL',
        icon: '⚖️',
        children: [
            { id: 'gdpr', name: 'GDPR', children: [] },
            { id: 'data-export', name: 'Data export', children: [] },
            { id: 'tos-tracking', name: 'Terms of Service tracking', children: [] },
            { id: 'age-verification', name: 'Age verification', children: [] }
        ]
    },
    'operational': {
        name: 'OPERATIONAL',
        icon: '🔧',
        children: [
            { id: 'health-checks', name: 'Health checks', children: [] },
            { id: 'prometheus-metrics', name: 'Prometheus metrics', children: [] },
            { id: 'database-migrations', name: 'Database migrations', children: [] },
            { id: 'api-documentation', name: 'API documentation', children: [] },
            { id: 'docker-k8s', name: 'Docker + K8s configs', children: [] }
        ]
    },
    'validation-constraints': {
        name: 'VALIDATION & CONSTRAINTS',
        icon: '✓',
        children: [
            { id: 'email-validation', name: 'Email validation', children: [] },
            { id: 'phone-validation', name: 'Phone validation', children: [] },
            { id: 'username-validation', name: 'Username validation', children: [] },
            { id: 'field-length-constraints', name: 'Field length constraints', children: [] },
            { id: 'custom-validation-rules', name: 'Custom validation rules', children: [] },
            { id: 'input-sanitization', name: 'Input sanitization', children: [] },
            { id: 'xss-prevention', name: 'XSS prevention', children: [] },
            { id: 'sql-injection-prevention', name: 'SQL injection prevention', children: [] },
            { id: 'csrf-protection', name: 'CSRF protection', children: [] },
            { id: 'content-security-policy', name: 'Content Security Policy', children: [] }
        ]
    },
    'database-performance': {
        name: 'DATABASE & PERFORMANCE',
        icon: '⚡',
        children: [
            { id: 'database-indexing', name: 'Database indexing', children: [] },
            { id: 'query-optimization', name: 'Query optimization', children: [] },
            { id: 'connection-pooling', name: 'Connection pooling', children: [] },
            { id: 'read-replicas', name: 'Read replicas', children: [] },
            { id: 'caching-strategy', name: 'Caching strategy', children: [] },
            { id: 'batch-operations', name: 'Batch operations', children: [] },
            { id: 'lazy-loading', name: 'Lazy loading', children: [] }
        ]
    },
    'cryptography-hashing': {
        name: 'CRYPTOGRAPHY & HASHING',
        icon: '🔐',
        children: [
            { id: 'password-hashing-algorithm', name: 'Password hashing algorithm', children: [] },
            { id: 'encryption-at-rest', name: 'Encryption at rest', children: [] },
            { id: 'encryption-in-transit', name: 'Encryption in transit', children: [] },
            { id: 'key-management', name: 'Key management', children: [] },
            { id: 'key-rotation', name: 'Key rotation', children: [] }
        ]
    },
    'enterprise-features': {
        name: 'ENTERPRISE FEATURES',
        icon: '🏢',
        children: [
            { id: 'sso-enterprise', name: 'SSO (Enterprise)', children: [] },
            { id: 'scim-provisioning', name: 'SCIM provisioning', children: [] },
            { id: 'directory-sync', name: 'Directory sync', children: [] },
            { id: 'just-in-time-provisioning', name: 'Just-in-time provisioning', children: [] },
            { id: 'custom-branding', name: 'Custom branding', children: [] },
            { id: 'white-labeling', name: 'White labeling', children: [] },
            { id: 'api-rate-limits-per-tenant', name: 'API rate limits per tenant', children: [] },
            { id: 'usage-analytics', name: 'Usage analytics', children: [] },
            { id: 'billing-integration', name: 'Billing integration', children: [] },
            { id: 'license-management', name: 'License management', children: [] }
        ]
    }
};

// ============================================================================
// Feature Database Requirements
// ============================================================================

export const FEATURE_REQUIREMENTS = {
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    'email-password-login': {
        database: { required: 2, optional: 5 },
        cache: null
    },
    'phone-sms-login': {
        database: { required: 1, optional: 4 },
        cache: null
    },
    'magic-links': {
        database: { required: 1, optional: 3 },
        cache: null
    },
    'social-login': {
        database: { required: 3, optional: 8 },
        cache: null
    },
    'ldap': {
        database: { required: 1, optional: 2 },
        cache: null
    },
    'saml': {
        database: { required: 1, optional: 3 },
        cache: null
    },
    'webauthn': {
        database: { required: 3, optional: 5 },
        cache: null
    },
    'certificate-mtls': {
        database: { required: 1, optional: 3 },
        cache: null
    },
    'pin-pattern-login': {
        database: { required: 1, optional: 4 },
        cache: null
    },
    'passwordless-auth': {
        database: { required: 1, optional: 3 },
        cache: null
    },
    'biometric-auth': {
        database: { required: 3, optional: 4 },
        cache: null
    },
    'anonymous-auth': {
        database: { required: 1, optional: 2 },
        cache: null
    },
    'api-key-auth': {
        database: { required: 2, optional: 5 },
        cache: null
    },
    'bearer-token-auth': {
        database: null,
        cache: null
    },
    'basic-auth-support': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // TOKEN SYSTEM
    // ============================================================================
    'jwt': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'opaque-tokens': {
        database: { required: 6, optional: 5 },
        cache: null
    },
    
    // ============================================================================
    // TOKEN FEATURES
    // ============================================================================
    'token-rotation': {
        database: { increment: 1 },
        cache: null
    },
    'token-family-tracking': {
        database: { increment: 2 },
        cache: null
    },
    'sliding-sessions': {
        database: { increment: 1 },
        cache: null
    },
    'concurrent-session-limits': {
        database: { increment: 1 },
        cache: null
    },
    'token-scopes': {
        database: { required: 3, optional: 2 },
        cache: null
    },
    'refresh-token-reuse-detection': {
        database: { increment: 2 },
        cache: null
    },
    'token-binding': {
        database: { increment: 2 },
        cache: null
    },
    'jwt-claims-validation': {
        database: { required: 3, optional: 2 },
        cache: null
    },
    
    // ============================================================================
    // REGISTRATION
    // ============================================================================
    'basic-registration': {
        database: null,
        cache: null
    },
    'email-verification': {
        database: { increment: 2 },
        cache: null
    },
    'phone-verification': {
        database: { increment: 2 },
        cache: null
    },
    'invite-only-registration': {
        database: { required: 4, optional: 4 },
        cache: null
    },
    'registration-approval-workflow': {
        database: { increment: 2 },
        cache: null
    },
    
    // ============================================================================
    // PASSWORD MANAGEMENT
    // ============================================================================
    'password-reset': {
        database: null,
        cache: null
    },
    'password-change': {
        database: null,
        cache: null
    },
    'password-history': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'password-policies': {
        database: { required: 5, optional: 3 },
        cache: null
    },
    'password-strength-meter': {
        database: null,
        cache: null
    },
    'compromised-password-check': {
        database: null,
        cache: null
    },
    'password-expiration': {
        database: { increment: 2 },
        cache: null
    },
    'force-password-change': {
        database: { increment: 1 },
        cache: null
    },
    'password-blacklist': {
        database: { required: 2, optional: 2 },
        cache: { required: 1, optional: 0 }
    },
    'hash-migration': {
        database: { increment: 1 },
        cache: null
    },
    
    // ============================================================================
    // MFA
    // ============================================================================
    'totp': {
        database: { required: 3, optional: 4 },
        cache: null
    },
    'backup-codes': {
        database: { required: 3, optional: 2 },
        cache: null
    },
    'sms-codes': {
        database: null,
        cache: null
    },
    'email-codes': {
        database: null,
        cache: null
    },
    'push-notifications-mfa': {
        database: { required: 2, optional: 3 },
        cache: null
    },
    'hardware-tokens': {
        database: { required: 3, optional: 4 },
        cache: null
    },
    'security-questions': {
        database: { required: 4, optional: 3 },
        cache: null
    },
    'mfa-enforcement-policies': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'mfa-trusted-ips': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'mfa-grace-period': {
        database: { increment: 2 },
        cache: null
    },
    'step-up-authentication': {
        database: { required: 4, optional: 3 },
        cache: null
    },
    'adaptive-mfa': {
        database: { required: 5, optional: 4 },
        cache: null
    },
    
    // ============================================================================
    // AUTHORIZATION
    // ============================================================================
    'rbac': {
        database: { required: 8, optional: 6 },
        cache: null
    },
    'hierarchical-roles': {
        database: { increment: 1 },
        cache: null
    },
    'temporal-permissions': {
        database: { increment: 2 },
        cache: null
    },
    'permission-delegation': {
        database: { required: 4, optional: 4 },
        cache: null
    },
    'resource-based-permissions': {
        database: { required: 4, optional: 3 },
        cache: null
    },
    'conditional-permissions': {
        database: { increment: 2 },
        cache: null
    },
    'permission-inheritance': {
        database: { increment: 2 },
        cache: null
    },
    'group-based-permissions': {
        database: { required: 7, optional: 5 },
        cache: null
    },
    'time-based-access-control': {
        database: { increment: 4 },
        cache: null
    },
    'abac': {
        database: { required: 8, optional: 6 },
        cache: null
    },
    'tag-based-permissions': {
        database: { required: 5, optional: 3 },
        cache: null
    },
    'location-based-access-control': {
        database: { increment: 3 },
        cache: null
    },
    'permission-caching': {
        database: null,
        cache: { required: 3, optional: 2 }
    },
    
    // ============================================================================
    // AUDIT & SECURITY
    // ============================================================================
    'audit-logging': {
        database: { required: 4, optional: 6 },
        cache: null
    },
    'rate-limiting': {
        database: null,
        cache: { required: 3, optional: 2 }
    },
    'account-lockout': {
        database: { increment: 3 },
        cache: null
    },
    'login-history': {
        database: { required: 3, optional: 7 },
        cache: null
    },
    'failed-login-tracking': {
        database: { increment: 3 },
        cache: null
    },
    'suspicious-activity-detection': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'anomaly-detection': {
        database: { required: 3, optional: 4 },
        cache: null
    },
    'ip-whitelist': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'ip-blacklist': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'geolocation-tracking': {
        database: { increment: 2 },
        cache: null
    },
    'device-fingerprinting': {
        database: { required: 3, optional: 4 },
        cache: null
    },
    'user-agent-parsing': {
        database: { increment: 2 },
        cache: null
    },
    'session-management': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'remember-me': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'logout': {
        database: null,
        cache: null
    },
    'logout-all-devices': {
        database: null,
        cache: null
    },
    'concurrent-login-prevention': {
        database: { increment: 2 },
        cache: null
    },
    'token-blacklist': {
        database: { required: 2, optional: 2 },
        cache: { required: 1, optional: 0 }
    },
    'trusted-devices': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'session-hijacking-detection': {
        database: { increment: 3 },
        cache: null
    },
    'csrf-protection': {
        database: null,
        cache: null
    },
    'cors-configuration': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'security-headers': {
        database: null,
        cache: null
    },
    'content-security-policy': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'login-notifications': {
        database: null,
        cache: null
    },
    'security-alerts': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'compliance-reports': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'real-time-security-dashboard': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // ACCOUNT MANAGEMENT
    // ============================================================================
    'user-profile': {
        database: { required: 5, optional: 8 },
        cache: null
    },
    'profile-picture': {
        database: { increment: 2 },
        cache: null
    },
    'custom-fields': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'account-deletion': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'account-deactivation': {
        database: { increment: 2 },
        cache: null
    },
    'account-archival': {
        database: { increment: 2 },
        cache: null
    },
    'account-merging': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'profile-visibility-controls': {
        database: { increment: 2 },
        cache: null
    },
    'email-change-workflow': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'phone-change-workflow': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'username-change': {
        database: { increment: 2 },
        cache: null
    },
    
    // ============================================================================
    // ADMIN PANEL
    // ============================================================================
    'admin-api': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'user-management': {
        database: null,
        cache: null
    },
    'role-permission-management': {
        database: null,
        cache: null
    },
    'system-configuration': {
        database: { required: 4, optional: 4 },
        cache: null
    },
    'user-impersonation': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'bulk-operations': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'advanced-search-filtering': {
        database: null,
        cache: null
    },
    'audit-log-search': {
        database: null,
        cache: null
    },
    'user-activity-timeline': {
        database: null,
        cache: null
    },
    'manual-user-verification': {
        database: { increment: 2 },
        cache: null
    },
    'ban-unban-users': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'role-templates': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'permission-matrix-view': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // OAUTH2 SERVER
    // ============================================================================
    'oauth2-server': {
        database: { required: 8, optional: 10 },
        cache: null
    },
    'oauth2-scopes': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'token-introspection': {
        database: null,
        cache: null
    },
    'token-revocation': {
        database: { increment: 2 },
        cache: null
    },
    'pkce-support': {
        database: null,
        cache: null
    },
    'client-credentials-grant': {
        database: null,
        cache: null
    },
    'device-authorization-grant': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'dynamic-client-registration': {
        database: { increment: 3 },
        cache: null
    },
    'client-secret-rotation': {
        database: { increment: 2 },
        cache: null
    },
    'consent-management': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'authorization-code-expiration': {
        database: { increment: 1 },
        cache: null
    },
    
    // ============================================================================
    // MULTI-TENANCY
    // ============================================================================
    'multi-tenancy': {
        database: { required: 6, optional: 7 },
        cache: null
    },
    'tenant-isolation': {
        database: { increment: 2 },
        cache: null
    },
    'tenant-provisioning': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'tenant-quotas-limits': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'tenant-feature-flags': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'cross-tenant-user-lookup': {
        database: { increment: 2 },
        cache: null
    },
    'tenant-switching': {
        database: { increment: 2 },
        cache: null
    },
    'tenant-invite-codes': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'tenant-analytics': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'custom-domains-per-tenant': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'tenant-branding': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    
    // ============================================================================
    // NOTIFICATIONS & INTEGRATIONS
    // ============================================================================
    'email-templates': {
        database: { required: 4, optional: 4 },
        cache: null
    },
    'sms-templates': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'push-notification-templates': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'notification-preferences': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'notification-queue': {
        database: { required: 4, optional: 4 },
        cache: null
    },
    'notification-retry-logic': {
        database: { increment: 2 },
        cache: null
    },
    'notification-delivery-tracking': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'webhooks-outgoing': {
        database: { required: 5, optional: 6 },
        cache: null
    },
    'webhooks-incoming': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'analytics-integration': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // COMPLIANCE & LEGAL
    // ============================================================================
    'gdpr': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'data-export': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'terms-of-service-tracking': {
        database: { required: 3, optional: 2 },
        cache: null
    },
    'age-verification': {
        database: { increment: 2 },
        cache: null
    },
    'privacy-settings-management': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'data-retention-policies': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    
    // ============================================================================
    // VALIDATION & CONSTRAINTS
    // ============================================================================
    'custom-validation-rules': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'field-level-encryption': {
        database: null,
        cache: null
    },
    'data-masking': {
        database: null,
        cache: null
    },
    'input-sanitization': {
        database: null,
        cache: null
    },
    'request-signing': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // DATABASE & PERFORMANCE
    // ============================================================================
    'read-replicas-support': {
        database: null,
        cache: null
    },
    'database-sharding-metadata': {
        database: { required: 2, optional: 2 },
        cache: null
    },
    'query-result-pagination': {
        database: null,
        cache: null
    },
    'optimistic-locking': {
        database: { increment: 1 },
        cache: null
    },
    'pessimistic-locking': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // CRYPTOGRAPHY & HASHING
    // ============================================================================
    'password-hashing-strategies': {
        database: { increment: 1 },
        cache: null
    },
    'key-rotation-logic': {
        database: { required: 3, optional: 3 },
        cache: null
    },
    'hmac-signature-verification': {
        database: null,
        cache: null
    },
    'random-token-generation': {
        database: null,
        cache: null
    },
    
    // ============================================================================
    // ENTERPRISE FEATURES
    // ============================================================================
    'sso': {
        database: { required: 4, optional: 5 },
        cache: null
    },
    'directory-sync-scim': {
        database: { required: 5, optional: 6 },
        cache: null
    },
    'service-accounts': {
        database: { required: 4, optional: 5 },
        cache: null
    }
};

// ============================================================================
// Microservices Configuration
// ============================================================================

export const MICROSERVICES = {
    'notifications-service': {
        name: 'Notifications',
        icon: '📧',
        defaultPosition: { x: 1600, y: 50 }
    },
    'oauth2-providers': {
        name: 'OAuth2',
        icon: '🔐',
        defaultPosition: { x: 1600, y: 350 }
    },
    'analytics-service': {
        name: 'Analytics',
        icon: '📊',
        defaultPosition: { x: 1600, y: 650 }
    },
    'storage-service': {
        name: 'Storage',
        icon: '💾',
        defaultPosition: { x: 1900, y: 50 }
    },
    'ldap-server': {
        name: 'LDAP',
        icon: '🗂️',
        defaultPosition: { x: 1900, y: 350 }
    },
    'saml-idp': {
        name: 'SAML IdP',
        icon: '🔏',
        defaultPosition: { x: 1900, y: 650 }
    },
    'kafka-rabbitmq': {
        name: 'Kafka',
        icon: '📨',
        defaultPosition: { x: 2200, y: 50 }
    }
};

// Feature to Microservice Links
export const FEATURE_MICROSERVICE_LINKS = {
    // Notifications Service
    'phone-sms-login': ['notifications-service'],
    'magic-links': ['notifications-service'],
    'password-reset': ['notifications-service'],
    'email-verification': ['notifications-service'],
    'phone-verification': ['notifications-service'],
    'sms-codes': ['notifications-service'],
    'email-codes': ['notifications-service'],
    'push-notifications': ['notifications-service'],
    'login-notifications': ['notifications-service'],
    'passwordless-auth': ['notifications-service'],
    'registration-approval-workflow': ['notifications-service'],
    'account-deletion': ['notifications-service'],
    
    // OAuth2 Providers
    'social-login': ['oauth2-providers'],
    
    // Analytics Service
    'audit-logging': ['analytics-service'],
    'suspicious-activity': ['analytics-service'],
    'analytics-integration': ['analytics-service'],
    'security-event-correlation': ['analytics-service'],
    'threat-intelligence': ['analytics-service'],
    'anomaly-detection': ['analytics-service'],
    
    // Storage Service
    'user-profile-crud': ['storage-service'],
    'data-export': ['storage-service'],
    
    // LDAP Server
    'ldap': ['ldap-server'],
    
    // SAML IdP
    'saml': ['saml-idp'],
    
    // Kafka/RabbitMQ
    'event-publishing': ['kafka-rabbitmq'],
    
    // Multiple services
    'webhooks-outgoing': ['storage-service']  // HTTP calls to external clients
};