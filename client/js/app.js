// app.js - Main application entry point
import { Router } from './router.js';
import { AuthService } from './services/auth-service.js';
import { MeetingService } from './services/meeting-service.js';
import { LoginView } from './views/login-view.js';
import { RegisterView } from './views/register-view.js';
import { CalendarView } from './views/calendar-view.js';
import { MeetingFormView } from './views/meeting-form-view.js';
import { MeetingDetailsView } from './views/meeting-details-view.js';
import { ConfirmDialogView } from './views/confirm-dialog-view.js';

// Application class
class App {
    constructor() {
        this.router = new Router();
        this.authService = new AuthService();
        this.meetingService = new MeetingService();

        // Initialize views
        this.loginView = new LoginView(this);
        this.registerView = new RegisterView(this);
        this.calendarView = new CalendarView(this);
        this.meetingFormView = new MeetingFormView(this);
        this.meetingDetailsView = new MeetingDetailsView(this);
        this.confirmDialogView = new ConfirmDialogView();

        // Setup routes
        this.setupRoutes();

        // Check auth status and initialize
        this.initialize();
    }

    setupRoutes() {
        this.router.addRoute('login', () => {
            this.loginView.render();
        });

        this.router.addRoute('register', () => {
            this.registerView.render();
        });

        this.router.addRoute('calendar', () => {
            if (this.authService.isAuthenticated()) {
                this.calendarView.render();
                this.loadMeetings();
            } else {
                this.router.navigate('login');
            }
        });

        // Default route
        this.router.setDefaultRoute('login');
    }

    initialize() {
        // Check if user is already logged in
        if (this.authService.isAuthenticated()) {
            this.router.navigate('calendar');
        } else {
            this.router.navigate('login');
        }

        // Set up event delegation for app-wide events
        document.addEventListener('click', (e) => {
            // Handle navigation events
            if (e.target.matches('#show-register')) {
                e.preventDefault();
                this.router.navigate('register');
            } else if (e.target.matches('#show-login')) {
                e.preventDefault();
                this.router.navigate('login');
            }
        });
    }

    async login(username, password) {
        try {
            const response = await this.authService.login(username, password);
            if (response && response.status === 200) {
                this.router.navigate('calendar');
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response ? response.message : 'Login failed. Please try again.'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    }

    async register(username, email, password) {
        try {
            const response = await this.authService.register(username, email, password);
            if (response && response.status === 200) {
                this.router.navigate('calendar');
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response ? response.message : 'Registration failed. Please try again.'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    }

    async logout() {
        try {
            const user = this.authService.getCurrentUser();
            if (user) {
                await this.authService.logout(user.username, user.sessionID);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.authService.clearSession();
            this.router.navigate('login');
        }
    }

    async loadMeetings() {
        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await this.meetingService.getMeetings(user.username, user.sessionID);
            if (response && response.status === 200 && response.data && response.data.meetings) {
                this.calendarView.displayMeetings(response.data.meetings);
                return response.data.meetings;
            } else {
                console.error('Failed to load meetings:', response ? response.message : 'Unknown error');
                return [];
            }
        } catch (error) {
            console.error('Error loading meetings:', error);
            return [];
        }
    }

    async addMeeting(meetingData) {
        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await this.meetingService.addMeeting(
                user.username,
                user.sessionID,
                meetingData.title,
                meetingData.date,
                meetingData.startTime,
                meetingData.endTime
            );

            if (response && response.status === 200) {
                // Reload meetings to refresh the list
                await this.loadMeetings();
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response ? response.message : 'Failed to add meeting.'
                };
            }
        } catch (error) {
            console.error('Error adding meeting:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    }

    async updateMeeting(meetingData) {
        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await this.meetingService.updateMeeting(
                user.username,
                user.sessionID,
                meetingData.title,
                meetingData.date,
                meetingData.startTime,
                meetingData.endTime
            );

            if (response && response.status === 200) {
                // Reload meetings to refresh the list
                await this.loadMeetings();
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response ? response.message : 'Failed to update meeting.'
                };
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    }

    async deleteMeeting(title) {
        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await this.meetingService.deleteMeeting(
                user.username,
                user.sessionID,
                title
            );

            if (response && response.status === 200) {
                // Reload meetings to refresh the list
                await this.loadMeetings();
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response ? response.message : 'Failed to delete meeting.'
                };
            }
        } catch (error) {
            console.error('Error deleting meeting:', error);
            return {
                success: false,
                message: 'Network error. Please try again later.'
            };
        }
    }

    showMeetingForm(mode = 'add', meetingData = null) {
        this.meetingFormView.show(mode, meetingData);
    }

    showMeetingDetails(meeting) {
        this.meetingDetailsView.show(meeting);
    }

    showConfirmDialog(title, message, onConfirm) {
        this.confirmDialogView.show(title, message, onConfirm);
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});