// FAJAX - Fake AJAX for client-server communication
class FXMLHttpRequest {
    constructor() {
        this.readyState = 0;
        this.status = 0;
        this.responseText = "";
        this.onreadystatechange = null;
        this.method = "";
        this.url = "";
        this.requestBody = null;
    }

    open(method, url) {
        this.method = method;
        this.url = url;
        this.readyState = 1;
        if (this.onreadystatechange) this.onreadystatechange();
    }

    setRequestHeader() {
        // Not needed for this implementation
    }

    send(body) {
        this.requestBody = body;
        this.readyState = 2;
        if (this.onreadystatechange) this.onreadystatechange();

        // Simulate network delay and potential packet loss
        Network.sendRequest(this.method, this.url, this.requestBody, (response) => {
            this.responseText = response;
            this.readyState = 4;
            this.status = JSON.parse(response).status;
            if (this.onreadystatechange) this.onreadystatechange();
        });
    }
}

// Network simulation class
class Network {
    static servers = {};
    static packetLossRate = 0.1; // 10% packet loss by default

    static registerServer(url, server) {
        this.servers[url] = server;
    }

    static sendRequest(method, url, body, callback) {
        // Simulate network delay (1-3 seconds)
        const delay = Math.random() * 2000 + 1000;

        // Simulate packet loss
        if (Math.random() < this.packetLossRate) {
            console.log("Network: Packet lost!");
            return;
        }

        setTimeout(() => {
            // Find the appropriate server for the URL
            const serverUrl = url.split('/')[0];
            if (this.servers[serverUrl]) {
                this.servers[serverUrl].handleRequest(method, url, body, callback);
            } else {
                callback(JSON.stringify({
                    status: 404,
                    message: "Server not found"
                }));
            }
        }, delay);
    }
}

// Client-side code for the calendar application
class CalendarClient {
    constructor() {
        this.sessionID = localStorage.getItem('sessionID') || null;
        this.username = localStorage.getItem('username') || null;
        this.baseUrl = "/meetings";
        this.initEventListeners();
        this.updateUIState();
    }

    // Initialize event listeners
    initEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            this.login(username, password);
        });

        // Register form
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const email = document.getElementById('register-email').value;
            this.register(username, password, email);
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Add meeting form
        document.getElementById('meeting-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('meeting-title').value;
            const date = document.getElementById('meeting-date').value;
            const startTime = document.getElementById('meeting-start').value;
            const endTime = document.getElementById('meeting-end').value;

            if (document.getElementById('meeting-form').dataset.mode === 'edit') {
                const originalTitle = document.getElementById('meeting-form').dataset.originalTitle;
                this.updateMeeting(originalTitle, title, date, startTime, endTime);
            } else {
                this.addMeeting(title, date, startTime, endTime);
            }
        });

        // Cancel button for meeting form
        document.getElementById('cancel-meeting-btn')?.addEventListener('click', () => {
            this.resetMeetingForm();
        });
    }

    // Update UI based on authentication state
    updateUIState() {
        const isLoggedIn = !!this.sessionID;

        // Show/hide elements based on login state
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = isLoggedIn ? 'block' : 'none';
        });

        document.querySelectorAll('.no-auth-required').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : 'block';
        });

        // Show username if logged in
        if (isLoggedIn && this.username) {
            document.getElementById('user-info').textContent = `Logged in as: ${this.username}`;
        }

        // Refresh meetings list if logged in
        if (isLoggedIn) {
            this.fetchMeetings();
        }
    }

    // Function 1: Login
    login(username, password) {
        const xhr = new FXMLHttpRequest();
        xhr.open("POST", "/login");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.sessionID = response.data.sessionID;
                    this.username = username;

                    // Store session info
                    localStorage.setItem('sessionID', this.sessionID);
                    localStorage.setItem('username', this.username);

                    this.updateUIState();
                    this.showNotification('Login successful!', 'success');
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Login failed!', 'error');
                }
            }
        };

        // Hash the password before sending
        const hashedPassword = this.hashPassword(password);
        const requestBody = JSON.stringify({
            username: username,
            password: hashedPassword
        });

        xhr.send(requestBody);
    }

    // Register new user
    register(username, password, email) {
        const xhr = new FXMLHttpRequest();
        xhr.open("POST", "/register");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.sessionID = response.data.sessionID;
                    this.username = username;

                    // Store session info
                    localStorage.setItem('sessionID', this.sessionID);
                    localStorage.setItem('username', this.username);

                    this.updateUIState();
                    this.showNotification('Registration successful!', 'success');
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Registration failed!', 'error');
                }
            }
        };

        // Hash the password before sending
        const hashedPassword = this.hashPassword(password);
        const requestBody = JSON.stringify({
            username: username,
            password: hashedPassword,
            email: email
        });

        xhr.send(requestBody);
    }

    // Function 2: Logout
    logout() {
        if (!this.sessionID || !this.username) {
            this.showNotification('Not logged in!', 'error');
            return;
        }

        const xhr = new FXMLHttpRequest();
        xhr.open("POST", "/logout");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                // Clear session regardless of server response
                this.sessionID = null;
                this.username = null;
                localStorage.removeItem('sessionID');
                localStorage.removeItem('username');

                if (xhr.status === 200) {
                    this.showNotification('Logout successful!', 'success');
                }

                this.updateUIState();
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID
        });

        xhr.send(requestBody);
    }

    // Fetch all meetings
    fetchMeetings() {
        if (!this.sessionID || !this.username) {
            this.showNotification('Please log in to view meetings', 'error');
            return;
        }

        const xhr = new FXMLHttpRequest();
        xhr.open("GET", this.baseUrl);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    this.displayMeetings(response.data.meetings || []);
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Failed to load meetings!', 'error');
                }
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID
        });

        xhr.send(requestBody);
    }

    // Function 3: Add meeting
    addMeeting(title, date, startTime, endTime) {
        if (!this.sessionID || !this.username) {
            this.showNotification('Please log in to add meetings', 'error');
            return;
        }

        const xhr = new FXMLHttpRequest();
        xhr.open("POST", this.baseUrl);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.showNotification('Meeting added successfully!', 'success');
                    this.resetMeetingForm();
                    this.fetchMeetings();
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Failed to add meeting!', 'error');
                }
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID,
            title: title,
            date: date,
            startTime: startTime,
            endTime: endTime
        });

        xhr.send(requestBody);
    }

    // Function 4: Remove meeting
    removeMeeting(title) {
        if (!this.sessionID || !this.username) {
            this.showNotification('Please log in to remove meetings', 'error');
            return;
        }

        const xhr = new FXMLHttpRequest();
        xhr.open("DELETE", this.baseUrl);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.showNotification('Meeting removed successfully!', 'success');
                    this.fetchMeetings();
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Failed to remove meeting!', 'error');
                }
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID,
            title: title
        });

        xhr.send(requestBody);
    }

    // Function 5: Update meeting
    updateMeeting(originalTitle, title, date, startTime, endTime) {
        if (!this.sessionID || !this.username) {
            this.showNotification('Please log in to update meetings', 'error');
            return;
        }

        // If title changed, first remove old meeting then add new one
        if (originalTitle !== title) {
            // First remove the old meeting
            this.removeMeetingThenAdd(originalTitle, title, date, startTime, endTime);
            return;
        }

        const xhr = new FXMLHttpRequest();
        xhr.open("PUT", this.baseUrl);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.showNotification('Meeting updated successfully!', 'success');
                    this.resetMeetingForm();
                    this.fetchMeetings();
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Failed to update meeting!', 'error');
                }
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID,
            title: title,
            date: date,
            startTime: startTime,
            endTime: endTime
        });

        xhr.send(requestBody);
    }

    // Helper: Remove meeting then add a new one (for title changes)
    removeMeetingThenAdd(originalTitle, newTitle, date, startTime, endTime) {
        const xhr = new FXMLHttpRequest();
        xhr.open("DELETE", this.baseUrl);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Now add the new meeting with updated title
                    this.addMeeting(newTitle, date, startTime, endTime);
                } else {
                    const response = JSON.parse(xhr.responseText);
                    this.showNotification(response.message || 'Failed to update meeting!', 'error');
                }
            }
        };

        const requestBody = JSON.stringify({
            username: this.username,
            sessionID: this.sessionID,
            title: originalTitle
        });

        xhr.send(requestBody);
    }

    // Helper function to display meetings
    displayMeetings(meetings) {
        const meetingsContainer = document.getElementById('meetings-list');
        if (!meetingsContainer) return;

        meetingsContainer.innerHTML = '';

        if (meetings.length === 0) {
            meetingsContainer.innerHTML = '<p>No meetings scheduled.</p>';
            return;
        }

        // Sort meetings by date and time
        meetings.sort((a, b) => {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        // Group meetings by date
        const meetingsByDate = {};
        meetings.forEach(meeting => {
            if (!meetingsByDate[meeting.date]) {
                meetingsByDate[meeting.date] = [];
            }
            meetingsByDate[meeting.date].push(meeting);
        });

        // Display meetings grouped by date
        for (const date in meetingsByDate) {
            const dateHeading = document.createElement('h3');
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            dateHeading.textContent = formattedDate;
            meetingsContainer.appendChild(dateHeading);

            const meetingsList = document.createElement('ul');
            meetingsList.className = 'meetings-date-group';

            meetingsByDate[date].forEach(meeting => {
                const meetingItem = document.createElement('li');
                meetingItem.className = 'meeting-item';

                const meetingTitle = document.createElement('h4');
                meetingTitle.textContent = meeting.title;

                const meetingTime = document.createElement('p');
                meetingTime.textContent = `${meeting.startTime} - ${meeting.endTime}`;

                const actionButtons = document.createElement('div');
                actionButtons.className = 'meeting-actions';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'edit-btn';
                editButton.addEventListener('click', () => this.editMeeting(meeting));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-btn';
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
                        this.removeMeeting(meeting.title);
                    }
                });

                actionButtons.appendChild(editButton);
                actionButtons.appendChild(deleteButton);

                meetingItem.appendChild(meetingTitle);
                meetingItem.appendChild(meetingTime);
                meetingItem.appendChild(actionButtons);

                meetingsList.appendChild(meetingItem);
            });

            meetingsContainer.appendChild(meetingsList);
        }
    }

    // Helper function to edit a meeting
    editMeeting(meeting) {
        const form = document.getElementById('meeting-form');

        // Set form to edit mode
        form.dataset.mode = 'edit';
        form.dataset.originalTitle = meeting.title;

        // Set form values
        document.getElementById('meeting-title').value = meeting.title;
        document.getElementById('meeting-date').value = meeting.date;
        document.getElementById('meeting-start').value = meeting.startTime;
        document.getElementById('meeting-end').value = meeting.endTime;

        // Update form submit button
        document.getElementById('meeting-submit').textContent = 'Update Meeting';

        // Show cancel button
        document.getElementById('cancel-meeting-btn').style.display = 'inline-block';

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    // Helper function to reset meeting form
    resetMeetingForm() {
        const form = document.getElementById('meeting-form');

        // Reset form to add mode
        form.dataset.mode = 'add';
        delete form.dataset.originalTitle;

        // Clear form values
        form.reset();

        // Update form submit button
        document.getElementById('meeting-submit').textContent = 'Add Meeting';

        // Hide cancel button
        document.getElementById('cancel-meeting-btn').style.display = 'none';
    }

    // Helper function to show notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility: Simple hash function (DO NOT USE IN PRODUCTION)
    hashPassword(password) {
        // This is a very simple hash for demonstration purposes only
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}

// Initialize the application once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalendarClient();

    // Register the server with the network
    const server = new Server();
    Network.registerServer("", server);
});