// Fixed auth-service.js with correct import path
import {api} from '../fajax.js';

export class AuthService {
    constructor() {
        this.currentUser = this.loadUserFromStorage();
    }

    // Load user data from localStorage
    loadUserFromStorage() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data from storage:', e);
                return null;
            }
        }
        return null;
    }

    // Save user data to localStorage
    saveUserToStorage(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.currentUser = userData;
    }

    // Clear user data from localStorage
    clearSession() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser && !!this.currentUser.sessionID;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Login a user
    async login(username, password) {
        try {
            // Hash the password (in a real app, use a proper hashing library)
            // Here we're just using a simple hash function for demonstration
            const hashedPassword = this.simpleHash(password);

            const response = await api.login(username, hashedPassword);

            if (response && response.status === 200 && response.data) {
                const userData = {
                    username: username,
                    sessionID: response.data.sessionID
                };

                this.saveUserToStorage(userData);
                return response;
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register a new user
    async register(username, email, password) {
        try {
            // Hash the password
            const hashedPassword = this.simpleHash(password);

            const response = await api.register(username, email, hashedPassword);

            if (response && response.status === 200 && response.data) {
                const userData = {
                    username: username,
                    sessionID: response.data.sessionID
                };

                this.saveUserToStorage(userData);
                return response;
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout a user
    async logout(username, sessionID) {
        try {
            return await api.logout(username, sessionID);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            this.clearSession();
        }
    }

    // Simple hash function for passwords
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}