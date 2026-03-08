// Authentication Module
const Auth = (() => {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const username = document.getElementById('username');

    // Create modal elements
    const createModal = (title, fields) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `${title.toLowerCase()}Modal`;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${title}</h2>
                <form id="${title.toLowerCase()}Form">
                    ${fields.map(field => `
                        <div class="form-group">
                            <label for="${field.id}">${field.label}</label>
                            <input type="${field.type}" id="${field.id}" required>
                        </div>
                    `).join('')}
                    <button type="submit" class="btn-primary" style="width: 100%;">${title}</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    };

    // Initialize auth modals
    const initModals = () => {
        // Login Modal
        const loginModal = createModal('Login', [
            { id: 'loginEmail', label: 'Email', type: 'email' },
            { id: 'loginPassword', label: 'Password', type: 'password' }
        ]);

        // Signup Modal
        const signupModal = createModal('Signup', [
            { id: 'signupName', label: 'Full Name', type: 'text' },
            { id: 'signupEmail', label: 'Email', type: 'email' },
            { id: 'signupPassword', label: 'Password', type: 'password' },
            { id: 'signupConfirm', label: 'Confirm Password', type: 'password' }
        ]);

        // Close modal functionality
        document.querySelectorAll('.close-modal').forEach(close => {
            close.addEventListener('click', () => {
                loginModal.classList.remove('active');
                signupModal.classList.remove('active');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === loginModal || e.target === signupModal) {
                loginModal.classList.remove('active');
                signupModal.classList.remove('active');
            }
        });

        return { loginModal, signupModal };
    };

    const { loginModal, signupModal } = initModals();

    // Check authentication status on load
    const checkAuth = () => {
        const user = API.getCurrentUser();
        if (user) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            username.textContent = user.name;
        }
    };

    // Login handler
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const result = await API.login(email, password);
        
        if (result.success) {
            loginModal.classList.remove('active');
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            username.textContent = result.data.user.name;
            showNotification('Login successful!', 'success');
            
            // Refresh cart/wishlist for user
            if (typeof Cart !== 'undefined') {
                Cart.loadUserData();
            }
        } else {
            showNotification('Invalid credentials', 'error');
        }
    });

    // Signup handler
    signupBtn.addEventListener('click', () => {
        signupModal.classList.add('active');
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirm').value;
        
        if (password !== confirm) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        const userData = {
            name: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            password: password
        };
        
        const result = await API.signup(userData);
        
        if (result.success) {
            signupModal.classList.remove('active');
            showNotification('Account created! Please login.', 'success');
        }
    });

    // Logout handler
    logoutBtn.addEventListener('click', () => {
        API.logout();
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
        if (typeof Cart !== 'undefined') {
            Cart.clearLocalData();
        }
        showNotification('Logged out successfully', 'info');
    });

    // Notification system
    const showNotification = (message, type = 'info') => {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Get icon based on type
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : 
                       '#3b82f6',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '2000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease',
            fontWeight: '500'
        });
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };

    // Add animation styles if they don't exist
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    checkAuth();

    return {
        getCurrentUser: API.getCurrentUser,
        isAuthenticated: API.isAuthenticated,
        showNotification
    };
})();