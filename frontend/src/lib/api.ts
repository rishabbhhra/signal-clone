const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("signal_token");
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_token", token);
    }
  }

  public removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("signal_token");
      localStorage.removeItem("signal_user");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth
  async requestOtp(identifier: string) {
    return this.request<{ message: string; otp: string; hint: string }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
  }

  async verifyOtp(identifier: string, otp: string, display_name?: string, avatar_url?: string) {
    return this.request<{ access_token: string; token_type: string; user: any }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, otp, display_name, avatar_url }),
    });
  }

  async switchUser(user_id: string) {
    return this.request<{ access_token: string; token_type: string; user: any }>("/api/auth/switch-user", {
      method: "POST",
      body: JSON.stringify({ user_id }),
    });
  }

  async getMe() {
    return this.request<any>("/api/auth/me");
  }

  async getSeedUsers() {
    return this.request<any[]>("/api/auth/seed-users");
  }

  // Users
  async searchUsers(q?: string) {
    const url = q ? `/api/users?q=${encodeURIComponent(q)}` : "/api/users";
    return this.request<any[]>(url);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  async updateProfile(data: { display_name?: string; bio?: string; avatar_url?: string }) {
    return this.request<any>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getSafetyNumber(user_id: string) {
    return this.request<{
      safety_number: string;
      current_user_name: string;
      contact_name: string;
      verified: boolean;
      encryption_protocol: string;
    }>(`/api/users/${user_id}/safety-number`);
  }

  // Contacts
  async getContacts() {
    return this.request<any[]>("/api/contacts");
  }

  async addContact(identifier: string, nickname?: string) {
    return this.request<any>("/api/contacts", {
      method: "POST",
      body: JSON.stringify({ identifier, nickname }),
    });
  }

  async removeContact(contactId: string) {
    return this.request<void>(`/api/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  // Conversations
  async getConversations() {
    return this.request<any[]>("/api/conversations");
  }

  async getConversation(id: string) {
    return this.request<any>(`/api/conversations/${id}`);
  }

  async createDirectConversation(contact_user_id: string) {
    return this.request<any>("/api/conversations/direct", {
      method: "POST",
      body: JSON.stringify({ contact_user_id }),
    });
  }

  async createGroupConversation(name: string, member_ids: string[], avatar_url?: string) {
    return this.request<any>("/api/conversations/group", {
      method: "POST",
      body: JSON.stringify({ name, member_ids, avatar_url }),
    });
  }

  async addGroupMember(conv_id: string, user_id: string) {
    return this.request<any>(`/api/conversations/${conv_id}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id }),
    });
  }

  async removeGroupMember(conv_id: string, user_id: string) {
    return this.request<any>(`/api/conversations/${conv_id}/members/${user_id}`, {
      method: "DELETE",
    });
  }

  async updateDisappearing(conv_id: string, disappearing_seconds: number) {
    return this.request<any>(`/api/conversations/${conv_id}/disappearing`, {
      method: "PATCH",
      body: JSON.stringify({ disappearing_seconds }),
    });
  }

  // Messages
  async getMessages(conv_id: string) {
    return this.request<any[]>(`/api/conversations/${conv_id}/messages`);
  }

  async sendMessage(conv_id: string, payload: {
    content?: string;
    message_type?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    reply_to_id?: string;
  }) {
    return this.request<any>(`/api/conversations/${conv_id}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async markConversationRead(conv_id: string) {
    return this.request<any>(`/api/conversations/${conv_id}/read`, {
      method: "POST",
    });
  }

  async toggleReaction(message_id: string, emoji: string) {
    return this.request<any>(`/api/messages/${message_id}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  }

  async deleteMessage(message_id: string) {
    return this.request<any>(`/api/messages/${message_id}`, {
      method: "DELETE",
    });
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<{
      file_url: string;
      file_name: string;
      file_size: number;
      message_type: string;
    }>("/api/upload", {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient();
