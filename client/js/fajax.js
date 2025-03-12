// fajax.js - Corrected implementation for client-server communication
import { Network } from '/network/network.js';

export class FXMLHttpRequest {
    constructor() {
        this.readyState = 0;
        this.status = 0;
        this.statusText = '';
        this.response = null;
        this.responseText = '';
        this.onreadystatechange = null;
        this.onerror = null;
        this.onload = null;
        this.method = '';
        this.url = '';
        this.requestHeaders = {};
        this.responseHeaders = {};
        this.network = new Network(); // Create network instance directly
    }

    open(method, url) {
        this.method = method;
        this.url = url;
        this.readyState = 1;
        if (this.onreadystatechange) {
            this.onreadystatechange();
        }
    }

    setRequestHeader(header, value) {
        this.requestHeaders[header] = value;
    }

    send(body) {
        this.readyState = 2;
        if (this.onreadystatechange) {
            this.onreadystatechange();
        }

        this.network.sendRequest(this.method, this.url, body, (response) => {
            this.readyState = 4;
            const parsedResponse = JSON.parse(response);

            this.status = parsedResponse.status;
            this.statusText = parsedResponse.message;
            this.responseText = response;
            this.response = parsedResponse;

            if (this.onreadystatechange) {
                this.onreadystatechange();
            }

            if (this.status >= 200 && this.status < 300) {
                if (this.onload) {
                    this.onload();
                }
            } else {
                if (this.onerror) {
                    this.onerror();
                }
            }
        });
    }
}

// Utility functions for client-side API calls
export const api = {
    // Generic API request function
    request(method, url, data = null) {
        return new Promise((resolve, reject) => {
            const xhr = new FXMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = function() {
                resolve(xhr.response);
            };

            xhr.onerror = function() {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };

            if (data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    },

    // Login
    login(username, password) {
        return this.request('POST', '/login', { username, password });
    },

    // Register
    register(username, password, email) {
        return this.request('POST', '/register', { username, password, email });
    },

    // Logout
    logout(username, sessionID) {
        return this.request('POST', '/logout', { username, sessionID });
    },

    // Get meetings
    getMeetings(username, sessionID) {
        return this.request('GET', '/meetings', { username, sessionID });
    },

    // Get single meeting
    getMeeting(username, sessionID, title) {
        return this.request('GET', '/meetings', { username, sessionID, title });
    },

    // Add meeting
    addMeeting(username, sessionID, title, date, startTime, endTime) {
        return this.request('POST', '/meetings', {
            username,
            sessionID,
            title,
            date,
            startTime,
            endTime
        });
    },

    // Update meeting
    updateMeeting(username, sessionID, title, date, startTime, endTime) {
        return this.request('PUT', '/meetings', {
            username,
            sessionID,
            title,
            date,
            startTime,
            endTime
        });
    },

    // Delete meeting
    deleteMeeting(username, sessionID, title) {
        return this.request('DELETE', '/meetings', {
            username,
            sessionID,
            title
        });
    }
};