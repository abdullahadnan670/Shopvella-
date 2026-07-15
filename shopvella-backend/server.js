import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environmental parameters definitions safely
dotenv.config();

const app = express();

// 1. Connect to Supabase using defined credentials with fallback checks
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL INITIALIZATION ERROR: Missing SUPABASE_URL or SUPABASE_KEY inside environment configuration.');
  process.exit(1);
}

// Instantiate internal administrative client pipeline
const supabase = createClient(supabaseUrl, supabaseKey);

// Global Middleware Configuration Engine
app.use(cors({
  origin: ['https://shopvella.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/**
 * @route   GET /api
 * @desc    Global API base deployment status tracking interface
 */
app.get('/api', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Shopvella Production Architecture API Gateway is online and active."
  });
});

/**
 * @route   GET /api/categories
 * @desc    Fetch all columns from the categories table
 */
app.get('/api/categories', async (req, res) => {
  try {
    const { data: categoriesDataset, error: queryError } = await supabase
      .from('categories')
      .select('*');

    if (queryError) {
      return res.status(500).json({ 
        error: `Database category extraction failed: ${queryError.message}` 
      });
    }

    return res.status(200).json({
      success: true,
      count: categoriesDataset.length,
      data: categoriesDataset
    });
  } catch (caughtErrorInstance) {
    return res.status(500).json({ 
      error: `Internal Server Error during categories retrieval: ${caughtErrorInstance.message}` 
    });
  }
});

/**
 * @route   GET /api/products
 * @desc    Fetch products supporting complex text matching, description category queries,
 *          and strict Category Table Joins using the 'category_slug' parameter.
 */
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, category_slug } = req.query;
    let databaseQuery;

    // 3. Perform a join with 'categories' if category_slug is supplied
    if (category_slug && category_slug.trim() !== '') {
      databaseQuery = supabase
        .from('products')
        .select('*, categories!inner(*)')
        .eq('categories.slug', category_slug.trim());
    } else {
      databaseQuery = supabase.from('products').select('*');
    }

    // Support legacy search overrides
    if (search && search.trim() !== '') {
      databaseQuery = databaseQuery.ilike('name', `%${search.trim()}%`);
    }

    // Support legacy plain category overrides
    if (category && category.trim() !== '' && category.trim() !== 'All Drops' && category.trim() !== 'All Cases') {
      databaseQuery = databaseQuery.ilike('description', `%${category.trim()}%`);
    }

    const { data: catalogDataset, error: queryErrorException } = await databaseQuery;

    if (queryErrorException) {
      return res.status(500).json({ 
        error: `Database extraction matrix query processing routines failed: ${queryErrorException.message}` 
      });
    }

    return res.status(200).json({
      success: true,
      count: catalogDataset.length,
      data: catalogDataset
    });
  } catch (caughtErrorInstance) {
    return res.status(500).json({ 
      error: `Internal Server Error during product query execution: ${caughtErrorInstance.message}` 
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Fetch a single product from the database using its primary ID key
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: productRecord, error: queryError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    // 5. Proper error handling if query fails or target record does not exist
    if (queryError) {
      return res.status(404).json({ 
        error: `Product lookup failed: ${queryError.message}` 
      });
    }

    if (!productRecord) {
      return res.status(404).json({ 
        error: "Product does not exist" 
      });
    }

    return res.status(200).json({
      success: true,
      data: productRecord
    });
  } catch (caughtErrorInstance) {
    return res.status(500).json({ 
      error: `Internal Server Error retrieving product details: ${caughtErrorInstance.message}` 
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
        error: 'Validation Failed: The "items" property field is required and must be a non-empty array block.'
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
        error: 'Validation Failed: Missing crucial parameter components inside checkout customer details.'
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
        error: lookupError ? `Catalog Sync Failed: ${lookupError.message}` : 'No matching product configurations found.'
      });
    }

    const verificationMap = new Map(verifiedPriceLookups.map(record => [record.id.toString(), record]));
    let certifiedServerCalculatedTotal = 0;

    // Run deep logic server checking parameters and total amount verification
    for (const clientOrderedItem of items) {
      const liveCatalogRecord = verificationMap.get(clientOrderedItem.id.toString());

      if (!liveCatalogRecord) {
        return res.status(422).json({
          error: `Entity Conflict Discoveries: Product ID ${clientOrderedItem.id} does not map inside verified active dataset.`
        });
      }

      if (liveCatalogRecord.stock_quantity < clientOrderedItem.quantity) {
        return res.status(422).json({
          error: `Inventory Stock Outage: Requested allocation for product "${liveCatalogRecord.name}" exceeds current available stock.`
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
        p_items: items 
      }
    );

    // Intercept specific custom database errors raised inside validation loops
    if (rpcDatabaseExecutionError) {
      return res.status(422).json({
        error: `Transaction Aborted: ${rpcDatabaseExecutionError.message}`
      });
    }

    // Return confirmation status code block back out to the frontend platform layout
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
      error: `Internal Server Error during transactional execution: ${runtimeEndpointError.message}`
    });
  }
});

// Fallback error-catching structure mapping route paths missing from router patterns
app.use((req, res) => {
  return res.status(404).json({
    error: 'Resource Location Error: Requested endpoint processing path not found.'
  });
});

// Conditional local port listeners blocks to support local testing workflows safely
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const LOCAL_DEV_RUN_PORT = process.env.PORT || 5000;
  app.listen(LOCAL_DEV_RUN_PORT, () => {
    console.log(`🚀 Production COD server engine running smoothly locally on port ${LOCAL_DEV_RUN_PORT}`);
  });
}

// Export server application for deployment configurations
export default app;