// hooks/useCSApi.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Simple API client class
class CSApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('cs_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
        window.location.href = '/cs/login';
        throw new Error('Authentication required');
      }
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data.data;
  }

  // Dashboard APIs
  async getDashboard(period: string = '7') {
    const response = await fetch(`${this.baseUrl}/api/cs/dashboard?period=${period}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAgentWorkload() {
    const response = await fetch(`${this.baseUrl}/api/cs/dashboard/workload`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAnalytics(period: string = '30', type: string = 'overview') {
    const response = await fetch(`${this.baseUrl}/api/cs/dashboard/analytics?period=${period}&type=${type}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Ticket APIs
  async getTickets(params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/api/cs/tickets?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTicket(id: string) {
    const response = await fetch(`${this.baseUrl}/api/cs/tickets/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createTicket(ticketData: any) {
    const response = await fetch(`${this.baseUrl}/api/cs/tickets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(ticketData),
    });
    return this.handleResponse(response);
  }

  async updateTicket(id: string, updates: any) {
    const response = await fetch(`${this.baseUrl}/api/cs/tickets/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse(response);
  }

  // Chat APIs
  async getChatSessions(params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions?${queryString}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getChatStats() {
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getChatSession(id: string) {
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async sendChatMessage(sessionId: string, message: string) {
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, sender: 'agent' }),
    });
    return this.handleResponse(response);
  }

  async assignChat(sessionId: string, agentId: string) {
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions/${sessionId}/assign`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ agentId }),
    });
    return this.handleResponse(response);
  }

  async endChat(sessionId: string, reason: string = 'resolved') {
    const response = await fetch(`${this.baseUrl}/api/cs/chat/sessions/${sessionId}/end`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response);
  }

  // AI APIs
  async getAiSuggestions(message: string) {
    const response = await fetch(`${this.baseUrl}/api/cs/ai/suggestions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    return this.handleResponse(response);
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cs_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
    }
  }
}

// Export singleton instance
export const csApi = new CSApiClient();

// React Hook for CS API
export function useCSApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const executeWithErrorHandling = useCallback(async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // If authentication error, redirect to login
      if (errorMessage.includes('Authentication required')) {
        router.push('/cs/login');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    loading,
    error,
    setError,
    executeWithErrorHandling,
    csApi
  };
}