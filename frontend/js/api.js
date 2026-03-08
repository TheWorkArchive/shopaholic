// API Service - Indian E-commerce
const API = (() => {
    // Mock database with Indian clothing items (prices in ₹)
    const mockDB = {
        products: [
            // Men's Wear
            { id: 1, name: 'Men\'s Cotton Kurti', price: 899, originalPrice: 1999, emoji: '👕', category: 'mens', rating: 4.5, reviews: 128, discount: 55 },
            { id: 2, name: 'Men\'s Denim Jacket', price: 1299, originalPrice: 2999, emoji: '🧥', category: 'mens', rating: 4.3, reviews: 89, discount: 57 },
            { id: 3, name: 'Men\'s Formal Shirt', price: 699, originalPrice: 1499, emoji: '👔', category: 'mens', rating: 4.4, reviews: 256, discount: 53 },
            { id: 4, name: 'Men\'s Jogger Pants', price: 799, originalPrice: 1599, emoji: '👖', category: 'mens', rating: 4.6, reviews: 312, discount: 50 },
            
            // Women's Wear
            { id: 5, name: 'Women\'s Lehenga Choli', price: 2499, originalPrice: 5999, emoji: '👗', category: 'womens', rating: 4.7, reviews: 445, discount: 58 },
            { id: 6, name: 'Women\'s Silk Saree', price: 1899, originalPrice: 3999, emoji: '🥻', category: 'womens', rating: 4.8, reviews: 678, discount: 53 },
            { id: 7, name: 'Women\'s Top & Jeans', price: 999, originalPrice: 2299, emoji: '👚', category: 'womens', rating: 4.5, reviews: 234, discount: 57 },
            { id: 8, name: 'Women\'s Kurti Set', price: 799, originalPrice: 1799, emoji: '👘', category: 'womens', rating: 4.4, reviews: 167, discount: 56 },
            
            // Kids Wear
            { id: 9, name: 'Kids Party Dress', price: 599, originalPrice: 1299, emoji: '🧒', category: 'kids', rating: 4.5, reviews: 89, discount: 54 },
            { id: 10, name: 'Kids T-Shirt & Shorts', price: 449, originalPrice: 999, emoji: '👕', category: 'kids', rating: 4.3, reviews: 56, discount: 55 },
            { id: 11, name: 'Kids Ethnic Wear', price: 899, originalPrice: 1999, emoji: '🧥', category: 'kids', rating: 4.6, reviews: 78, discount: 55 },
            
            // Ethnic Wear
            { id: 12, name: 'Men\'s Sherwani', price: 3999, originalPrice: 8999, emoji: '🤵', category: 'ethnic', rating: 4.9, reviews: 156, discount: 56 },
            { id: 13, name: 'Women\'s Anarkali Suit', price: 1599, originalPrice: 3499, emoji: '👗', category: 'ethnic', rating: 4.7, reviews: 234, discount: 54 },
            { id: 14, name: 'Men\'s Dhoti Kurta', price: 1299, originalPrice: 2799, emoji: '👔', category: 'ethnic', rating: 4.5, reviews: 98, discount: 54 },
            
            // Footwear
            { id: 15, name: 'Men\'s Sports Shoes', price: 999, originalPrice: 1999, emoji: '👟', category: 'footwear', rating: 4.4, reviews: 567, discount: 50 },
            { id: 16, name: 'Women\'s Heels', price: 799, originalPrice: 1599, emoji: '👠', category: 'footwear', rating: 4.3, reviews: 345, discount: 50 },
            { id: 17, name: 'Men\'s Sandals', price: 499, originalPrice: 999, emoji: '🥿', category: 'footwear', rating: 4.2, reviews: 234, discount: 50 },
            { id: 18, name: 'Women\'s Flats', price: 599, originalPrice: 1199, emoji: '👡', category: 'footwear', rating: 4.4, reviews: 189, discount: 50 },
            { id: 19, name: 'Kids School Shoes', price: 699, originalPrice: 1399, emoji: '👞', category: 'footwear', rating: 4.5, reviews: 145, discount: 50 }
        ],
        users: [
            { id: 1, email: 'demo@shopaholic.com', name: 'Rahul Sharma', password: 'demo123' }
        ],
        orders: []
    };

    // Simulate network delay
    const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

    // Token management
    let currentToken = localStorage.getItem('authToken');

    return {
        async getProducts() {
            await delay();
            console.log('Products loaded:', mockDB.products.length);
            return {
                success: true,
                data: mockDB.products,
                message: 'Products retrieved successfully'
            };
        },

        async getProductsByCategory(category) {
            await delay();
            if (category === 'all') {
                return this.getProducts();
            }
            const filtered = mockDB.products.filter(p => p.category === category);
            return {
                success: true,
                data: filtered,
                message: `Products in category: ${category}`
            };
        },

        async getProduct(id) {
            await delay();
            const product = mockDB.products.find(p => p.id === parseInt(id));
            return {
                success: true,
                data: product,
                message: 'Product retrieved'
            };
        },

        async login(email, password) {
            await delay(800);
            const user = mockDB.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const token = 'jwt_' + Math.random().toString(36).substr(2);
                currentToken = token;
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email, name: user.name }));
                
                return {
                    success: true,
                    data: { token, user: { id: user.id, email: user.email, name: user.name } },
                    message: 'Login successful! Welcome back!'
                };
            }
            
            return {
                success: false,
                error: 'Invalid credentials',
                message: 'Login failed. Please check your email and password.'
            };
        },

        async signup(userData) {
            await delay(800);
            const newUser = {
                id: mockDB.users.length + 1,
                ...userData
            };
            mockDB.users.push(newUser);
            
            return {
                success: true,
                data: newUser,
                message: 'Account created successfully! Please login.'
            };
        },

        logout() {
            currentToken = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        },

        getCurrentUser() {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        },

        isAuthenticated() {
            return !!currentToken || !!localStorage.getItem('authToken');
        },

        async getCart(userId) {
            await delay();
            const cart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
            return {
                success: true,
                data: cart,
                message: 'Cart retrieved'
            };
        },

        async updateCart(userId, cart) {
            await delay();
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
            return {
                success: true,
                message: 'Cart updated'
            };
        },

        async getWishlist(userId) {
            await delay();
            const wishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
            return {
                success: true,
                data: wishlist,
                message: 'Wishlist retrieved'
            };
        },

        async updateWishlist(userId, wishlist) {
            await delay();
            localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
            return {
                success: true,
                message: 'Wishlist updated'
            };
        },

        async createOrder(orderData) {
            await delay(1000);
            const order = {
                id: mockDB.orders.length + 1,
                ...orderData,
                date: new Date().toISOString(),
                status: 'confirmed'
            };
            mockDB.orders.push(order);
            return {
                success: true,
                data: order,
                message: 'Order placed successfully!'
            };
        }
    };
})();

console.log('🇮🇳 Shopaholic Indian Store Ready!');