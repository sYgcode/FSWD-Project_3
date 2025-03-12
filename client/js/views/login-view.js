// login-view.js - Login page view
export class LoginView {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('app');
        this.template = document.getElementById('login-template');
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
            if (e.target.id === 'show-register') {
                e.preventDefault();
                this.app.router.navigate('register');
            }
        });
    }

    setupFormEventListeners() {
        // Form event listeners (dependent on rendered elements)
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        // Get form inputs
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorElement = document.getElementById('login-error');

        // Validate inputs
        if (!usernameInput.value || !passwordInput.value) {
            errorElement.textContent = 'Please enter both username and password.';
            errorElement.style.display = 'block';
            return;
        }

        // Clear previous error
        errorElement.style.display = 'none';

        // Submit login request
        const result = await this.app.login(usernameInput.value, passwordInput.value);

        if (!result.success) {
            errorElement.textContent = result.message || 'Login failed. Please try again.';
            errorElement.style.display = 'block';
        }
    }
}