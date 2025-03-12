// Fixed meeting-service.js with correct import path
import {api} from '../fajax.js';

export class MeetingService {
    constructor() {
        // Meetings cache
        this.meetings = [];
    }

    // Get all meetings for a user
    async getMeetings(username, sessionID) {
        try {
            const response = await api.getMeetings(username, sessionID);

            if (response && response.status === 200 && response.data) {
                this.meetings = response.data.meetings || [];
            }

            return response;
        } catch (error) {
            console.error('Get meetings error:', error);
            throw error;
        }
    }

    // Get a specific meeting by title
    async getMeeting(username, sessionID, title) {
        try {
            return await api.getMeeting(username, sessionID, title);
        } catch (error) {
            console.error('Get meeting error:', error);
            throw error;
        }
    }

    // Add a new meeting
    async addMeeting(username, sessionID, title, date, startTime, endTime) {
        try {
            return await api.addMeeting(username, sessionID, title, date, startTime, endTime);
        } catch (error) {
            console.error('Add meeting error:', error);
            throw error;
        }
    }

    // Update an existing meeting
    async updateMeeting(username, sessionID, title, date, startTime, endTime) {
        try {
            return await api.updateMeeting(username, sessionID, title, date, startTime, endTime);
        } catch (error) {
            console.error('Update meeting error:', error);
            throw error;
        }
    }

    // Delete a meeting
    async deleteMeeting(username, sessionID, title) {
        try {
            return await api.deleteMeeting(username, sessionID, title);
        } catch (error) {
            console.error('Delete meeting error:', error);
            throw error;
        }
    }

    // Format meeting date for display
    formatDate(dateString) {
        const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Format meeting time for display
    formatTime(timeString) {
        return timeString;
    }

    // Get cached meetings
    getCachedMeetings() {
        return this.meetings;
    }

    // Find a meeting by title in the cache
    findMeetingByTitle(title) {
        return this.meetings.find(meeting => meeting.title === title);
    }
}