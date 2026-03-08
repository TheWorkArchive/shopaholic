const express = require('express');
const { Cart, Product } = require('../database/db');

const router = express.Router();

// Get user's cart
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart) {
            cart = await Cart.create({ 
                user: req.user.id, 
                items: [] 
            });
        }

        res.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cart' 
        });
    }
});

// Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            cart = await Cart.create({ 
                user: req.user.id, 
                items: [] 
            });
        }

        // Check if product already in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity });
        }

        cart.updatedAt = Date.now();
        await cart.save();

        // Populate product details
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to cart' 
        });
    }
});

// Update cart item
router.put('/update/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not in cart' 
            });
        }

        if (quantity <= 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating cart' 
        });
    }
});

// Remove from cart
router.delete('/remove/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from cart' 
        });
    }
});

// Clear cart
router.delete('/clear', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (cart) {
            cart.items = [];
            cart.updatedAt = Date.now();
            await cart.save();
        }

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cart' 
        });
    }
});

module.exports = router;