import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Validate essential environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error('CRITICAL ERROR: Missing SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, or STRIPE_WEBHOOK_SECRET in environment variables.');
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Stripe Client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Express Middleware Setup
app.use(cors());

/**
 * STRIPE WEBHOOK RAW BODY ROUTE
 * Must be defined BEFORE express.json() middleware to preserve signature integrity.
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Extract metadata payload sent during checkout initialization
    const customerEmail = session.customer_details?.email || 'anonymous@shopvella.com';
    const stripeCheckoutId = session.id;
    const totalAmount = parseFloat((session.amount_total / 100).toFixed(2));
    const cartItems = JSON.parse(session.metadata.cart_payload || '[]');

    try {
      // 1. Insert global transaction profile record into public.orders
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            stripe_checkout_id: stripeCheckoutId,
            customer_email: customerEmail,
            total_amount: totalAmount,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Loop and commit mapping operations for line-items and inventory balances
      for (const item of cartItems) {
        // Insert individual descriptive lines into public.order_items
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([
            {
              order_id: orderRecord.id,
              product_id: item.id,
              quantity: item.quantity
            }
          ]);

        if (itemError) throw itemError;

        // Fetch current active structural metrics from catalog row
        const { data: productData, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (fetchError) throw fetchError;

        // Math manipulation for strict inventory reduction protection
        const computedNewStock = Math.max(0, productData.stock_quantity - item.quantity);

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: computedNewStock })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      console.log(`✨ Order record completely processed for Checkout ID: ${stripeCheckoutId}`);
    } catch (dbError) {
      console.error(`❌ Fulfillment Database Transaction Error: ${dbError.message}`);
      return res.status(500).json({ success: false, error: 'Database operations failed', details: dbError.message });
    }
  }

  return res.status(200).json({ received: true });
});

// Apply global parsing rules across remaining API path routes
app.use(express.json());

/**
 * @route   GET /api/products
 * @desc    Fetch products supporting text search queries and category tags filtering
 */
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = supabase.from('products').select('*');

    // Apply strict text match filter if parameter exists
    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    // Apply exact classification identifier route match if category exists
    if (category && category.trim() !== '' && category.trim() !== 'All Drops') {
      query = query.ilike('description', `%${category.trim()}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Database query failed',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

/**
 * @route   POST /api/checkout
 * @desc    Validate catalog costs, compile payload metadata, and initialize Stripe gateway paths
 */
app.post('/api/checkout', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'The "items" field is required, must be a non-empty array.'
      });
    }

    const itemIds = items.map(item => item.id);

    const { data: databaseProducts, error } = await supabase
      .from('products')
      .select('id, price, name, description, stock_quantity') 
      .in('id', itemIds);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Database lookup failed during checkout validation',
        details: error.message
      });
    }

    if (!databaseProducts || databaseProducts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'None of the provided product IDs match items in our catalog.'
      });
    }

    const productMap = new Map(databaseProducts.map(p => [p.id, p]));
    let totalAmount = 0;
    const lineItems = [];
    const internalPayloadTracker = [];

    for (const clientItem of items) {
      if (!clientItem.id || !clientItem.quantity || clientItem.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          details: `Invalid structure or quantity for item ID: ${clientItem.id || 'Unknown'}`
        });
      }

      const dbProduct = productMap.get(clientItem.id);

      if (!dbProduct) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          details: `Product with ID ${clientItem.id} does not exist in our catalog.`
        });
      }

      if (dbProduct.stock_quantity < clientItem.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Out of Stock Protection',
          details: `Requested quantity for "${dbProduct.name}" exceeds available stock (${dbProduct.stock_quantity} units left).`
        });
      }

      totalAmount += dbProduct.price * clientItem.quantity;
      const unitAmountInCents = Math.round(dbProduct.price * 100);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbProduct.name,
            description: dbProduct.description || '',
          },
          unit_amount: unitAmountInCents,
        },
        quantity: clientItem.quantity,
      });

      internalPayloadTracker.push({
        id: dbProduct.id,
        quantity: clientItem.quantity
      });
    }

    // Initialize transactional portal sequence pointing to target paths
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        cart_payload: JSON.stringify(internalPayloadTracker)
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      },
      url: session.url
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running smoothly on port ${PORT}`);
});