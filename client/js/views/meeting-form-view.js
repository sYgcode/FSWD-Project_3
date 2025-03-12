// meeting-form-view.js - Form for adding/editing meetings
export class MeetingFormView {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('app');
        this.template = document.getElementById('meeting-form-template');
        this.mode = 'add'; // 'add' or 'edit'
        this.currentMeeting = null;
    }

    show(mode = 'add', meetingData = null) {
        this.mode = mode;
        this.currentMeeting = meetingData;

        // Clone the template content
        const content = this.template.content.cloneNode(true);

        // Update form title based on mode
        const formTitle = content.querySelector('#meeting-form-title');
        if (formTitle) {
            formTitle.textContent = mode === 'add' ? 'Add Meeting' : 'Edit Meeting';
        }

        // If in edit mode, populate form with meeting data
        if (mode === 'edit' && meetingData) {
            const titleInput = content.querySelector('#meeting-title');
            const dateInput = content.querySelector('#meeting-date');
            const startTimeInput = content.querySelector('#meeting-start');
            const endTimeInput = content.querySelector('#meeting-end');

            if (titleInput) titleInput.value = meetingData.title;
            if (dateInput) dateInput.value = meetingData.date;
            if (startTimeInput) startTimeInput.value = meetingData.startTime;
            if (endTimeInput) endTimeInput.value = meetingData.endTime;

            // Disable title field in edit mode (since it's used as the key)
            if (titleInput) titleInput.disabled = true;
        }

        // Add the modal to the page
        document.body.appendChild(content);

        // Get the modal element that was just added
        const modal = document.getElementById('meeting-modal');
        if (modal) {
            modal.style.display = 'flex';
        }

        // Set up event listeners
        this.setupFormEventListeners();
    }

    hide() {
        const modal = document.getElementById('meeting-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }

    setupFormEventListeners() {
        // Close button
        const closeBtn = document.querySelector('#meeting-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Cancel button
        const cancelBtn = document.getElementById('meeting-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }

        // Form submission
        const form = document.getElementById('meeting-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Get form inputs
        const titleInput = document.getElementById('meeting-title');
        const dateInput = document.getElementById('meeting-date');
        const startTimeInput = document.getElementById('meeting-start');
        const endTimeInput = document.getElementById('meeting-end');
        const errorElement = document.getElementById('meeting-form-error');

        // Validate inputs
        if (!titleInput.value || !dateInput.value || !startTimeInput.value || !endTimeInput.value) {
            errorElement.textContent = 'Please fill in all fields.';
            errorElement.style.display = 'block';
            return;
        }

        // Validate time range
        if (startTimeInput.value >= endTimeInput.value) {
            errorElement.textContent = 'End time must be after start time.';
            errorElement.style.display = 'block';
            return;
        }

        // Clear previous error
        errorElement.style.display = 'none';

        // Create meeting data object
        const meetingData = {
            title: titleInput.value,
            date: dateInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value
        };

        let result;

        // Submit request based on mode
        if (this.mode === 'add') {
            result = await this.app.addMeeting(meetingData);
        } else {
            result = await this.app.updateMeeting(meetingData);
        }

        if (result.success) {
            // Close the form on success
            this.hide();
        } else {
            // Show error message
            errorElement.textContent = result.message || 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
        }
    }
}