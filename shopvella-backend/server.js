import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environmental parameters definitions safely
dotenv.config();

const app = express();

// Absolute verification configuration safety barrier sequence checks
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('CRITICAL INITIALIZATION ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment parameters variables entries inside target platforms config.');
  process.exit(1);
}

// Instantiate internal administrative client pipeline explicitly overriding standard tracking definitions
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Global Middleware Configuration Engine
app.use(cors());
app.use(express.json());

/**
 * @route   GET /api
 * @desc    Global API base deployment status tracking interface layout check route handler
 */
app.get('/api', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Shopvella Production Architecture API Gateway is online and active."
  });
});

/**
 * @route   GET /api/products
 * @desc    Fetch products supporting complex text matching queries and filtering mechanics
 */
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    let databaseQuery = supabase.from('products').select('*');

    if (search && search.trim() !== '') {
      databaseQuery = databaseQuery.ilike('name', `%${search.trim()}%`);
    }

    if (category && category.trim() !== '' && category.trim() !== 'All Drops') {
      databaseQuery = databaseQuery.ilike('description', `%${category.trim()}%`);
    }

    const { data: catalogDataset, error: queryErrorException } = await databaseQuery;

    if (queryErrorException) {
      return res.status(400).json({
        success: false,
        error: 'Database extraction matrix query processing routines failed',
        details: queryErrorException.message
      });
    }

    return res.status(200).json({
      success: true,
      count: catalogDataset.length,
      data: catalogDataset
    });
  } catch (caughtErrorInstance) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error exception processing logged',
      details: caughtErrorInstance.message
    });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Server-validated secure checkout pipeline executing custom database RPC routines atomically
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerDetails } = req.body;

    // Structural input validation check
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Failed',
        details: 'The "items" property parameter layer field is required and must be tracking a non-empty array block.'
      });
    }

    if (
      !customerDetails ||
      !customerDetails.name?.trim() ||
      !customerDetails.email?.trim() ||
      !customerDetails.shippingAddress?.trim() ||
      !customerDetails.phoneNumber?.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Validation Failed',
        details: 'Missing crucial parameter components inside checkout customer details matrix values.'
      });
    }

    // Parse target primary keys map array from payload array block safely
    const requestedProductIds = items.map(productItem => productItem.id);

    // Look up pricing directly from the database to prevent pricing modification injection hacks
    const { data: verifiedPriceLookups, error: lookupError } = await supabase
      .from('products')
      .select('id, price, name, stock_quantity')
      .in('id', requestedProductIds);

    if (lookupError || !verifiedPriceLookups || verifiedPriceLookups.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Catalog Synchronization Failed',
        details: lookupError ? lookupError.message : 'No matching product configurations found.'
      });
    }

    const verificationMap = new Map(verifiedPriceLookups.map(record => [record.id.toString(), record]));
    let certifiedServerCalculatedTotal = 0;

    // Run deep logic server checking parameters and total amount verification
    for (const clientOrderedItem of items) {
      const liveCatalogRecord = verificationMap.get(clientOrderedItem.id.toString());

      if (!liveCatalogRecord) {
        return res.status(422).json({
          success: false,
          error: 'Entity Conflict Discoveries',
          details: `Product tracking identification reference key ID ${clientOrderedItem.id} does not map inside verified active dataset grids.`
        });
      }

      if (liveCatalogRecord.stock_quantity < clientOrderedItem.quantity) {
        return res.status(422).json({
          success: false,
          error: 'Inventory Stock Outage Protection Error',
          details: `Requested allocation volume size for product "${liveCatalogRecord.name}" exceeds current available quantities metrics balances.`
        });
      }

      certifiedServerCalculatedTotal += parseFloat(liveCatalogRecord.price) * parseInt(clientOrderedItem.quantity, 10);
    }

    // Invoke atomic relational PL/pgSQL transaction routine via custom RPC mapping channel
    const { data: rpcExecutionResult, error: rpcDatabaseExecutionError } = await supabase.rpc(
      'process_cod_order',
      {
        p_customer_name: customerDetails.name.trim(),
        p_customer_email: customerDetails.email.trim(),
        p_shipping_address: customerDetails.shippingAddress.trim(),
        p_phone_number: customerDetails.phoneNumber.trim(),
        p_total_amount: parseFloat(certifiedServerCalculatedTotal.toFixed(2)),
        p_items: items // Forward client tracking objects array containing parameters safely down into database level engines
      }
    );

    // Intercept specific custom database errors raised inside validation loops
    if (rpcDatabaseExecutionError) {
      return res.status(422).json({
        success: false,
        error: 'Transaction Aborted Execution Context Processing Failure',
        details: rpcDatabaseExecutionError.message
      });
    }

    // Return confirmation status code block back out to the frontend platform layout framework tracking arrays
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully via Cash on Delivery!',
      orderId: rpcExecutionResult.order_id,
      billingSummary: {
        totalChargedAmount: parseFloat(certifiedServerCalculatedTotal.toFixed(2)),
        unitsShippedCount: items.reduce((accumulation, directRecord) => accumulation + parseInt(directRecord.quantity, 10), 0)
      }
    });
  } catch (runtimeEndpointError) {
    return res.status(500).json({
      success: false,
      error: 'Internal Transactional Request Loop System Crash Fault Exception Detected',
      details: runtimeEndpointError.message
    });
  }
});
/**
 * @route   POST /api/orders
 * @desc    Process direct Cash on Delivery (COD) orders without a payment gateway
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerDetails } = req.body;

    // 1. Structural Validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'The "items" field is required and cannot be empty.' });
    }
    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.shippingAddress || !customerDetails.phoneNumber) {
      return res.status(400).json({ success: false, error: 'Missing customer delivery details.' });
    }

    const itemIds = items.map(item => item.id);

    // 2. Fetch match validation records from database
    const { data: dbProducts, error: lookupError } = await supabase
      .from('products')
      .select('id, price, name, stock_quantity')
      .in('id', itemIds);

    if (lookupError || !dbProducts || dbProducts.length === 0) {
      return res.status(400).json({ success: false, error: 'Database lookup failed during validation.' });
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));
    let totalAmount = 0;

    // 3. Stock Level Verification & Total Calculation
    for (const clientItem of items) {
      const dbProduct = productMap.get(clientItem.id);
      if (!dbProduct) {
        return res.status(400).json({ success: false, error: `Product ID ${clientItem.id} not found.` });
      }
      if (dbProduct.stock_quantity < clientItem.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Out of Stock Protection',
          details: `Requested quantity for "${dbProduct.name}" exceeds available stock.`
        });
      }
      totalAmount += dbProduct.price * clientItem.quantity;
    }

    // 4. Create Main Order Entry in public.orders
    // Note: Make sure your Supabase orders table has columns for name, address, and phone if you wish to store them!
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_email: customerDetails.email.trim(),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          status: 'pending', // Pending payment/delivery completion
          stripe_checkout_id: 'COD_ORDER' // Flag indicating it bypasses Stripe
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Loop to commit items mapping and inventory balance reductions
    for (const clientItem of items) {
      const dbProduct = productMap.get(clientItem.id);

      // Insert item line mappings
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

      // Deduct warehouse system balances safely
      const computedNewStock = Math.max(0, dbProduct.stock_quantity - clientItem.quantity);
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: computedNewStock })
        .eq('id', clientItem.id);

      if (updateError) throw updateError;
    }

    return res.status(201).json({
      success: true,
      message: 'Your Cash on Delivery order has been placed successfully!'
    });

  } catch (err) {
    console.error('❌ COD Checkout backend failure:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: err.message
    });
  }
});
// Fallback error-catching structure mapping routes handles route structures missing patterns definitions
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Resource Location Error',
    details: 'Requested target endpoint processing path route configuration map not discovered inside core router allocation structures pools.'
  });
});

// Conditional local port listeners blocks to support local testing workflows safely without interfering with Vercel architecture runtime functions structures ingestion engines
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const LOCAL_DEV_RUN_PORT = process.env.PORT || 5000;
  app.listen(LOCAL_DEV_RUN_PORT, () => {
    console.log(`🚀 Production COD server engine running smoothly locally on port ${LOCAL_DEV_RUN_PORT}`);
  });
}

// Clean export statement design pattern architecture layouts to allow Vercel environments to process functions instantly
export default app;