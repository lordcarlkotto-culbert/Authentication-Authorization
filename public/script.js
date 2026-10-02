document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const systemMsg = document.getElementById('system-msg');
    const welcomeBanner = document.getElementById('welcome-banner');
    const dashboardData = document.getElementById('dashboard-data');

    // Users list from HTML
    const usersList = document.getElementById('users-list');

    const API_URL = 'http://localhost:3000';


    // --------------------------------------------------
    // Show Message
    // --------------------------------------------------

    const showMessage = (text, isError = false) => {
        systemMsg.innerText = text;
        systemMsg.style.color = isError ? '#dc3545' : '#28a745';
    };


    // --------------------------------------------------
    // 1. Sign Up
    // --------------------------------------------------

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username =
            document.getElementById('signup-username').value.trim();

        const email =
            document.getElementById('signup-email').value.trim();

        const password =
            document.getElementById('signup-password').value;

        try {

            const res = await fetch(`${API_URL}/api/signup`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await res.json();

            if (res.ok) {

                showMessage(data.message, false);

                signupForm.reset();

            } else {

                showMessage(
                    data.message || 'Registration failed.',
                    true
                );
            }

        } catch (error) {

            console.error('Signup error:', error);

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    });


    // --------------------------------------------------
    // 2. Login
    // --------------------------------------------------

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username =
            document.getElementById('login-username').value.trim();

        const password =
            document.getElementById('login-password').value;

        try {

            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await res.json();

            if (res.ok) {

                localStorage.setItem(
                    'accessToken',
                    data.token
                );

                localStorage.setItem(
                    'username',
                    data.username
                );

                showMessage('');

                loginForm.reset();

                loadDashboard();

            } else {

                showMessage(
                    data.message || 'Login failed.',
                    true
                );
            }

        } catch (error) {

            console.error('Login error:', error);

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    });


    // --------------------------------------------------
    // 3. Fetch Protected Dashboard
    // --------------------------------------------------

    const loadDashboard = async () => {

        const token =
            localStorage.getItem('accessToken');

        if (!token) {

            showMessage(
                'Session unauthorized. Please login.',
                true
            );

            return;
        }

        try {

            const res = await fetch(
                `${API_URL}/api/dashboard`,
                {
                    method: 'GET',

                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await res.json();

            if (res.ok) {

                welcomeBanner.innerText =
                    `Welcome, ${data.user.username}!`;

                dashboardData.innerText =
                    data.message;

                authContainer.classList.add('hidden');

                dashboardContainer.classList.remove('hidden');

                // Load all users
                getUsers();

            } else {

                if (res.status === 401) {

                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('username');
                }

                showMessage(
                    data.message ||
                    'Session unauthorized. Please login.',
                    true
                );

                dashboardContainer.classList.add('hidden');

                authContainer.classList.remove('hidden');
            }

        } catch (error) {

            console.error(
                'Dashboard error:',
                error
            );

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    };


    // --------------------------------------------------
    // 4. Logout
    // --------------------------------------------------

    logoutBtn.addEventListener('click', () => {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');

        dashboardContainer.classList.add('hidden');

        authContainer.classList.remove('hidden');

        showMessage(
            'Logged out successfully.',
            false
        );
    });


    // --------------------------------------------------
    // 5. Create User
    // --------------------------------------------------

    const createUser = async (username, email, password) => {

        try {

            const res = await fetch(
                `${API_URL}/api/users`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (res.ok) {

                showMessage(
                    data.message,
                    false
                );

                // Refresh the users list
                getUsers();

            } else {

                showMessage(
                    data.message ||
                    'Failed to create user.',
                    true
                );
            }

        } catch (error) {

            console.error(
                'Create user error:',
                error
            );

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    };


    // --------------------------------------------------
    // 6. Get All Users
    // --------------------------------------------------

    const getUsers = async () => {

        try {

            const res = await fetch(
                `${API_URL}/api/users`
            );

            const users = await res.json();

            if (res.ok) {

                // Clear old list
                usersList.innerHTML = '';

                users.forEach(user => {

                    const li =
                        document.createElement('li');

                    li.innerHTML = `
                        ${user.username} - ${user.email}
                        <button onclick="deleteUser('${user._id}')">
                            Delete
                        </button>
                    `;

                    usersList.appendChild(li);
                });

            } else {

                showMessage(
                    users.message ||
                    'Failed to get users.',
                    true
                );
            }

        } catch (error) {

            console.error(
                'Get users error:',
                error
            );

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    };


    // --------------------------------------------------
    // 7. Delete User
    // --------------------------------------------------

    window.deleteUser = async (id) => {

        try {

            const res = await fetch(
                `${API_URL}/api/users/${id}`,
                {
                    method: 'DELETE'
                }
            );

            const data = await res.json();

            if (res.ok) {

                showMessage(
                    data.message,
                    false
                );

                // Refresh the users list
                getUsers();

            } else {

                showMessage(
                    data.message ||
                    'Failed to delete user.',
                    true
                );
            }

        } catch (error) {

            console.error(
                'Delete user error:',
                error
            );

            showMessage(
                'Unable to connect to the server.',
                true
            );
        }
    };


    // --------------------------------------------------
    // 8. Check Existing Login Session
    // --------------------------------------------------

    const existingToken =
        localStorage.getItem('accessToken');

    if (existingToken) {

        loadDashboard();
    }

});