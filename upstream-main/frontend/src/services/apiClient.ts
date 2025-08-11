const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.hypercourt.com' 
  : 'http://localhost:5001';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string[];
}

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('hypercourt_access_token');
    this.refreshToken = localStorage.getItem('hypercourt_refresh_token');
  }

  private saveTokensToStorage(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('hypercourt_access_token', tokens.accessToken);
    localStorage.setItem('hypercourt_refresh_token', tokens.refreshToken);
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('hypercourt_access_token');
    localStorage.removeItem('hypercourt_refresh_token');
    localStorage.removeItem('hypercourt_user');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data: TokenResponse = await response.json();
        this.saveTokensToStorage(data.tokens);
        return true;
      } else {
        this.clearTokensFromStorage();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If token expired, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers.Authorization = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'שגיאה לא צפויה',
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'שגיאה בחיבור לשרת',
      };
    }
  }

  // Auth methods
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<ApiResponse<TokenResponse>> {
    const response = await this.makeRequest<TokenResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.saveTokensToStorage(response.data.tokens);
      if (response.data.user) {
        localStorage.setItem('hypercourt_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<TokenResponse>> {
    const response = await this.makeRequest<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.saveTokensToStorage(response.data.tokens);
      if (response.data.user) {
        localStorage.setItem('hypercourt_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await this.makeRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }
    this.clearTokensFromStorage();
  }

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    return this.makeRequest('/api/auth/profile');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest('/health');
  }

  // Generic methods for future endpoints
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Getters
  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  get currentAccessToken(): string | null {
    return this.accessToken;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;