const express = require('express');
const { Wishlist, Product } = require('../database/db');

const router = express.Router();

// Get user's wishlist
router.get('/', async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id })
            .populate('products');

        if (!wishlist) {
            wishlist = await Wishlist.create({ 
                user: req.user.id, 
                products: [] 
            });
        }

        res.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching wishlist' 
        });
    }
});

// Add to wishlist
router.post('/add/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Find or create wishlist
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ 
                user: req.user.id, 
                products: [] 
            });
        }

        // Check if already in wishlist
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        await wishlist.populate('products');

        res.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to wishlist' 
        });
    }
});

// Remove from wishlist
router.delete('/remove/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(404).json({ 
                success: false, 
                message: 'Wishlist not found' 
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );

        await wishlist.save();
        await wishlist.populate('products');

        res.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from wishlist' 
        });
    }
});

// Clear wishlist
router.delete('/clear', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (wishlist) {
            wishlist.products = [];
            await wishlist.save();
        }

        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });

    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing wishlist' 
        });
    }
});

module.exports = router;