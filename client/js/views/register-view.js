// register-view.js - Registration page view
export class RegisterView {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('app');
        this.template = document.getElementById('register-template');
        this.setupEventListeners();
    }

    render() {
        // Clear the container
        this.container.innerHTML = '';

        // Clone the template content
        const content = this.template.content.cloneNode(true);

        // Append the content to the container
        this.container.appendChild(content);

        // Setup event listeners for the new elements
        this.setupFormEventListeners();
    }

    setupEventListeners() {
        // Global event listeners (not dependent on rendered elements)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'show-login') {
                e.preventDefault();
                this.app.router.navigate('login');
            }
        });
    }

    setupFormEventListeners() {
        // Form event listeners (dependent on rendered elements)
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        // Get form inputs
        const usernameInput = document.getElementById('register-username');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const errorElement = document.getElementById('register-error');

        // Validate inputs
        if (!usernameInput.value || !emailInput.value || !passwordInput.value) {
            errorElement.textContent = 'Please fill in all fields.';
            errorElement.style.display = 'block';
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            errorElement.textContent = 'Please enter a valid email address.';
            errorElement.style.display = 'block';
            return;
        }

        // Clear previous error
        errorElement.style.display = 'none';

        // Submit registration request
        const result = await this.app.register(
            usernameInput.value,
            emailInput.value,
            passwordInput.value
        );

        if (!result.success) {
            errorElement.textContent = result.message || 'Registration failed. Please try again.';
            errorElement.style.display = 'block';
        }
    }
}