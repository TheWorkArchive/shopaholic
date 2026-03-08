// Main Application Controller
const App = (() => {
    // Initialize Stripe
    const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Test key

    // DOM Elements
    const stripeBtn = document.getElementById('stripePaymentBtn');
    const githubRepo = document.getElementById('githubRepo');
    const navItems = document.querySelectorAll('.nav-item');

    // Navigation handling
    const handleNavigation = (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        
        // Update active state
        navItems.forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Simulate page navigation
        Auth.showNotification(`Navigating to ${page} page (simulated)`, 'info');
    };

    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Stripe payment handler
    stripeBtn.addEventListener('click', async () => {
        const user = Auth.getCurrentUser();
        
        if (!user) {
            Auth.showNotification('Please login to checkout', 'error');
            return;
        }

        // Get cart total
        const cartTotalText = document.getElementById('cartTotal').textContent;
        const amount = parseFloat(cartTotalText.replace('$', '')) * 100; // Convert to cents

        if (amount <= 0) {
            Auth.showNotification('Your cart is empty', 'info');
            return;
        }

        try {
            // Create payment intent (simulated)
            const paymentIntent = await API.createPaymentIntent(amount);
            
            // In production, this would redirect to Stripe Checkout
            Auth.showNotification(`Processing payment of $${(amount/100).toFixed(2)}... (simulated)`, 'info');
            
            // Simulate successful payment
            setTimeout(() => {
                Auth.showNotification('Payment successful! Thank you for shopping!', 'success');
            }, 2000);

        } catch (error) {
            Auth.showNotification('Payment failed: ' + error.message, 'error');
        }
    });

    // GitHub repository link
    githubRepo.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.showNotification('GitHub repository: https://github.com/yourusername/shopaholic', 'info');
        window.open('https://github.com/yourusername/shopaholic', '_blank');
    });

    // Handle logo error
    const logo = document.getElementById('logoImg');
    if (logo) {
        logo.onerror = () => {
            logo.style.display = 'none';
            logo.parentElement.classList.add('logo-fallback');
        };
    }

    // Show welcome message
    Auth.showNotification('Welcome to Shopaholic! 🛍️', 'success');

    return {
        // Public methods if needed
    };
})();