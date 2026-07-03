import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();

// Validate essential environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('CRITICAL ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.');
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Express Middleware Setup
app.use(cors());
app.use(express.json()); // Global JSON parsing active for incoming payload streams

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
 * @route   POST /api/orders
 * @desc    Validate inventory balances, compute certified prices, log COD transaction, and adjust stock values
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerDetails } = req.body;

    // 1. Structural array validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'The "items" field is required and must be a non-empty array.'
      });
    }

    // 2. Customer delivery structural details parameter confirmations
    if (
      !customerDetails || 
      !customerDetails.name?.trim() || 
      !customerDetails.email?.trim() || 
      !customerDetails.shippingAddress?.trim() || 
      !customerDetails.phoneNumber?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'Missing or incomplete shipping parameters configuration details (name, email, shippingAddress, phoneNumber).'
      });
    }

    const itemIds = items.map(item => item.id);

    // Fetch database items directly to match verified source data
    const { data: databaseProducts, error } = await supabase
      .from('products')
      .select('id, price, name, stock_quantity') 
      .in('id', itemIds);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Database metadata validation sequence failed during verification setup',
        details: error.message
      });
    }

    if (!databaseProducts || databaseProducts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        details: 'None of the provided product IDs match items in our current catalog configuration.'
      });
    }

    const productMap = new Map(databaseProducts.map(p => [p.id, p]));
    let totalAmount = 0;

    // 3. Complete pre-flight system architecture validations prior to processing commits
    for (const clientItem of items) {
      if (!clientItem.id || !clientItem.quantity || clientItem.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          details: `Invalid configuration structure processing parameter for item ID: ${clientItem.id || 'Unknown'}`
        });
      }

      const dbProduct = productMap.get(clientItem.id);

      if (!dbProduct) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          details: `Product with identification ID ${clientItem.id} does not exist in our system repository.`
        });
      }

      if (dbProduct.stock_quantity < clientItem.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Out of Stock Protection',
          details: `Requested quantity parameter size for "${dbProduct.name}" exceeds warehouse balance parameters (${dbProduct.stock_quantity} metrics left).`
        });
      }

      totalAmount += dbProduct.price * clientItem.quantity;
    }

    // 4. Commit global tracking structure profile directly inside public.orders
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_email: customerDetails.email.trim(),
          customer_name: customerDetails.name.trim(),
          shipping_address: customerDetails.shippingAddress.trim(),
          phone_number: customerDetails.phoneNumber.trim(),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          status: 'Cash on Delivery'
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Run transactional mapping updates for line items and stock values balance pools
    for (const clientItem of items) {
      const dbProduct = productMap.get(clientItem.id);

      // Insert item mapping rows inside sub-relational mapping arrays
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: orderRecord.id,
            product_id: clientItem.id,
            quantity: clientItem.quantity
          }
        ]);

      if (itemError) throw itemError;

      // Safe stock management balance tracking metric logic operations
      const computedNewStock = Math.max(0, dbProduct.stock_quantity - clientItem.quantity);

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: computedNewStock })
        .eq('id', clientItem.id);

      if (updateError) throw updateError;
    }

    console.log(`✨ COD Order entry successfully created and logged. Internal ID: ${orderRecord.id}`);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully via Cash on Delivery!",
      orderId: orderRecord.id,
      summary: {
        itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (err) {
    console.error(`❌ Checkout Order Processing Error Exception: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

// Fallback error-catching structure mapping routes handles
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route configuration not discovered' });
});

// Only start listening on a port if executing outside a serverless wrapper environment (Local Testing)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local development COD server active on port ${PORT}`);
  });
}

// Industry Standard ES Module default export for seamless Vercel ingestion
export default app;