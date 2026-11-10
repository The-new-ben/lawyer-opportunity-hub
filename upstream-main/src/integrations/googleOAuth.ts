import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // This should be set from environment or config
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar';
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

class GoogleAuth {
  private clientId: string;
  private scopes: string;
  private redirectUri: string;

  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.scopes = GOOGLE_SCOPES;
    this.redirectUri = REDIRECT_URI;
  }

  // Method 1: OAuth2 Flow - Redirect to Google
  initiateOAuth() {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.scopes);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    window.location.href = authUrl.toString();
  }

  // Method 2: Google Identity Services (One-Tap)
  async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  async initializeGoogleSignIn(): Promise<void> {
    await this.loadGoogleIdentityServices();
    
    // @ts-expect-error - Google Identity Services global
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  async showOneTap(): Promise<void> {
    await this.initializeGoogleSignIn();
    // @ts-expect-error Google Identity Services prompt
    window.google.accounts.id.prompt();
  }

  async renderSignInButton(elementId: string): Promise<void> {
    await this.initializeGoogleSignIn();
    // @ts-expect-error Google Identity Services renderButton
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      }
    );
  }

  private async handleCredentialResponse(response: { credential: string }) {
    try {
      // Here you would typically verify the JWT token with your backend
      toast({
        title: 'Google credential response',
        description: JSON.stringify(response)
      });
      
      // Store the credential for calendar access
      localStorage.setItem('google_credential', response.credential);
      
      // You might want to exchange this for an access token
      await this.exchangeCredentialForAccessToken(response.credential);
    } catch (error) {
      toast({
        title: 'Error handling Google credential',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
    }
  }

  // Method 3: Direct API Key Access (Public Calendar Data Only)
  async getPublicCalendarEvents(calendarId: string = 'primary'): Promise<unknown> {
    const apiKey = 'YOUR_PUBLIC_API_KEY'; // This should be your public API key
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      toast({
        title: 'Error fetching public calendar events',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthResponse> {
    try {
      // This should be done in your backend/edge function for security
      const { data, error } = await supabase.functions.invoke('google-oauth-exchange', {
        body: { code, redirect_uri: this.redirectUri }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        title: 'Error exchanging code for tokens',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
      throw error;
    }
  }

  private async exchangeCredentialForAccessToken(credential: string): Promise<void> {
    try {
      // This should also be done in your backend for security
      const { data, error } = await supabase.functions.invoke('google-credential-exchange', {
        body: { credential }
      });

      if (error) throw error;
      
      // Store the access token
      localStorage.setItem('google_access_token', data.access_token);
      localStorage.setItem('google_token_expires', (Date.now() + data.expires_in * 1000).toString());
    } catch (error) {
      toast({
        title: 'Error exchanging credential for access token',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Get stored access token
  getStoredAccessToken(): string | null {
    const token = localStorage.getItem('google_access_token');
    const expires = localStorage.getItem('google_token_expires');
    
    if (token && expires && Date.now() < parseInt(expires)) {
      return token;
    }
    
    // Token expired or doesn't exist
    this.clearStoredTokens();
    return null;
  }

  // Clear stored tokens
  clearStoredTokens(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expires');
    localStorage.removeItem('google_credential');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getStoredAccessToken() !== null;
  }
}

export const googleAuth = new GoogleAuth();
export type { GoogleAuthResponse };