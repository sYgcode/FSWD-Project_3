// confirm-dialog-view.js - Confirmation dialog for destructive actions
export class ConfirmDialogView {
    constructor() {
        this.template = document.getElementById('confirm-dialog-template');
        this.onConfirmCallback = null;
    }

    show(title, message, onConfirm) {
        this.onConfirmCallback = onConfirm;

        // Clone the template content
        const content = this.template.content.cloneNode(true);

        // Set title and message
        const titleElement = content.querySelector('#confirm-title');
        const messageElement = content.querySelector('#confirm-message');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        // Add the modal to the page
        document.body.appendChild(content);

        // Get the modal element that was just added
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.style.display = 'flex';
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    hide() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }

    setupEventListeners() {
        // Yes button
        const yesBtn = document.getElementById('confirm-yes-btn');
        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                if (this.onConfirmCallback) {
                    this.onConfirmCallback();
                }
                this.hide();
            });
        }

        // No button
        const noBtn = document.getElementById('confirm-no-btn');
        if (noBtn) {
            noBtn.addEventListener('click', () => {
                this.hide();
            });
        }
    }
}