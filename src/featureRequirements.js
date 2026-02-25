// Feature Requirements for Column Mapping
// Определяет какие таблицы/колонки нужны каждой фиче

export const FEATURE_REQUIREMENTS = {

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  'email-password-login': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['users'],
      columns: {
        users: {
          required: ['email', 'password_hash'],
          optional: ['salt', 'failed_login_attempts', 'last_login_at', 'account_locked_until', 'email_verified']
        }
      }
    }
  },

  'phone-sms-login': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['users'],
      columns: {
        users: {
          required: ['phone'],
          optional: ['phone_verified', 'last_sms_sent_at', 'sms_code', 'sms_code_expires_at']
        }
      }
    }
  },

  'magic-links': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['magic_links'],
      columns: {
        magic_links: {
          required: ['token'],
          optional: ['user_id', 'expires_at', 'used_at']
        }
      }
    }
  },

  'social-login': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['social_accounts'],
      columns: {
        social_accounts: {
          required: ['user_id', 'provider', 'provider_user_id'],
          optional: ['access_token', 'refresh_token', 'token_expires_at', 'provider_email', 'provider_name', 'avatar_url', 'raw_data', 'connected_at']
        }
      }
    }
  },

  'ldap': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['ldap_users'],
      columns: {
        ldap_users: {
          required: ['dn'],
          optional: ['uid', 'last_sync_at']
        }
      }
    }
  },

  'saml': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['saml_sessions'],
      columns: {
        saml_sessions: {
          required: ['name_id'],
          optional: ['session_index', 'idp_entity_id', 'expires_at']
        }
      }
    }
  },

  'webauthn': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['webauthn_credentials'],
      columns: {
        webauthn_credentials: {
          required: ['user_id', 'credential_id', 'public_key'],
          optional: ['aaguid', 'sign_count', 'device_name', 'last_used_at', 'created_at']
        }
      }
    }
  },

  'certificate-mtls': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_certificates'],
      columns: {
        user_certificates: {
          required: ['user_id'],
          optional: ['thumbprint', 'subject_dn', 'expires_at']
        }
      }
    }
  },

  'pin-pattern-login': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_pins'],
      columns: {
        user_pins: {
          required: ['user_id'],
          optional: ['pin_hash', 'pattern_hash', 'failed_attempts', 'locked_until']
        }
      }
    }
  },

  'passwordless-auth': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['passwordless_tokens'],
      columns: {
        passwordless_tokens: {
          required: ['token'],
          optional: ['user_id', 'expires_at', 'used_at']
        }
      }
    }
  },

  'biometric-auth': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['biometric_data'],
      columns: {
        biometric_data: {
          required: ['user_id', 'biometric_type', 'template_hash'],
          optional: ['device_id', 'last_used_at', 'created_at', 'revoked_at']
        }
      }
    }
  },

  'anonymous-auth': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['anonymous_sessions'],
      columns: {
        anonymous_sessions: {
          required: ['session_token'],
          optional: ['created_at', 'expires_at']
        }
      }
    }
  },

  'api-key-auth': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['api_keys'],
      columns: {
        api_keys: {
          required: ['key_hash', 'user_id'],
          optional: ['name', 'last_used_at', 'expires_at', 'scopes', 'ip_whitelist']
        }
      }
    }
  },

  'bearer-token-auth': { type: 'standalone', expandable: false },
  'basic-auth-support': { type: 'standalone', expandable: false },

  // ============================================================================
  // TOKEN SYSTEM
  // ============================================================================

  'jwt-tokens': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['refresh_tokens'],
      columns: {
        refresh_tokens: {
          required: ['token_hash', 'user_id', 'expires_at'],
          optional: ['created_at', 'last_used_at', 'ip_address']
        }
      }
    }
  },

  'opaque-tokens': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tokens'],
      columns: {
        tokens: {
          required: ['access_token_hash', 'refresh_token_hash', 'user_id', 'access_expires_at', 'refresh_expires_at', 'created_at'],
          optional: ['last_used_at', 'ip_address', 'user_agent', 'revoked_at', 'device_id']
        }
      }
    }
  },

  // ============================================================================
  // TOKEN FEATURES
  // ============================================================================

  'token-rotation': {
    expandable: false, type: 'child', childType: 'increment', parent: 'jwt-tokens',
    database: { increment: { refresh_tokens: ['rotated_at'] } }
  },

  'token-family-tracking': {
    expandable: false, type: 'child', childType: 'increment', parent: 'jwt-tokens',
    database: { increment: { refresh_tokens: ['family_id', 'family_counter'] } }
  },

  'sliding-sessions': {
    expandable: false, type: 'child', childType: 'increment', parent: 'session-management',
    database: { increment: { sessions: ['last_activity_at'] } }
  },

  'concurrent-session-limits': {
    expandable: false, type: 'child', childType: 'increment', parent: 'session-management',
    database: { increment: { sessions: ['session_order'] } }
  },

  'token-scopes': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['scopes', 'token_scopes', 'user_scopes'],
      columns: {
        scopes: {
          required: ['name', 'description'],
          optional: ['resource', 'action']
        },
        token_scopes: {
          required: ['token_id', 'scope_id'],
          optional: ['granted_at']
        },
        user_scopes: {
          required: ['user_id', 'scope_id'],
          optional: []
        }
      }
    }
  },

  'refresh-token-reuse-detection': {
    expandable: false, type: 'child', childType: 'increment', parent: 'jwt-tokens',
    database: { increment: { refresh_tokens: ['used_at', 'reuse_detected_at'] } }
  },

  'token-binding': {
    expandable: false, type: 'child', childType: 'increment', parent: 'jwt-tokens',
    database: { increment: { refresh_tokens: ['binding_key', 'binding_type'] } }
  },

  'jwt-claims-validation': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['jwt_claim_rules', 'jwt_issuer_config', 'jwt_validation_logs'],
      columns: {
        jwt_claim_rules: {
          required: ['claim_name', 'validation_type', 'expected_value'],
          optional: ['error_message', 'created_at']
        },
        jwt_issuer_config: {
          required: ['issuer', 'jwks_uri', 'audience'],
          optional: ['algorithm', 'clock_skew_seconds']
        },
        jwt_validation_logs: {
          required: ['token_jti', 'validated_at', 'result'],
          optional: []
        }
      }
    }
  },

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  'registration': { type: 'standalone', expandable: false },

  'email-verification': {
    expandable: false, type: 'child', childType: 'increment', parent: 'registration',
    database: { increment: { users: ['email_verified', 'email_verification_token'] } }
  },

  'phone-verification': {
    expandable: false, type: 'child', childType: 'increment', parent: 'registration',
    database: { increment: { users: ['phone_verified', 'phone_verification_code'] } }
  },

  'invite-only-registration': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['invitations'],
      columns: {
        invitations: {
          required: ['token', 'email', 'invited_by', 'expires_at'],
          optional: ['used_at', 'used_by', 'role_id', 'max_uses']
        }
      }
    }
  },

  'registration-approval-workflow': {
    expandable: false, type: 'child', childType: 'increment', parent: 'registration',
    database: { increment: { users: ['approval_status', 'approved_by'] } }
  },

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  'password-reset':    { type: 'standalone', expandable: false },
  'password-change':   { type: 'standalone', expandable: false },
  'password-strength-meter':    { type: 'standalone', expandable: false },
  'compromised-password-check': { type: 'standalone', expandable: false },

  'password-history': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['password_history'],
      columns: {
        password_history: {
          required: ['user_id', 'password_hash'],
          optional: ['created_at', 'algorithm']
        }
      }
    }
  },

  'password-policies': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['password_policies'],
      columns: {
        password_policies: {
          required: ['min_length', 'require_uppercase', 'require_lowercase', 'require_digits', 'require_special'],
          optional: ['max_length', 'max_age_days', 'history_count']
        }
      }
    }
  },

  'password-expiration': {
    expandable: false, type: 'child', childType: 'increment', parent: 'password-policies',
    database: { increment: { users: ['password_expires_at', 'password_changed_at'] } }
  },

  'force-password-change': {
    expandable: false, type: 'child', childType: 'increment', parent: 'password-policies',
    database: { increment: { users: ['force_password_change'] } }
  },

  'password-blacklist': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['blacklisted_passwords'],
      columns: {
        blacklisted_passwords: {
          required: ['password_hash', 'added_at'],
          optional: ['source', 'added_by']
        }
      }
    },
    cache: {
      redis: {
        required: ['blacklist:password:{hash}'],
        optional: []
      }
    }
  },

  'hash-migration': {
    expandable: false, type: 'child', childType: 'increment', parent: 'email-password-login',
    database: { increment: { users: ['hash_algorithm'] } }
  },

  'password-hashing-algorithm': {
    expandable: false, type: 'child', childType: 'increment', parent: 'email-password-login',
    database: { increment: { users: ['hash_algorithm'] } }
  },

  // ============================================================================
  // MFA
  // ============================================================================

  'totp': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['totp_secrets'],
      columns: {
        totp_secrets: {
          required: ['user_id', 'secret', 'enabled'],
          optional: ['confirmed_at', 'last_used_at', 'device_name', 'algorithm']
        }
      }
    }
  },

  'backup-codes': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['backup_codes'],
      columns: {
        backup_codes: {
          required: ['user_id', 'code_hash', 'used'],
          optional: ['used_at', 'created_at']
        }
      }
    }
  },

  'sms-codes':   { type: 'standalone', expandable: false },
  'email-codes': { type: 'standalone', expandable: false },

  'push-notifications': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['push_devices'],
      columns: {
        push_devices: {
          required: ['user_id', 'device_token'],
          optional: ['platform', 'device_name', 'last_used_at']
        }
      }
    }
  },

  'hardware-tokens': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['hardware_tokens'],
      columns: {
        hardware_tokens: {
          required: ['user_id', 'serial_number', 'token_type'],
          optional: ['counter', 'last_used_at', 'registered_at', 'revoked_at']
        }
      }
    }
  },

  'mfa-grace-period': {
    expandable: false, type: 'child', childType: 'increment', parent: 'totp',
    database: { increment: { users: ['mfa_grace_until', 'mfa_grace_enabled'] } }
  },

  // ============================================================================
  // AUTHORIZATION
  // ============================================================================

  'rbac': {
    expandable: true, type: 'parent',
    database: {
      tables: ['roles', 'permissions', 'user_roles', 'role_permissions'],
      columns: {
        roles: {
          required: ['id', 'name', 'description'],
          optional: ['is_system', 'created_at', 'updated_at']
        },
        permissions: {
          required: ['id', 'name', 'resource'],
          optional: ['action', 'description', 'created_at']
        },
        user_roles: {
          required: ['user_id', 'role_id'],
          optional: ['assigned_at', 'assigned_by', 'expires_at']
        },
        role_permissions: {
          required: ['role_id', 'permission_id'],
          optional: ['created_at', 'created_by', 'conditions']
        }
      }
    },
    children: ['hierarchical-roles', 'temporal-permissions', 'permission-delegation', 'resource-based-permissions', 'conditional-permissions', 'group-based-permissions', 'time-based-access']
  },

  'hierarchical-roles': {
    expandable: false, type: 'child', childType: 'increment', parent: 'rbac',
    database: { increment: { roles: ['parent_role_id'] } }
  },

  'temporal-permissions': {
    expandable: false, type: 'child', childType: 'increment', parent: 'rbac',
    database: { increment: { role_permissions: ['valid_from', 'valid_until'] } }
  },

  'permission-delegation': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['delegations'],
      columns: {
        delegations: {
          required: ['delegator_id', 'delegatee_id', 'permission_id', 'expires_at'],
          optional: ['valid_from', 'revoked_at', 'delegation_reason', 'created_at']
        }
      }
    }
  },

  'resource-based-permissions': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['resource_permissions'],
      columns: {
        resource_permissions: {
          required: ['resource_type', 'resource_id', 'user_id', 'permission'],
          optional: ['granted_by', 'expires_at', 'conditions']
        }
      }
    }
  },

  'conditional-permissions': {
    expandable: false, type: 'child', childType: 'increment', parent: 'rbac',
    database: { increment: { role_permissions: ['condition_expression', 'condition_type'] } }
  },

  'permission-inheritance': {
    expandable: false, type: 'child', childType: 'increment', parent: 'resource-based-permissions',
    database: { increment: { resource_permissions: ['inherited_from', 'inheritance_depth'] } }
  },

  'group-based-permissions': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['groups', 'group_members', 'group_roles'],
      columns: {
        groups: {
          required: ['id', 'name', 'description', 'created_by'],
          optional: ['parent_group_id', 'created_at', 'updated_at']
        },
        group_members: {
          required: ['group_id', 'user_id'],
          optional: ['joined_at', 'role', 'added_by']
        },
        group_roles: {
          required: ['group_id', 'role_id'],
          optional: ['assigned_at', 'assigned_by', 'expires_at', 'conditions']
        }
      }
    }
  },

  'time-based-access': {
    expandable: false, type: 'child', childType: 'increment', parent: 'rbac',
    database: { increment: { user_roles: ['access_start_time', 'access_end_time', 'allowed_days', 'timezone'] } }
  },

  'abac': {
    expandable: true, type: 'parent',
    database: {
      tables: ['attributes', 'policies', 'attribute_values', 'policy_rules'],
      columns: {
        attributes: {
          required: ['id', 'name', 'type', 'category'],
          optional: ['description', 'default_value', 'created_at']
        },
        policies: {
          required: ['id', 'name', 'effect', 'priority'],
          optional: ['description', 'version', 'created_at', 'updated_at']
        },
        attribute_values: {
          required: ['entity_id', 'entity_type', 'attribute_id', 'value'],
          optional: ['valid_from', 'valid_until', 'set_by']
        },
        policy_rules: {
          required: ['policy_id', 'condition', 'action'],
          optional: ['resource_type', 'description', 'created_at']
        }
      }
    },
    children: ['tag-based-permissions', 'location-based-access']
  },

  'tag-based-permissions': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tags', 'resource_tags', 'tag_permissions'],
      columns: {
        tags: {
          required: ['name', 'category'],
          optional: ['description', 'color', 'created_at']
        },
        resource_tags: {
          required: ['resource_id', 'resource_type', 'tag_id'],
          optional: ['tagged_at', 'tagged_by']
        },
        tag_permissions: {
          required: ['tag_id', 'permission', 'role_id'],
          optional: []
        }
      }
    }
  },

  'location-based-access': {
    expandable: false, type: 'child', childType: 'increment', parent: 'abac',
    database: { increment: { policies: ['allowed_countries', 'allowed_regions', 'blocked_countries'] } }
  },

  'permission-caching': {
    type: 'standalone', expandable: true,
    cache: {
      redis: {
        required: ['permissions:user:{userId}', 'roles:user:{userId}', 'acl:{userId}:{resource}'],
        optional: ['permissions:role:{roleId}', 'permissions:group:{groupId}']
      }
    }
  },

  // ============================================================================
  // AUDIT & SECURITY
  // ============================================================================

  'audit-logging': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['audit_logs'],
      columns: {
        audit_logs: {
          required: ['user_id', 'action', 'resource_type', 'timestamp'],
          optional: ['resource_id', 'ip_address', 'user_agent', 'old_value', 'new_value', 'metadata']
        }
      }
    }
  },

  'rate-limiting': {
    type: 'standalone', expandable: true,
    cache: {
      redis: {
        required: ['rate_limit:user:{userId}', 'rate_limit:ip:{ip}', 'rate_limit:endpoint:{path}'],
        optional: ['rate_limit:global', 'rate_limit:tenant:{tenantId}']
      }
    }
  },

  'account-lockout': {
    expandable: false, type: 'child', childType: 'increment', parent: 'email-password-login',
    database: { increment: { users: ['lockout_until', 'failed_attempts', 'locked_at'] } }
  },

  'login-history': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['login_history'],
      columns: {
        login_history: {
          required: ['user_id', 'ip_address', 'created_at'],
          optional: ['user_agent', 'device_type', 'location_country', 'location_city', 'success', 'failure_reason']
        }
      }
    }
  },

  'failed-login-tracking': {
    expandable: false, type: 'child', childType: 'increment', parent: 'login-history',
    database: { increment: { login_history: ['attempt_type', 'failure_code', 'blocked_by'] } }
  },

  'login-notifications': { type: 'standalone', expandable: false },

  'ip-whitelisting': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['ip_rules'],
      columns: {
        ip_rules: {
          required: ['ip_address', 'rule_type', 'created_by'],
          optional: ['description', 'expires_at', 'created_at', 'user_id']
        }
      }
    },
    cache: {
      redis: {
        required: ['ip:whitelist:{ip}', 'ip:blacklist:{ip}'],
        optional: ['ip:rules:user:{userId}']
      }
    }
  },

  'device-fingerprinting': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['device_fingerprints'],
      columns: {
        device_fingerprints: {
          required: ['user_id', 'fingerprint_hash', 'first_seen_at', 'last_seen_at'],
          optional: ['user_agent', 'screen_resolution', 'timezone', 'language', 'trust_score']
        }
      }
    }
  },

  'trusted-devices': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['trusted_devices'],
      columns: {
        trusted_devices: {
          required: ['user_id', 'device_id', 'trusted_at', 'name', 'fingerprint_hash'],
          optional: ['expires_at', 'last_used_at', 'revoked_at', 'trust_token']
        }
      }
    }
  },

  'suspicious-activity': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['suspicious_events'],
      columns: {
        suspicious_events: {
          required: ['user_id', 'event_type', 'risk_score', 'detected_at', 'status'],
          optional: ['ip_address', 'details', 'resolved_at', 'resolved_by', 'false_positive']
        }
      }
    }
  },

  'brute-force-detection': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['brute_force_attempts'],
      columns: {
        brute_force_attempts: {
          required: ['ip_address', 'target', 'attempt_count', 'window_start'],
          optional: ['last_attempt_at', 'blocked_until', 'user_id', 'endpoint']
        }
      }
    },
    cache: {
      redis: {
        required: ['brute_force:ip:{ip}', 'brute_force:user:{userId}', 'brute_force:endpoint:{path}'],
        optional: ['brute_force:blocked:{ip}']
      }
    }
  },

  'credential-stuffing-detection': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['stuffing_attempts'],
      columns: {
        stuffing_attempts: {
          required: ['ip_address', 'detected_at', 'attempt_count'],
          optional: ['blocked_until', 'user_agents', 'targets']
        }
      }
    }
  },

  'geolocation-tracking': {
    expandable: false, type: 'child', childType: 'increment', parent: 'login-history',
    database: { increment: { login_history: ['country_code', 'region', 'city', 'coordinates'] } }
  },

  'user-agent-parsing': {
    expandable: false, type: 'child', childType: 'increment', parent: 'login-history',
    database: { increment: { login_history: ['browser', 'os', 'device_model', 'is_mobile'] } }
  },

  'session-hijacking-detection': {
    expandable: false, type: 'child', childType: 'increment', parent: 'session-management',
    database: { increment: { sessions: ['initial_fingerprint', 'current_fingerprint', 'hijack_detected_at'] } }
  },

  'compliance-reports':          { type: 'standalone', expandable: false },
  'real-time-security-dashboard': { type: 'standalone', expandable: false },
  'anomaly-detection':            { type: 'standalone', expandable: false },

  // ============================================================================
  // ACCOUNT MANAGEMENT
  // ============================================================================

  'user-profile-crud': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_profiles'],
      columns: {
        user_profiles: {
          required: ['user_id'],
          optional: ['first_name', 'last_name', 'avatar_url', 'bio', 'website', 'location', 'birth_date', 'gender', 'updated_at']
        }
      }
    }
  },

  'account-deletion': {
    expandable: false, type: 'child', childType: 'increment', parent: 'user-profile-crud',
    database: { increment: { users: ['deleted_at', 'deletion_reason'] } }
  },

  'account-suspension': {
    expandable: false, type: 'child', childType: 'increment', parent: 'user-profile-crud',
    database: { increment: { users: ['suspended_at', 'suspended_until', 'suspension_reason'] } }
  },

  'account-archival': {
    expandable: false, type: 'child', childType: 'increment', parent: 'account-deletion',
    database: { increment: { users: ['archived_at', 'archive_location'] } }
  },

  'account-recovery': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['recovery_requests'],
      columns: {
        recovery_requests: {
          required: ['user_id', 'token', 'created_at', 'expires_at'],
          optional: ['ip_address', 'recovery_method', 'completed_at', 'cancelled_at']
        }
      }
    }
  },

  'logout': {
    expandable: false, type: 'child', childType: 'increment', parent: 'session-management',
    database: { increment: { sessions: ['logged_out_at'] } }
  },

  'token-blacklist': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['blacklisted_tokens'],
      columns: {
        blacklisted_tokens: {
          required: ['token_hash', 'blacklisted_at'],
          optional: ['user_id', 'expires_at', 'reason']
        }
      }
    },
    cache: {
      redis: {
        required: ['blacklist:token:{hash}', 'blacklist:user:{userId}'],
        optional: ['blacklist:session:{sessionId}']
      }
    }
  },

  'session-management': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['sessions'],
      columns: {
        sessions: {
          required: ['id', 'user_id', 'created_at', 'expires_at', 'is_active'],
          optional: ['ip_address', 'user_agent', 'last_activity_at', 'device_id', 'metadata', 'invalidated_at']
        }
      }
    }
  },

  'remember-me': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['remember_tokens'],
      columns: {
        remember_tokens: {
          required: ['user_id', 'token_hash', 'expires_at'],
          optional: ['created_at', 'last_used_at', 'ip_address']
        }
      }
    }
  },

  'user-preferences': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_preferences'],
      columns: {
        user_preferences: {
          required: ['user_id', 'key'],
          optional: ['value', 'updated_at']
        }
      }
    }
  },

  'user-metadata': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_metadata'],
      columns: {
        user_metadata: {
          required: ['user_id', 'key'],
          optional: ['value', 'updated_at']
        }
      }
    }
  },

  'email-change-workflow': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['email_change_requests'],
      columns: {
        email_change_requests: {
          required: ['user_id', 'new_email', 'token', 'expires_at'],
          optional: ['requested_at', 'confirmed_at', 'ip_address']
        }
      }
    }
  },

  'phone-change-workflow': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['phone_change_requests'],
      columns: {
        phone_change_requests: {
          required: ['user_id', 'new_phone', 'code', 'expires_at'],
          optional: ['requested_at', 'confirmed_at', 'ip_address']
        }
      }
    }
  },

  'username-uniqueness-check': { type: 'standalone', expandable: false },
  'email-uniqueness-check':    { type: 'standalone', expandable: false },
  'account-merging':           { type: 'standalone', expandable: false },
  'logout-all-devices':        { type: 'standalone', expandable: false },

  // ============================================================================
  // ADMIN PANEL
  // ============================================================================

  'admin-api':              { type: 'standalone', expandable: false },
  'user-management':        { type: 'standalone', expandable: false },
  'role-permission-management': { type: 'standalone', expandable: false },
  'bulk-operations':        { type: 'standalone', expandable: false },
  'advanced-search':        { type: 'standalone', expandable: false },
  'audit-log-search':       { type: 'standalone', expandable: false },
  'user-activity-timeline': { type: 'standalone', expandable: false },
  'permission-matrix-view': { type: 'standalone', expandable: false },

  'system-configuration': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['system_config'],
      columns: {
        system_config: {
          required: ['key', 'value', 'updated_at'],
          optional: ['description', 'updated_by', 'category']
        }
      }
    }
  },

  'user-impersonation': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['impersonation_sessions'],
      columns: {
        impersonation_sessions: {
          required: ['admin_id', 'target_user_id', 'started_at', 'reason'],
          optional: ['ended_at', 'ip_address', 'actions_taken', 'session_token']
        }
      }
    }
  },

  'role-templates': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['role_templates'],
      columns: {
        role_templates: {
          required: ['name', 'permissions', 'created_by'],
          optional: ['description', 'created_at', 'updated_at']
        }
      }
    }
  },

  'manual-user-verification': {
    expandable: false, type: 'child', childType: 'increment', parent: 'user-profile-crud',
    database: { increment: { users: ['manually_verified_at', 'verified_by'] } }
  },

  'ban-unban-users': {
    expandable: false, type: 'child', childType: 'increment', parent: 'user-profile-crud',
    database: { increment: { users: ['banned_at', 'banned_until', 'ban_reason'] } }
  },

  // ============================================================================
  // OAUTH2 SERVER
  // ============================================================================

  'oauth2': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['oauth_clients', 'oauth_authorization_codes', 'oauth_access_tokens'],
      columns: {
        oauth_clients: {
          required: ['client_id', 'client_secret_hash', 'name', 'redirect_uris', 'grant_types', 'response_types', 'scope', 'created_at'],
          optional: ['description', 'logo_uri', 'client_uri', 'contacts', 'tos_uri', 'policy_uri', 'is_confidential', 'created_by', 'updated_at', 'is_active']
        },
        oauth_authorization_codes: {
          required: ['code', 'client_id', 'user_id', 'redirect_uri', 'expires_at'],
          optional: ['scope', 'code_challenge', 'code_challenge_method', 'created_at', 'used_at', 'nonce']
        },
        oauth_access_tokens: {
          required: ['token_hash', 'client_id', 'user_id', 'expires_at'],
          optional: ['scope', 'created_at', 'revoked_at', 'refresh_token_hash', 'token_type']
        }
      }
    }
  },

  'oauth2-scopes': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['oauth_scopes'],
      columns: {
        oauth_scopes: {
          required: ['name', 'description'],
          optional: ['is_default', 'requires_consent', 'icon_uri']
        }
      }
    }
  },

  'token-introspection':      { type: 'standalone', expandable: false },
  'client-credentials-flow':  { type: 'standalone', expandable: false },
  'dynamic-client-registration': { type: 'standalone', expandable: false },

  'token-revocation': {
    expandable: false, type: 'child', childType: 'increment', parent: 'oauth2',
    database: { increment: { oauth_access_tokens: ['revoked_at'] } }
  },

  'pkce-support': {
    expandable: false, type: 'child', childType: 'increment', parent: 'oauth2',
    database: { increment: { oauth_authorization_codes: ['code_challenge', 'code_challenge_method'] } }
  },

  'authorization-code-expiration': {
    expandable: false, type: 'child', childType: 'increment', parent: 'oauth2',
    database: { increment: { oauth_authorization_codes: ['expired_at'] } }
  },

  'client-secret-rotation': {
    expandable: false, type: 'child', childType: 'increment', parent: 'oauth2',
    database: { increment: { oauth_clients: ['previous_secret_hash', 'secret_rotated_at'] } }
  },

  'device-flow': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['device_codes'],
      columns: {
        device_codes: {
          required: ['device_code', 'user_code', 'client_id', 'expires_at', 'status'],
          optional: ['user_id', 'scope', 'verification_uri', 'interval', 'last_polled_at', 'created_at', 'authorized_at', 'ip_address', 'user_agent']
        }
      }
    }
  },

  'consent-management': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['user_consents'],
      columns: {
        user_consents: {
          required: ['user_id', 'client_id', 'scope', 'granted_at'],
          optional: ['expires_at', 'revoked_at', 'ip_address']
        }
      }
    }
  },

  // ============================================================================
  // MULTI-TENANCY
  // ============================================================================

  'multi-tenancy': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tenants'],
      columns: {
        tenants: {
          required: ['id', 'name'],
          optional: ['slug', 'plan', 'status', 'created_at', 'owner_id']
        }
      }
    }
  },

  'tenant-isolation':         { type: 'standalone', expandable: false },
  'cross-tenant-access':      { type: 'standalone', expandable: false },
  'tenant-analytics':         { type: 'standalone', expandable: false },

  'tenant-provisioning': {
    expandable: false, type: 'child', childType: 'increment', parent: 'multi-tenancy',
    database: { increment: { tenants: ['provisioned_at', 'provisioning_status'] } }
  },

  'tenant-quotas': {
    expandable: false, type: 'child', childType: 'increment', parent: 'multi-tenancy',
    database: { increment: { tenants: ['max_users', 'max_api_calls', 'max_storage_mb', 'max_sessions', 'current_users'] } }
  },

  'tenant-switching': {
    expandable: false, type: 'child', childType: 'increment', parent: 'multi-tenancy',
    database: { increment: { sessions: ['tenant_id'] } }
  },

  'tenant-feature-flags': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tenant_features'],
      columns: {
        tenant_features: {
          required: ['tenant_id', 'feature_key'],
          optional: ['enabled', 'config']
        }
      }
    },
    cache: {
      redis: {
        required: ['tenant:features:{tenantId}', 'feature:{key}:tenant:{tenantId}'],
        optional: ['tenant:config:{tenantId}']
      }
    }
  },

  'tenant-invite-codes': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tenant_invites'],
      columns: {
        tenant_invites: {
          required: ['tenant_id', 'code', 'created_by', 'expires_at'],
          optional: ['max_uses', 'used_count', 'role_id', 'created_at', 'email']
        }
      }
    }
  },

  'custom-domains': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tenant_domains'],
      columns: {
        tenant_domains: {
          required: ['tenant_id', 'domain', 'verified'],
          optional: ['ssl_cert_expires_at', 'verified_at', 'dns_record', 'created_at']
        }
      }
    }
  },

  'tenant-branding': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tenant_branding'],
      columns: {
        tenant_branding: {
          required: ['tenant_id', 'primary_color', 'logo_url', 'favicon_url', 'company_name'],
          optional: ['secondary_color', 'font_family', 'custom_css', 'updated_at']
        }
      }
    }
  },

  // ============================================================================
  // INTEGRATIONS & EVENTS
  // ============================================================================

  'event-publishing':      { type: 'standalone', expandable: false },
  'analytics-integration': { type: 'standalone', expandable: false },

  'webhooks-outgoing': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['webhook_endpoints'],
      columns: {
        webhook_endpoints: {
          required: ['url', 'events', 'secret', 'created_at', 'is_active'],
          optional: ['description', 'headers', 'retry_count', 'last_triggered_at', 'failure_count']
        }
      }
    }
  },

  'webhooks-incoming': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['webhook_logs'],
      columns: {
        webhook_logs: {
          required: ['source', 'event_type', 'payload', 'received_at'],
          optional: ['status', 'processed_at', 'error', 'ip_address', 'headers']
        }
      }
    }
  },

  // ============================================================================
  // COMPLIANCE & LEGAL
  // ============================================================================

  'gdpr': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['gdpr_requests'],
      columns: {
        gdpr_requests: {
          required: ['user_id', 'request_type', 'created_at'],
          optional: ['status', 'completed_at', 'notes']
        }
      }
    }
  },

  'data-export': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['data_export_jobs'],
      columns: {
        data_export_jobs: {
          required: ['user_id', 'status', 'requested_at'],
          optional: ['completed_at', 'file_url', 'expires_at', 'format', 'include_types', 'notified_at']
        }
      }
    }
  },

  'tos-tracking': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['tos_acceptances'],
      columns: {
        tos_acceptances: {
          required: ['user_id', 'version', 'accepted_at'],
          optional: ['ip_address', 'user_agent']
        }
      }
    }
  },

  'privacy-controls': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['privacy_settings'],
      columns: {
        privacy_settings: {
          required: ['user_id', 'key'],
          optional: ['value', 'updated_at']
        }
      }
    }
  },

  'data-retention-policies': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['retention_policies'],
      columns: {
        retention_policies: {
          required: ['entity_type', 'retention_days', 'action'],
          optional: ['description', 'created_at', 'updated_at', 'is_active']
        }
      }
    }
  },

  'age-verification': {
    expandable: false, type: 'child', childType: 'increment', parent: 'registration',
    database: { increment: { users: ['birth_date', 'age_verified_at'] } }
  },

  // ============================================================================
  // VALIDATION & CONSTRAINTS
  // ============================================================================

  'custom-validation-rules': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['validation_rules'],
      columns: {
        validation_rules: {
          required: ['field_name', 'rule_type', 'rule_value'],
          optional: ['error_message', 'is_active', 'created_at']
        }
      }
    }
  },

  'field-level-encryption': { type: 'standalone', expandable: false },
  'data-masking':           { type: 'standalone', expandable: false },
  'input-sanitization':     { type: 'standalone', expandable: false },
  'request-signing':        { type: 'standalone', expandable: false },

  // ============================================================================
  // DATABASE & PERFORMANCE
  // ============================================================================

  'read-replicas':       { type: 'standalone', expandable: false },
  'query-optimization':  { type: 'standalone', expandable: false },
  'pessimistic-locking': { type: 'standalone', expandable: false },

  'database-sharding': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['shard_metadata'],
      columns: {
        shard_metadata: {
          required: ['shard_key', 'shard_id'],
          optional: ['node_host', 'created_at']
        }
      }
    }
  },

  // ============================================================================
  // CRYPTOGRAPHY & HASHING
  // ============================================================================

  'hmac-verification':      { type: 'standalone', expandable: false },
  'random-token-generation': { type: 'standalone', expandable: false },

  'key-rotation': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['encryption_keys'],
      columns: {
        encryption_keys: {
          required: ['key_id', 'algorithm', 'created_at'],
          optional: ['expires_at', 'rotated_at', 'status', 'key_version']
        }
      }
    }
  },

  // ============================================================================
  // ENTERPRISE FEATURES
  // ============================================================================

  'sso-enterprise': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['sso_configurations'],
      columns: {
        sso_configurations: {
          required: ['provider_type', 'entity_id', 'sso_url', 'certificate'],
          optional: ['metadata_url', 'attribute_mapping', 'created_at', 'is_active', 'updated_at']
        }
      }
    }
  },

  'directory-sync': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['scim_resources'],
      columns: {
        scim_resources: {
          required: ['external_id', 'resource_type', 'data', 'synced_at'],
          optional: ['user_id', 'group_id', 'sync_source', 'last_modified', 'etag', 'active']
        }
      }
    }
  },

  'service-accounts': {
    type: 'standalone', expandable: true,
    database: {
      tables: ['service_accounts'],
      columns: {
        service_accounts: {
          required: ['name', 'client_id', 'created_by', 'created_at'],
          optional: ['description', 'permissions', 'last_used_at', 'expires_at', 'is_active']
        }
      }
    }
  },

};

// ============================================================================
// HELPERS
// ============================================================================

export function hasRequirements(featureId) {
  return !!FEATURE_REQUIREMENTS[featureId];
}

export function getFeatureRequirements(featureId) {
  return FEATURE_REQUIREMENTS[featureId] || null;
}

export function isFeatureExpandable(featureId) {
  const req = FEATURE_REQUIREMENTS[featureId];
  return req?.expandable === true;
}

export function getChildType(featureId) {
  const req = FEATURE_REQUIREMENTS[featureId];
  return req?.childType || null;
}