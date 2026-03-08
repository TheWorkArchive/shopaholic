// Cart & Wishlist Module - SIMPLIFIED VERSION
const Cart = (() => {
    // State
    let cart = [];
    let wishlist = [];
    let products = [];

    // DOM Elements
    const cartCount = document.getElementById('cartCount');
    const wishlistCount = document.getElementById('wishlistCount');
    const cartTotal = document.getElementById('cartTotal');
    const wishlistTotal = document.getElementById('wishlistTotal');
    const productsGrid = document.getElementById('productsGrid');
    const cartItems = document.getElementById('cartItems');
    const wishlistItems = document.getElementById('wishlistItems');
    const sidebarCartTotal = document.getElementById('sidebarCartTotal');

    // Load products immediately when script runs
    const loadProducts = async () => {
        console.log('🔄 Loading products...');
        try {
            // Show loading state
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading fashionable clothes...</p>
                    </div>
                `;
            }

            const response = await API.getProducts();
            console.log('✅ API Response:', response);
            
            if (response && response.success && response.data) {
                products = response.data;
                console.log(`✅ Loaded ${products.length} products`);
                renderProducts();
            } else {
                console.error('❌ Invalid response format');
                useFallbackProducts();
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            useFallbackProducts();
        }
    };

    // Fallback products in case API fails
    const useFallbackProducts = () => {
        console.log('⚠️ Using fallback products');
        products = [
            { id: 1, name: "Men's Cotton Kurti", price: 899, originalPrice: 1999, emoji: '👕', category: 'mens', rating: 4.5, discount: 55 },
            { id: 2, name: "Men's Denim Jacket", price: 1299, originalPrice: 2999, emoji: '🧥', category: 'mens', rating: 4.3, discount: 57 },
            { id: 3, name: "Women's Lehenga Choli", price: 2499, originalPrice: 5999, emoji: '👗', category: 'womens', rating: 4.7, discount: 58 },
            { id: 4, name: "Women's Silk Saree", price: 1899, originalPrice: 3999, emoji: '🥻', category: 'womens', rating: 4.8, discount: 53 },
            { id: 5, name: "Kids Party Dress", price: 599, originalPrice: 1299, emoji: '🧒', category: 'kids', rating: 4.5, discount: 54 },
            { id: 6, name: "Men's Sherwani", price: 3999, originalPrice: 8999, emoji: '🤵', category: 'ethnic', rating: 4.9, discount: 56 },
            { id: 7, name: "Men's Sports Shoes", price: 999, originalPrice: 1999, emoji: '👟', category: 'footwear', rating: 4.4, discount: 50 }
        ];
        renderProducts();
    };

    // Render products grid
    const renderProducts = () => {
        if (!productsGrid) {
            console.error('❌ Products grid not found in HTML');
            return;
        }
        
        console.log('🎨 Rendering products...');
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = createProductCard(product);
            productsGrid.appendChild(card);
        });
        
        console.log(`✅ Rendered ${products.length} products`);
    };

    // Create product card element
    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 
            product.discount || 0;
        
        card.innerHTML = `
            <div class="product-image">
                <span style="font-size: 4rem;">${product.emoji}</span>
                ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
            </div>
            <div class="product-category">${product.category.toUpperCase()}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-rating">
                ${getStarRating(product.rating || 4.5)}
                <span>(${product.reviews || 100}+)</span>
            </div>
            <div class="product-price">
                <span class="current-price">₹${product.price}</span>
                ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn-add-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn-add-wish ${wishlist.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;

        // Add event listeners
        card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product.id);
        });
        
        card.querySelector('.btn-add-wish').addEventListener('click', (e) => {
            e.preventDefault();
            toggleWishlist(product.id);
        });

        return card;
    };

    // Get star rating HTML
    const getStarRating = (rating) => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - rating < 1 && i - rating > 0) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    };

    // Add to cart
    const addToCart = async (productId) => {
        const user = API.getCurrentUser();
        if (!user) {
            alert('Please login first');
            document.getElementById('loginBtn')?.click();
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Check if already in cart
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ id: productId, quantity: 1, ...product });
        }

        await API.updateCart(user.id, cart.map(item => item.id));
        updateCartDisplay();
        renderCartItems();
        alert(`✅ ${product.name} added to cart!`);
    };

    // Toggle wishlist
    const toggleWishlist = async (productId) => {
        const user = API.getCurrentUser();
        if (!user) {
            alert('Please login first');
            document.getElementById('loginBtn')?.click();
            return;
        }

        const index = wishlist.indexOf(productId);
        if (index === -1) {
            wishlist.push(productId);
        } else {
            wishlist.splice(index, 1);
        }

        await API.updateWishlist(user.id, wishlist);
        updateWishlistDisplay();
        renderWishlistItems();
        renderProducts(); // Re-render to update wishlist button states
    };

    // Update cart display
    const updateCartDisplay = () => {
        if (cartCount) cartCount.textContent = cart.length;
        
        const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        if (cartTotal) cartTotal.textContent = `₹${total}`;
        if (sidebarCartTotal) sidebarCartTotal.textContent = `₹${total}`;
    };

    // Update wishlist display
    const updateWishlistDisplay = () => {
        if (wishlistCount) wishlistCount.textContent = wishlist.length;
    };

    // Render cart items in sidebar
    const renderCartItems = () => {
        if (!cartItems) return;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align:center; padding:2rem;">Your cart is empty</p>';
            return;
        }

        cartItems.innerHTML = '';
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-emoji">${item.emoji || '🛍️'}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity || 1}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            cartItems.appendChild(itemEl);
        });

        // Add event listeners for quantity buttons
        cartItems.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
        });
        cartItems.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
        });
        cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
        });
    };

    // Update quantity
    const updateQuantity = async (productId, change) => {
        const item = cart.find(i => i.id == productId);
        if (item) {
            item.quantity = (item.quantity || 1) + change;
            if (item.quantity <= 0) {
                await removeFromCart(productId);
            } else {
                updateCartDisplay();
                renderCartItems();
            }
        }
    };

    // Remove from cart
    const removeFromCart = async (productId) => {
        cart = cart.filter(item => item.id != productId);
        const user = API.getCurrentUser();
        if (user) {
            await API.updateCart(user.id, cart.map(item => item.id));
        }
        updateCartDisplay();
        renderCartItems();
    };

    // Render wishlist items
    const renderWishlistItems = () => {
        if (!wishlistItems) return;
        
        const wishProducts = products.filter(p => wishlist.includes(p.id));
        
        if (wishProducts.length === 0) {
            wishlistItems.innerHTML = '<p style="text-align:center; padding:2rem;">Your wishlist is empty</p>';
            return;
        }

        wishlistItems.innerHTML = '';
        wishProducts.forEach(product => {
            const itemEl = document.createElement('div');
            itemEl.className = 'wishlist-item';
            itemEl.innerHTML = `
                <div class="wishlist-item-emoji">${product.emoji}</div>
                <div class="wishlist-item-details">
                    <div class="wishlist-item-name">${product.name}</div>
                    <div class="wishlist-item-price">₹${product.price}</div>
                </div>
                <div class="remove-item" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </div>
            `;
            wishlistItems.appendChild(itemEl);
        });

        wishlistItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => toggleWishlist(btn.dataset.id));
        });
    };

    // Load user's cart and wishlist
    const loadUserData = async () => {
        const user = API.getCurrentUser();
        if (user) {
            try {
                const cartResponse = await API.getCart(user.id);
                const cartIds = cartResponse.data;
                cart = cartIds.map(id => {
                    const product = products.find(p => p.id === id);
                    return product ? { id, quantity: 1, ...product } : null;
                }).filter(Boolean);
                
                const wishlistResponse = await API.getWishlist(user.id);
                wishlist = wishlistResponse.data;
                
                updateCartDisplay();
                updateWishlistDisplay();
                renderCartItems();
                renderWishlistItems();
                renderProducts(); // Re-render to show correct wishlist button states
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    };

    // Clear local data
    const clearLocalData = () => {
        cart = [];
        wishlist = [];
        updateCartDisplay();
        updateWishlistDisplay();
        renderCartItems();
        renderWishlistItems();
        renderProducts();
    };

    // Initialize
    const init = async () => {
        console.log('🚀 Cart module initializing...');
        await loadProducts();
        await loadUserData();
        
        // Setup event listeners for sidebars
        document.getElementById('cartIndicator')?.addEventListener('click', () => {
            document.getElementById('cartSidebar')?.classList.add('active');
            document.getElementById('overlay')?.classList.add('active');
            renderCartItems();
        });

        document.getElementById('wishlistIndicator')?.addEventListener('click', () => {
            document.getElementById('wishlistSidebar')?.classList.add('active');
            document.getElementById('overlay')?.classList.add('active');
            renderWishlistItems();
        });

        document.getElementById('closeCart')?.addEventListener('click', () => {
            document.getElementById('cartSidebar')?.classList.remove('active');
            document.getElementById('overlay')?.classList.remove('active');
        });

        document.getElementById('closeWishlist')?.addEventListener('click', () => {
            document.getElementById('wishlistSidebar')?.classList.remove('active');
            document.getElementById('overlay')?.classList.remove('active');
        });

        document.getElementById('overlay')?.addEventListener('click', () => {
            document.getElementById('cartSidebar')?.classList.remove('active');
            document.getElementById('wishlistSidebar')?.classList.remove('active');
            document.getElementById('overlay')?.classList.remove('active');
        });

        console.log('✅ Cart module ready!');
    };

    // Start everything
    init();

    return {
        loadUserData,
        clearLocalData,
        addToCart,
        toggleWishlist
    };
})();