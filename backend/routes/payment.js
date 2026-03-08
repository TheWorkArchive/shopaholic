const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Cart, Order, Product } = require('../database/db');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart is empty' 
            });
        }

        // Calculate total
        const total = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                userId: req.user.id,
                cartId: cart._id.toString()
            }
        });

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                amount: total
            }
        });

    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating payment intent' 
        });
    }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handleSuccessfulPayment(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handleFailedPayment(failedPayment);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
    try {
        const { userId, cartId } = paymentIntent.metadata;
        
        // Get cart
        const cart = await Cart.findById(cartId).populate('items.product');
        
        if (!cart) return;

        // Create order
        const order = await Order.create({
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            total: paymentIntent.amount / 100,
            status: 'paid',
            paymentIntentId: paymentIntent.id
        });

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        console.log(`Order created: ${order._id}`);

    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
    console.log(`Payment failed for intent: ${paymentIntent.id}`);
    // You could notify the user here
}

// Confirm payment (for testing without webhook)
router.post('/confirm', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            await handleSuccessfulPayment(paymentIntent);
            
            res.json({
                success: true,
                message: 'Payment confirmed and order created'
            });
        } else {
            res.json({
                success: false,
                message: `Payment status: ${paymentIntent.status}`
            });
        }

    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error confirming payment' 
        });
    }
});

module.exports = router;