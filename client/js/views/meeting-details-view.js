// meeting-details-view.js - View for showing meeting details
export class MeetingDetailsView {
    constructor(app) {
        this.app = app;
        this.template = document.getElementById('meeting-details-template');
        this.currentMeeting = null;
    }

    show(meeting) {
        this.currentMeeting = meeting;

        // Clone the template content
        const content = this.template.content.cloneNode(true);

        // Populate details with meeting data
        const titleElement = content.querySelector('#meeting-details-title');
        const dateElement = content.querySelector('#meeting-details-date');
        const timeElement = content.querySelector('#meeting-details-time');

        if (titleElement) titleElement.textContent = meeting.title;

        if (dateElement) {
            const dateObj = new Date(meeting.date);
            dateElement.textContent = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (timeElement) {
            timeElement.textContent = `${meeting.startTime} - ${meeting.endTime}`;
        }

        // Add the modal to the page
        document.body.appendChild(content);

        // Get the modal element that was just added
        const modal = document.getElementById('meeting-details-modal');
        if (modal) {
            modal.style.display = 'flex';
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    hide() {
        const modal = document.getElementById('meeting-details-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.querySelector('#meeting-details-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Edit button
        const editBtn = document.getElementById('edit-meeting-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.hide();
                this.app.showMeetingForm('edit', this.currentMeeting);
            });
        }

        // Delete button
        const deleteBtn = document.getElementById('delete-meeting-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.app.showConfirmDialog(
                    'Delete Meeting',
                    `Are you sure you want to delete "${this.currentMeeting.title}"?`,
                    async () => {
                        const result = await this.app.deleteMeeting(this.currentMeeting.title);
                        if (result.success) {
                            this.hide();
                        } else {
                            // Show error in the modal (we could add an error div for this)
                            alert(result.message || 'Failed to delete meeting.');
                        }
                    }
                );
            });
        }
    }
}