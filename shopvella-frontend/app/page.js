'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- Integrated Next.js App Router Navigation

export default function Storefront() {
  const router = useRouter(); // <-- Initialized Router Hook Instance

  // State Management
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Search and Category Parameters State Control
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Cases');

  // Delivery Checkout Form Input Parameters State Mapping Control Layers
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Only keeping the 'All Cases' category as requested
  const categoriesList = ['All Cases'];

  // Synced state fetching logic hook map
  useEffect(() => {
    const fetchFilteredCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build analytical URL structures safely containing parameters mapping rules
        const urlParams = new URLSearchParams();
        if (searchQuery.trim() !== '') {
          urlParams.append('search', searchQuery.trim());
        }
        if (activeCategory !== 'All Cases') {
          urlParams.append('category', activeCategory);
        }

        // Ensure we fall back safely, then cleanly append the exact endpoint path suffix
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseApiUrl}/api/products?${urlParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProducts(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching filtered database items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Implemented micro-debounce route control window mapping logic to maximize efficiency
    const delayDebounceInstance = setTimeout(() => {
      fetchFilteredCatalog();
    }, 350);

    return () => clearTimeout(delayDebounceInstance);
  }, [searchQuery, activeCategory]);

  // Load persistence configurations from local browser states on component assembly
  useEffect(() => {
    const savedCartData = localStorage.getItem('shopvella_cart_cache');
    if (savedCartData) {
      try {
        setCart(JSON.parse(savedCartData));
      } catch (e) {
        console.error('Failed to parse cart local storage tracking data:', e);
      }
    }
  }, []);

  // Update persistent caching layers across local states during execution instances
  const updateCachedCartState = (updatedCartStructure) => {
    setCart(updatedCartStructure);
    localStorage.setItem('shopvella_cart_cache', JSON.stringify(updatedCartStructure));
  };

  // Cart Logic Actions
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      alert('This ultra-premium design statement is completely sold out.');
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    let newCartItems = [];

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        alert(`Maximum allocated item collection capability reached (${product.stock_quantity} units available).`);
        return;
      }
      newCartItems = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCartItems = [...cart, { ...product, quantity: 1 }];
    }
    
    updateCachedCartState(newCartItems);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, amount) => {
    const targetProductInCart = cart.find(item => item.id === productId);
    if (!targetProductInCart) return;

    if (amount > 0 && targetProductInCart.quantity >= targetProductInCart.stock_quantity) {
      alert('Cannot exceed dynamic inventory parameters allocations built inside warehouse systems.');
      return;
    }

    const computedAdjustedCartStructure = cart.map((item) => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    updateCachedCartState(computedAdjustedCartStructure);
  };

  const handleCheckout = async () => {
    // 1. Ensure required client verification components are completely available prior to transmission
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim() || !phoneNumber.trim()) {
      alert('Please fully fill out all shipping and contact details before processing your Cash on Delivery order.');
      return;
    }

    try {
      setCheckoutLoading(true);
      
      const payload = {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name
        })),
        customerDetails: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          shippingAddress: shippingAddress.trim(),
          phoneNumber: phoneNumber.trim()
        }
      };

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseApiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // 2. Safely wipe temporary checkout metrics caches and reset view status rules cleanly
        updateCachedCartState([]);
        setCustomerName('');
        setCustomerEmail('');
        setShippingAddress('');
        setPhoneNumber('');
        setIsCartOpen(false);

        // 3. Automatically navigate to the success route location (/success/page.js)
        router.push('/success');
      } else {
        alert(`Checkout Error: ${result.details || result.error || 'Failed to process order profiles allocation.'}`);
      }
    } catch (err) {
      console.error('Checkout execution exception logged:', err);
      alert('Failed to connect with database checkout deployment services.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-black selection:text-white">
      
      {/* STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span 
            onClick={() => { setSearchQuery(''); setActiveCategory('All Cases'); }}
            className="text-xl font-black tracking-tight uppercase text-zinc-900 cursor-pointer select-none shrink-0"
          >
            Shopvella
          </span>

          {/* SEARCH BAR UTILITY */}
          <div className="mx-4 max-w-md flex-1 relative hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search cases"
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Cart Icon Button with Counter Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:bg-zinc-50 active:scale-95 shrink-0"
            aria-label="Open Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-zinc-700 group-hover:text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {totalCartItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in duration-200">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE ONLY FLOATING SEARCH UNIT */}
      <div className="w-full px-4 py-2 bg-white border-b border-zinc-200 block sm:hidden">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search cases"
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        
        {/* HERO PROMOTIONAL BANNER */}
        <section className="my-6 overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-lg">
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 flex flex-col items-center text-center">
            <span className="mb-3 text-xs font-bold tracking-widest uppercase text-amber-400">
              ⚡ Premium Cases Collection
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl uppercase">
              PREMIUM PHONE CASES.
            </h1>
            <p className="mt-4 max-w-md text-sm text-zinc-400 sm:text-base">
              Explore ultra-reinforced custom defense layouts explicitly engineered for complete device protection. Zero compromises on style aesthetics.
            </p>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => document.getElementById('shop-collection').scrollIntoView({ behavior: 'smooth' })} 
                className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:bg-zinc-100 transition active:scale-95"
              >
                Shop Cases
              </button>
            </div>
          </div>
        </section>

        {/* CATEGORY TABS SECTION */}
        <section className="mt-8 mb-4 border-b border-zinc-200 pb-2">
          <div className="flex space-x-2 overflow-x-auto scrollbar-none touch-pan-x py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoriesList.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-5 py-2 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-black text-white shadow-sm scale-102'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-black'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* DYNAMIC PRODUCT COLLECTION */}
        <section id="shop-collection" className="mt-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {activeCategory} Listing
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Refreshed in real-time based on selection matrix parameters</p>
            </div>
            {searchQuery !== '' && (
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 self-start sm:self-center">
                Search matches for "{searchQuery}"
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <svg className="animate-spin h-8 w-8 text-black mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs font-medium tracking-wide uppercase">Recompiling live query layers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="my-12 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
              <p className="font-bold">Failed to synchronize products</p>
              <p className="text-xs mt-1 opacity-80">{error}</p>
            </div>
          )}

          {/* Empty Catalog Array State */}
          {!loading && !error && products.length === 0 && (
            <div className="my-16 rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mx-auto h-10 w-10 text-zinc-300 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
              </svg>
              <p className="text-sm font-medium text-zinc-800">No items match parameters criteria</p>
              <p className="text-xs mt-0.5">Modify adjustments or structural phrases inputs to discover alternative pieces.</p>
            </div>
          )}

          {/* Responsive Product Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-8">
              {products.map((product) => {
                const isSoldOut = product.stock_quantity <= 0;
                return (
                  <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md">
                    
                    {/* Image Frame Container */}
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 group-hover:opacity-90 relative">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'}
                        alt={product.name}
                        className={`h-full w-full object-cover object-center transition duration-300 ${isSoldOut ? 'grayscale blur-xs' : ''}`}
                      />
                      {isSoldOut && (
                        <span className="absolute left-3 top-3 rounded bg-zinc-900 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                          Sold Out
                        </span>
                      )}
                      {!isSoldOut && product.stock_quantity <= 5 && (
                        <span className="absolute left-3 top-3 rounded bg-amber-500 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow animate-pulse">
                          Low Stock ({product.stock_quantity})
                        </span>
                      )}
                    </div>

                    {/* Product Info Metadata */}
                    <div className="mt-4 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                          {product.description || 'Premium design architecture made for everyday functional expression.'}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-base font-black text-zinc-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isSoldOut}
                          className={`rounded-lg px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
                            isSoldOut 
                              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed active:scale-100' 
                              : 'bg-black hover:bg-zinc-800'
                          }`}
                        >
                          {isSoldOut ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* SLIDE-OUT SIDEBAR SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Dimmer */}
          <div 
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col h-full">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-zinc-100">
                <h2 className="text-lg font-bold text-zinc-900">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-md text-zinc-400 hover:text-zinc-500 p-1 hover:bg-zinc-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Body Scroll Container */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12 mb-2 stroke-zinc-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p className="text-sm font-medium">Your cart is currently empty</p>
                  </div>
                ) : (
                  <>
                    <ul role="list" className="-my-6 divide-y divide-zinc-100">
                      {cart.map((item) => (
                        <li key={item.id} className="flex py-6">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                            <img
                              src={item.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-sm font-bold text-zinc-900">
                                <h4 className="line-clamp-1">{item.name}</h4>
                                <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">${parseFloat(item.price).toFixed(2)} each</p>
                            </div>
                            
                            {/* Native Quantity Control Handlers */}
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="px-2 py-1 text-zinc-500 hover:text-black hover:bg-zinc-50 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                  </svg>
                                </button>
                                <span className="px-3 py-1 text-xs font-bold text-zinc-800 bg-zinc-50 min-w-8 text-center select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="px-2 py-1 text-zinc-500 hover:text-black hover:bg-zinc-50 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </button>
                              </div>

                              <button
                                onClick={() => updateQuantity(item.id, -item.quantity)}
                                className="font-medium text-xs text-red-600 hover:text-red-500 underline uppercase tracking-wider"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* CASH ON DELIVERY BILLING INFORMATION MODULE */}
                    <div className="mt-12 border-t border-zinc-200 pt-6">
                      <h3 className="text-xs font-black tracking-wider uppercase text-zinc-900 mb-4 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-zinc-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.083-1.332A4.864 4.864 0 0 0 18.614 10.5H15.75m-3 8.25h3m-3 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-13.5V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625V14.25m12-4.5V4.5m-3 5.25a3 3 0 0 1-3-3V4.5" />
                        </svg>
                        Delivery Information (COD)
                      </h3>
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Full Name</label>
                          <input 
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Email Address</label>
                          <input 
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="johndoe@example.com"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Phone Number</label>
                          <input 
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Shipping Destination Address</label>
                          <textarea 
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Street Address, Suite, Apartment, City, State"
                            rows="2"
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer Static Section */}
              {cart.length > 0 && (
                <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-bold text-zinc-900">
                    <p>Subtotal</p>
                    <p>${cartSubtotal.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">Free delivery nationwide via Cash on Delivery terms.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full flex items-center justify-center rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-zinc-800 transition active:scale-98 disabled:bg-zinc-400 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing Cash order...
                        </span>
                      ) : (
                        'Confirm Order (Cash on Delivery)'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}