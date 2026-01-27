// lib/life_sciences_app_lib/apiClient.js
// API client that automatically includes Authorization headers

import { getAccessToken, clearTokens } from "./auth";
import { CONFIG } from "./config";

export class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

async function makeRequest(endpoint, options = {}) {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new ApiError("Not authenticated", 401, null);
  }

  const url = `${CONFIG.apiBaseUrl}${endpoint}`;
  
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If 401, clear tokens and throw
    if (response.status === 401) {
      clearTokens();
      throw new ApiError("Session expired", 401, response);
    }

    // If not ok, throw error
    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(
        `API request failed: ${response.status}`,
        response.status,
        error
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message, 0, null);
  }
}

// API Methods
export const api = {
  // Documents
  async getDocuments() {
    return makeRequest("/documents");
  },

  async getDocument(documentId) {
    return makeRequest(`/documents/${documentId}`);
  },

  async getDocumentAudit(documentId) {
    return makeRequest(`/documents/${documentId}/audit`);
  },

  async downloadDocument(documentId) {
    return makeRequest(`/documents/${documentId}/download`);
  },

  // Upload
  async initUpload(metadata) {
    return makeRequest("/documents/upload/init", {
      method: "POST",
      body: JSON.stringify(metadata),
    });
  },

  async submitDocument(documentId, metadata) {
    return makeRequest("/documents/submit", {
      method: "POST",
      body: JSON.stringify({ documentId, ...metadata }),
    });
  },

  // Approvals
  async getPendingApprovals() {
    return makeRequest("/approvals/pending");
  },

  async approveDocument(documentId, comments) {
    return makeRequest(`/approvals/${documentId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  },

  async rejectDocument(documentId, comments) {
    return makeRequest(`/approvals/${documentId}/reject`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  },
};

export default api;