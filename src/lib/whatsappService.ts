// whatsappService.ts
// This module provides a helper to send messages via the WhatsApp Cloud API.
// It expects environment variables to contain the WhatsApp Business Phone Number ID
// and an access token. These values must be configured in a .env file and passed
// through Vite (prefix `VITE_`). See WhatsApp Cloud API docs for details on
// available message types and required consent windows.

import axios from "axios";

const WHATSAPP_BASE_URL = "https://graph.facebook.com/v19.0";
// Read configuration from environment variables (Vite or Node)
const PHONE_NUMBER_ID =
  (import.meta as { env: Record<string, string | undefined> }).env
    .VITE_WHATSAPP_PHONE_ID ||
  process.env.VITE_WHATSAPP_PHONE_ID ||
  "";
const ACCESS_TOKEN =
  (import.meta as { env: Record<string, string | undefined> }).env
    .VITE_WHATSAPP_TOKEN ||
  process.env.VITE_WHATSAPP_TOKEN ||
  "";

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.warn(
    "WhatsApp environment variables missing - messaging disabled"
  );
}

// Send a simple text message to a recipient phone number. You must ensure that the
// recipient has opted-in to receive messages, and that the message is sent within
// a valid customer service window.
export async function sendWhatsAppTextMessage(
  to: string,
  text: string
): Promise<void> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn(
      "WhatsApp message skipped - environment variables missing"
    );
    return; // Skip silently
  }
  const url = `${WHATSAPP_BASE_URL}/${PHONE_NUMBER_ID}/messages`;
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
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to send WhatsApp message", error);
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
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn(
      "WhatsApp template message skipped - environment variables missing"
    );
    return;
  }
  const url = `${WHATSAPP_BASE_URL}/${PHONE_NUMBER_ID}/messages`;
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
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to send WhatsApp template message", error);
    throw error;
  }
}
