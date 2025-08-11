# 🔐 מדריך אבטחה מקיף

## 🎯 **עקרונות אבטחה**

### **Defense in Depth:**
- **Multiple Security Layers**: הגנה רב-שכבתית
- **Zero Trust Architecture**: אמון אפס
- **Principle of Least Privilege**: הרשאות מינימליות
- **Security by Design**: אבטחה מהתכנון

## 🔑 **Authentication & Authorization**

### **Multi-Factor Authentication (MFA):**
```typescript
// MFA Implementation
export const setupMFA = async (userId: string) => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'HyperCourt MFA'
  });
  
  if (error) throw error;
  
  // Store backup codes securely
  await storeBackupCodes(userId, data.totp.recovery_codes);
  
  return data;
};
```

### **Role-Based Access Control (RBAC):**
```sql
-- RLS Policies
CREATE POLICY "admin_full_access" ON legal_cases
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "lawyer_own_cases" ON legal_cases
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'judge')
    )
  );
```

### **Session Management:**
```typescript
// Secure Session Handling
export const sessionManager = {
  // Auto-logout after inactivity
  setupInactivityTimer: (timeoutMs: number = 30 * 60 * 1000) => {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        supabase.auth.signOut();
        window.location.href = '/login';
      }, timeoutMs);
    };
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      .forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });
    
    resetTimer();
  },
  
  // Secure token refresh
  refreshToken: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Token refresh failed:', error);
      await supabase.auth.signOut();
    }
    return data;
  }
};
```

## 🛡️ **Data Protection**

### **Input Validation & Sanitization:**
```typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Validation Schemas
export const caseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(10000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.array(z.string()).max(10)
});

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// SQL Injection Prevention
export const safeQuery = async (query: string, params: any[]) => {
  // Always use parameterized queries
  return await supabase.rpc('safe_query', { 
    query_text: query, 
    query_params: params 
  });
};
```

### **Encryption:**
```typescript
import CryptoJS from 'crypto-js';

export const encryptionService = {
  // Client-side encryption for sensitive data
  encrypt: (text: string, key: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString();
  },
  
  decrypt: (ciphertext: string, key: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  
  // Hash passwords (additional layer)
  hashPassword: (password: string): string => {
    return CryptoJS.SHA256(password).toString();
  },
  
  // Generate secure random keys
  generateKey: (): string => {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
};
```

## 🔍 **Security Monitoring**

### **Audit Logging:**
```typescript
// Comprehensive Audit Trail
export const auditLogger = {
  logAction: async (action: string, details: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      details,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  logSecurityEvent: async (event: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    await supabase.from('security_events').insert({
      event_type: event,
      severity,
      details: {
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
    
    // Alert for critical events
    if (severity === 'critical') {
      await sendSecurityAlert(event);
    }
  }
};
```

### **Intrusion Detection:**
```typescript
// Rate Limiting & Abuse Detection
export const securityMonitor = {
  // Track failed login attempts
  trackFailedLogin: async (email: string) => {
    const key = `failed_login:${email}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 900); // 15 minutes
    
    if (attempts >= 5) {
      await auditLogger.logSecurityEvent('account_lockout', 'high');
      // Implement account lockout logic
    }
  },
  
  // Detect suspicious patterns
  detectAnomalies: async (userId: string) => {
    const recentActions = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    // Analyze patterns (simplified)
    if (recentActions.data && recentActions.data.length > 100) {
      await auditLogger.logSecurityEvent('unusual_activity', 'medium');
    }
  }
};
```

## 🌐 **Network Security**

### **HTTPS & Security Headers:**
```typescript
// Security Headers Configuration
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.supabase.co https://router.huggingface.co;
  `.replace(/\s+/g, ' ').trim()
};
```

### **API Security:**
```typescript
// API Rate Limiting
export const rateLimiter = {
  // Per-user rate limiting
  checkUserLimit: async (userId: string, endpoint: string) => {
    const key = `rate_limit:${userId}:${endpoint}`;
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }
    
    const limit = getRateLimit(endpoint);
    if (requests > limit) {
      throw new Error('Rate limit exceeded');
    }
  },
  
  // IP-based rate limiting
  checkIPLimit: async (ip: string) => {
    const key = `ip_limit:${ip}`;
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    if (requests > 100) { // 100 requests per minute
      throw new Error('IP rate limit exceeded');
    }
  }
};
```

## 🔒 **Data Privacy & Compliance**

### **GDPR Compliance:**
```typescript
// Data Privacy Controls
export const privacyService = {
  // Data export (Right to Data Portability)
  exportUserData: async (userId: string) => {
    const userData = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const userCases = await supabase
      .from('legal_cases')
      .select('*')
      .eq('user_id', userId);
    
    return {
      profile: userData.data,
      cases: userCases.data,
      exportDate: new Date().toISOString()
    };
  },
  
  // Data deletion (Right to be Forgotten)
  deleteUserData: async (userId: string) => {
    // Anonymize instead of delete for legal compliance
    await supabase
      .from('profiles')
      .update({
        email: `deleted_${Date.now()}@example.com`,
        full_name: 'Deleted User',
        phone: null,
        avatar_url: null
      })
      .eq('user_id', userId);
    
    // Log the deletion
    await auditLogger.logAction('user_data_deleted', { userId });
  },
  
  // Consent management
  updateConsent: async (userId: string, consents: any) => {
    await supabase
      .from('user_consents')
      .upsert({
        user_id: userId,
        consents,
        updated_at: new Date().toISOString()
      });
  }
};
```

## 🚨 **Incident Response**

### **Security Incident Handling:**
```typescript
export const incidentResponse = {
  // Immediate response to security incidents
  handleSecurityIncident: async (incident: SecurityIncident) => {
    // 1. Log the incident
    await auditLogger.logSecurityEvent(incident.type, 'critical');
    
    // 2. Notify security team
    await sendSecurityAlert(incident);
    
    // 3. Take immediate action based on incident type
    switch (incident.type) {
      case 'data_breach':
        await lockdownSystem();
        break;
      case 'unauthorized_access':
        await revokeUserSessions(incident.userId);
        break;
      case 'malware_detected':
        await quarantineAffectedSystems();
        break;
    }
    
    // 4. Start investigation
    await startIncidentInvestigation(incident);
  },
  
  // System lockdown procedures
  lockdownSystem: async () => {
    // Disable new logins
    await redis.set('system_lockdown', 'true', 'EX', 3600);
    
    // Revoke all active sessions
    await supabase.auth.admin.signOutAllUsers();
    
    // Notify all users
    await sendSystemAlert('System temporarily unavailable for security maintenance');
  }
};
```

## 📋 **Security Checklist**

### **Pre-deployment Security Audit:**
- [ ] **Authentication**: MFA enabled, strong password policy
- [ ] **Authorization**: RBAC implemented, RLS policies active
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Encryption**: Data encrypted at rest and in transit
- [ ] **Headers**: Security headers configured
- [ ] **Rate Limiting**: API rate limits implemented
- [ ] **Monitoring**: Audit logging and alerting active
- [ ] **Backup**: Secure backup procedures in place
- [ ] **Updates**: All dependencies up to date
- [ ] **Testing**: Security tests passed

### **Regular Security Maintenance:**
- [ ] **Weekly**: Review audit logs and security events
- [ ] **Monthly**: Update dependencies and security patches
- [ ] **Quarterly**: Penetration testing and vulnerability assessment
- [ ] **Annually**: Full security audit and compliance review

---

**⚠️ חשוב:** אבטחה היא תהליך מתמשך, לא אירוע חד-פעמי. יש לעדכן ולשפר את האמצעים באופן קבוע.