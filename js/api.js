// API Configuration
const API_BASE_URL = window.location.origin;

// API Client
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Submit audit request
    async submitAuditRequest(formData) {
        return this.request('/api/audit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Get all audit requests (admin)
    async getAuditRequests(page = 1, limit = 10) {
        return this.request(`/api/audit?page=${page}&limit=${limit}`, {
            method: 'GET'
        });
    }

    // Get single audit request
    async getAuditRequest(id) {
        return this.request(`/api/audit/${id}`, {
            method: 'GET'
        });
    }
}

// Export API client instance
const api = new APIClient(API_BASE_URL);
