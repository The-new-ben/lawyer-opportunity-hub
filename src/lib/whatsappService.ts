// whatsappService.ts
// This module provides a helper to send messages via the WhatsApp Cloud API.
// It expects environment variables to contain the WhatsApp Business Phone Number ID
// and an access token. These values must be configured in a .env file and passed
// through Vite (prefix `VITE_`). See WhatsApp Cloud API docs for details on
// available message types and required consent windows.

import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { WhatsAppConfigManager, type WhatsAppSettings } from "./whatsappConfig";

const WHATSAPP_BASE_URL = "https://graph.facebook.com/v19.0";

// Helper functions to get WhatsApp configuration
function getWhatsAppConfig() {
  const settings = WhatsAppConfigManager.loadSettings();
  return { phoneId: settings.phoneId, token: settings.token, enabled: settings.enabled };
}

function validateWhatsAppConfig() {
  const { phoneId, token, enabled } = getWhatsAppConfig();
  
  if (!enabled) {
    console.log('WhatsApp service is disabled');
    return false;
  }
  
  if (!phoneId || !token) {
    toast({
      title: 'WhatsApp not configured',
      description: 'Please configure WhatsApp details on the settings page',
      variant: 'destructive'
    });
    return false;
  }
  return true;
}

// Send a simple text message to a recipient phone number. You must ensure that the
// recipient has opted-in to receive messages, and that the message is sent within
// a valid customer service window.
export async function sendWhatsAppTextMessage(
  to: string,
  text: string
): Promise<void> {
  if (!validateWhatsAppConfig()) {
    return; // Skip silently if not configured
  }
  
  const { phoneId, token } = getWhatsAppConfig();
  const url = `${WHATSAPP_BASE_URL}/${phoneId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: text },
  };
  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    toast({
      title: 'Failed to send WhatsApp message',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    throw error;
  }
}

// Example function to send a templated message. Templates must be pre-approved on
// the WhatsApp Business Manager. See WhatsApp documentation for usage and
// restrictions.
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  language: string = "he" // default to Hebrew
): Promise<void> {
  if (!validateWhatsAppConfig()) {
    return; // Skip silently if not configured
  }
  
  const { phoneId, token } = getWhatsAppConfig();
  const url = `${WHATSAPP_BASE_URL}/${phoneId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
    },
  };
  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    toast({
      title: 'Failed to send WhatsApp template message',
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive'
    });
    throw error;
  }
}

// Send a custom template message with variables
export async function sendWhatsAppCustomTemplate(
  to: string,
  templateKey: keyof WhatsAppSettings['templates'],
  variables: Record<string, string> = {}
): Promise<void> {
  if (!validateWhatsAppConfig()) {
    return;
  }

  const settings = WhatsAppConfigManager.loadSettings();
  const template = settings.templates[templateKey];
  
  if (!template) {
    toast({
      title: 'Template error',
      description: `Template '${String(templateKey)}' not found`,
      variant: 'destructive'
    });
    return;
  }

  const messageText = WhatsAppConfigManager.formatTemplate(template, variables);
  await sendWhatsAppTextMessage(to, messageText);
}

// Send new lead acknowledgment
export async function sendNewLeadAcknowledgment(to: string): Promise<void> {
  await sendWhatsAppCustomTemplate(to, 'newLead');
}

// Send lead assignment notification
export async function sendLeadAssignmentNotification(
  to: string,
  customerName: string,
  lawyerName: string,
  lawyerPhone: string
): Promise<void> {
  await sendWhatsAppCustomTemplate(to, 'leadAssigned', {
    customerName,
    lawyerName,
    lawyerPhone
  });
}

// Send meeting scheduled notification
export async function sendMeetingScheduledNotification(
  to: string,
  date: string,
  time: string,
  location: string
): Promise<void> {
  await sendWhatsAppCustomTemplate(to, 'meetingScheduled', {
    date,
    time,
    location
  });
}

// Send payment confirmation
export async function sendPaymentConfirmation(
  to: string,
  amount: string,
  orderId: string
): Promise<void> {
  await sendWhatsAppCustomTemplate(to, 'paymentConfirmation', {
    amount,
    orderId
  });
}

// Send case update notification
export async function sendCaseUpdateNotification(
  to: string,
  caseTitle: string,
  updateMessage: string,
  contactInfo: string
): Promise<void> {
  await sendWhatsAppCustomTemplate(to, 'caseUpdate', {
    caseTitle,
    updateMessage,
    contactInfo
  });
}

// Check if WhatsApp service is enabled and within business hours
export function isWhatsAppAvailable(): boolean {
  const settings = WhatsAppConfigManager.loadSettings();
  
  if (!settings.enabled) {
    return false;
  }

  return WhatsAppConfigManager.isWithinBusinessHours(settings);
}

// Get WhatsApp service status
export function getWhatsAppStatus(): {
  enabled: boolean;
  configured: boolean;
  withinBusinessHours: boolean;
  settings: {
    hasToken: boolean;
    hasPhoneId: boolean;
    autoRespond: boolean;
    businessHoursEnabled: boolean;
  };
} {
  const settings = WhatsAppConfigManager.loadSettings();
  const { phoneId, token, enabled } = getWhatsAppConfig();
  
  return {
    enabled,
    configured: !!(phoneId && token),
    withinBusinessHours: WhatsAppConfigManager.isWithinBusinessHours(settings),
    settings: {
      hasToken: !!token,
      hasPhoneId: !!phoneId,
      autoRespond: settings.autoRespond,
      businessHoursEnabled: settings.businessHours.enabled
    }
  };
}
