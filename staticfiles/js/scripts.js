document.addEventListener('DOMContentLoaded', function () {
    const tokenUrl = 'http://127.0.0.1:8000/api/token/';
    const profileUrl = 'http://127.0.0.1:8000/api/v1/profile/';
    const contentDiv = document.getElementById('content');
    const loginLink = document.getElementById('login-link');
    const profileLink = document.getElementById('profile-link');

    function getToken() {
        return localStorage.getItem('token');
    }

    function setToken(token) {
        localStorage.setItem('token', token);
    }

    function fetchWithAuth(url, options) {
        options = options || {};
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + getToken();
        return fetch(url, options);
    }

    function login(username, password) {
        fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                setToken(data.access);
                loadProfile();
            } else {
                alert('Login failed');
            }
        });
    }

    function loadProfile() {
        fetchWithAuth(profileUrl)
            .then(response => response.json())
            .then(data => {
                contentDiv.innerHTML = `<h2>Welcome, ${data.user.username}</h2>`;
                loginLink.style.display = 'none';
                profileLink.style.display = 'inline';
            });
    }

    function showLoginForm() {
        contentDiv.innerHTML = `
            <h2>Login</h2>
            <form id="login-form">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password">
                <button type="submit">Login</button>
            </form>
        `;

        document.getElementById('login-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        showLoginForm();
    });

    // Show login form by default
    showLoginForm();
});
