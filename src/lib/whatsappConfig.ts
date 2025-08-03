// WhatsApp Configuration Management
// This module handles WhatsApp settings and provides role-based configuration

export interface WhatsAppSettings {
  token: string;
  phoneId: string;
  enabled: boolean;
  autoRespond: boolean;
  autoAssignLeads: boolean;
  businessHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  templates: {
    newLead: string;
    leadAssigned: string;
    meetingScheduled: string;
    paymentConfirmation: string;
    caseUpdate: string;
  };
}

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  token: '',
  phoneId: '',
  enabled: false,
  autoRespond: true,
  autoAssignLeads: true,
  businessHours: {
    enabled: false,
    start: '09:00',
    end: '17:00'
  },
  templates: {
    newLead: 'שלום! תודה על פנייתך אלינו. קיבלנו את הודעתך ועורך דין מהמשרד יחזור אליך בהקדם האפשרי. 📞⚖️',
    leadAssigned: 'שלום {customerName}! הלקוח שלך הועבר לטיפולו של עו"ד {lawyerName}. פרטי התקשרות: {lawyerPhone}. נשמח לעזור! 👨‍💼',
    meetingScheduled: 'פגישתך נקבעה בהצלחה! 📅\nתאריך: {date}\nשעה: {time}\nמיקום: {location}\nמצפים לראותך!',
    paymentConfirmation: 'תשלומך התקבל בהצלחה! 💳✅\nסכום: {amount} ₪\nמספר הזמנה: {orderId}',
    caseUpdate: 'עדכון בתיק שלך: {caseTitle}\n{updateMessage}\n\nלפרטים נוספים: {contactInfo}'
  }
};

// Role-based configuration for WhatsApp features
export const ROLE_WHATSAPP_FEATURES = {
  admin: {
    canConfigureSettings: true,
    canManageTemplates: true,
    canViewAnalytics: true,
    canAutoAssignLeads: true,
    canManageBusinessHours: true,
    availableTemplates: ['newLead', 'leadAssigned', 'meetingScheduled', 'paymentConfirmation', 'caseUpdate']
  },
  lawyer: {
    canConfigureSettings: true,
    canManageTemplates: true,
    canViewAnalytics: false,
    canAutoAssignLeads: false,
    canManageBusinessHours: true,
    availableTemplates: ['newLead', 'meetingScheduled', 'caseUpdate']
  },
  customer: {
    canConfigureSettings: false,
    canManageTemplates: false,
    canViewAnalytics: false,
    canAutoAssignLeads: false,
    canManageBusinessHours: false,
    availableTemplates: []
  },
  supplier: {
    canConfigureSettings: false,
    canManageTemplates: false,
    canViewAnalytics: false,
    canAutoAssignLeads: false,
    canManageBusinessHours: false,
    availableTemplates: []
  }
};

// Storage keys for WhatsApp settings
export const WHATSAPP_STORAGE_KEYS = {
  token: 'whatsapp_token',
  phoneId: 'whatsapp_phone_id',
  enabled: 'whatsapp_enabled',
  autoRespond: 'whatsapp_auto_respond',
  autoAssignLeads: 'whatsapp_auto_assign',
  businessHours: 'whatsapp_business_hours',
  templates: 'whatsapp_templates'
};

// Helper functions for managing WhatsApp settings
export class WhatsAppConfigManager {
  static loadSettings(): WhatsAppSettings {
    const settings = { ...DEFAULT_WHATSAPP_SETTINGS };
    
    try {
      settings.token = localStorage.getItem(WHATSAPP_STORAGE_KEYS.token) || '';
      settings.phoneId = localStorage.getItem(WHATSAPP_STORAGE_KEYS.phoneId) || '';
      settings.enabled = localStorage.getItem(WHATSAPP_STORAGE_KEYS.enabled) === 'true';
      settings.autoRespond = localStorage.getItem(WHATSAPP_STORAGE_KEYS.autoRespond) !== 'false';
      settings.autoAssignLeads = localStorage.getItem(WHATSAPP_STORAGE_KEYS.autoAssignLeads) !== 'false';
      
      const businessHours = localStorage.getItem(WHATSAPP_STORAGE_KEYS.businessHours);
      if (businessHours) {
        settings.businessHours = JSON.parse(businessHours);
      }
      
      const templates = localStorage.getItem(WHATSAPP_STORAGE_KEYS.templates);
      if (templates) {
        settings.templates = { ...settings.templates, ...JSON.parse(templates) };
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    }
    
    return settings;
  }

  static saveSettings(settings: WhatsAppSettings): void {
    try {
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.token, settings.token);
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.phoneId, settings.phoneId);
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.enabled, settings.enabled.toString());
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.autoRespond, settings.autoRespond.toString());
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.autoAssignLeads, settings.autoAssignLeads.toString());
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.businessHours, JSON.stringify(settings.businessHours));
      localStorage.setItem(WHATSAPP_STORAGE_KEYS.templates, JSON.stringify(settings.templates));
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      throw new Error('Failed to save WhatsApp settings');
    }
  }

  static getRoleFeatures(role: string) {
    return ROLE_WHATSAPP_FEATURES[role as keyof typeof ROLE_WHATSAPP_FEATURES] || ROLE_WHATSAPP_FEATURES.customer;
  }

  static validateSettings(settings: WhatsAppSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.token.trim()) {
      errors.push('נדרש WhatsApp API Token');
    }

    if (!settings.phoneId.trim()) {
      errors.push('נדרש Phone Number ID');
    }

    if (settings.businessHours.enabled) {
      if (!settings.businessHours.start || !settings.businessHours.end) {
        errors.push('נדרשות שעות פעילות תקינות');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static async testConnection(token: string, phoneId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  static formatTemplate(template: string, variables: Record<string, string>): string {
    let formatted = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      formatted = formatted.replace(regex, value);
    });

    return formatted;
  }

  static isWithinBusinessHours(settings: WhatsAppSettings): boolean {
    if (!settings.businessHours.enabled) {
      return true; // Always within hours if business hours are disabled
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const startTime = parseInt(settings.businessHours.start.replace(':', ''));
    const endTime = parseInt(settings.businessHours.end.replace(':', ''));

    return currentTime >= startTime && currentTime <= endTime;
  }
}