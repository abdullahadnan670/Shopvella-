'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ProductDetail from './ProductDetail';
import CartDrawer from './CartDrawer';

export default function Storefront() {
  const router = useRouter();

  // Core Application State Matrix
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Cases');

  // COD Checkout Core Customer Delivery Registration Inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    shippingAddress: false,
    phoneNumber: false
  });

  // Fetch updated catalog dataset matching the new schema specifications
  useEffect(() => {
    const fetchFilteredCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const urlParams = new URLSearchParams();
        if (searchQuery.trim() !== '') {
          urlParams.append('search', searchQuery.trim());
        }
        
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shopvella-backend.vercel.app';
        const response = await fetch(`${baseApiUrl}/api/products?${urlParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP grid network sync exception code response: status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProducts(result.data || []);
          
          // Re-sync active view references if database catalog reloads
          if (selectedProduct) {
            const reSyncedInstance = (result.data || []).find(p => p.id === selectedProduct.id);
            if (reSyncedInstance) setSelectedProduct(reSyncedInstance);
          }
        } else {
          throw new Error(result.error || 'Database lookup anomalies caught.');
        }
      } catch (err) {
        console.error('Critical database read operations logging error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceInstance = setTimeout(() => {
      fetchFilteredCatalog();
    }, 350);

    return () => clearTimeout(delayDebounceInstance);
  }, [searchQuery]);

  // Sync cache records from localStorage on initial run
  useEffect(() => {
    const savedCartData = localStorage.getItem('shopvella_cart_cache');
    if (savedCartData) {
      try {
        setCart(JSON.parse(savedCartData));
      } catch (e) {
        console.error('Failed to parse cached local storage cart elements:', e);
      }
    }
  }, []);

  const triggerToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateCachedCartState = (updatedCartStructure) => {
    setCart(updatedCartStructure);
    localStorage.setItem('shopvella_cart_cache', JSON.stringify(updatedCartStructure));
  };

  // Funnel Option A: Quiet background injection logic layer
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      triggerToastNotification('Selection configuration sold out.');
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    let newCartItems = [];

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        triggerToastNotification(`Maximum capacity limit hit (${product.stock_quantity} units available).`);
        return;
      }
      newCartItems = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCartItems = [...cart, { ...product, quantity: 1 }];
    }
    
    updateCachedCartState(newCartItems);
    triggerToastNotification(`"${product.name}" injected safely into background cart.`);
  };

  // Funnel Option B: Fast-Track conversion bypass logic shortcut
  const fastTrackBuyNow = (product) => {
    if (product.stock_quantity <= 0) {
      triggerToastNotification('Selection model configurations sold out.');
      return;
    }
    const fastTrackItem = [{ ...product, quantity: 1 }];
    updateCachedCartState(fastTrackItem);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, amount) => {
    const targetProductInCart = cart.find(item => item.id === productId);
    if (!targetProductInCart) return;

    if (amount > 0 && targetProductInCart.quantity >= targetProductInCart.stock_quantity) {
      triggerToastNotification('Cannot exceed real-time tracking warehouse metrics.');
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
    const errors = {
      name: !customerName.trim(),
      email: !customerEmail.trim(),
      shippingAddress: !shippingAddress.trim(),
      phoneNumber: !phoneNumber.trim()
    };

    setFormErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

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

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shopvella-backend.vercel.app';
      const response = await fetch(`${baseApiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        updateCachedCartState([]);
        setCustomerName('');
        setCustomerEmail('');
        setShippingAddress('');
        setPhoneNumber('');
        setIsCartOpen(false);
        router.push('/success');
      } else {
        router.push('/cancel');
      }
    } catch (err) {
      console.error('Checkout processing loop anomaly:', err);
      router.push('/cancel');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-between selection:bg-black selection:text-white relative">
      
      {/* Dynamic Notifications System Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2">
          <span className="text-amber-400">⚡</span> {toastMessage}
        </div>
      )}

      <div>
        {/* Global Navigation System */}
        <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span 
              onClick={() => { setSelectedProduct(null); setSearchQuery(''); }}
              className="text-xl font-black tracking-tight uppercase text-zinc-900 cursor-pointer select-none"
            >
              Shopvella
            </span>

            {/* Search Input Box */}
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
                placeholder="search accessories..."
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:bg-zinc-50 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-zinc-700 group-hover:text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white ring-2 ring-white">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Input Framework Layer */}
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
              placeholder="search accessories..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Premium Minimalist Black Banner Promo Hero */}
        {!selectedProduct && (
          <div className="w-full bg-black text-white py-14 px-4 text-center border-b border-zinc-800">
            <div className="max-w-3xl mx-auto space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase font-sans">
                PREMIUM TECH ACCESSORIES.
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed tracking-wide max-w-2xl mx-auto">
                Explore ultra-reinforced custom defense layouts explicitly engineered for complete device protection. Zero compromises on style aesthetics.
              </p>
            </div>
          </div>
        )}

        {/* Main Infrastructure Processing Block Container */}
        <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 mt-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
              <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Syncing Accessories Infrastructure Grid...</p>
            </div>
          )}

          {error && (
            <div className="my-12 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 max-w-xl mx-auto text-xs">
              <p className="font-bold uppercase tracking-wide">Sync Fault Encountered</p>
              <p className="mt-1 opacity-80">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {selectedProduct ? (
                <ProductDetail 
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                  addToCart={addToCart}
                  fastTrackBuyNow={fastTrackBuyNow}
                />
              ) : (
                <div>
                  <div className="mb-6 border-b border-zinc-200 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      PREMIUM EDITIONS ({products.length})
                    </h2>
                  </div>
                  
                  {/* Two columns side-by-side on mobile, spacing tightened to gap-3 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 xl:gap-8">
                    {products.map((productItem) => {
                      const imageryArray = productItem.image_urls || [];
                      const directSourceThumbnail = imageryArray[0] || '';
                      const safeDescriptionText = productItem.description || '';

                      return (
                        <div 
                          key={productItem.id} 
                          onClick={() => setSelectedProduct(productItem)}
                          className="group cursor-pointer flex flex-col justify-between bg-white border border-zinc-200 rounded-2xl overflow-hidden p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div>
                            <div className="aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 relative">
                              {directSourceThumbnail ? (
                                <img
                                  src={directSourceThumbnail}
                                  alt={productItem.name}
                                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 uppercase font-mono">No Active Imagery</div>
                              )}
                              
                              {productItem.stock_quantity <= 0 && (
                                <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center">
                                  <span className="px-3 py-1 bg-black text-[9px] text-white font-bold uppercase tracking-widest rounded-full">SOLDOUT</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                              <div className="flex-1">
                                <h3 className="text-xs md:text-sm font-bold text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors line-clamp-1">
                                  {productItem.name}
                                </h3>
                                
                                {/* 1-Line Understated Description Typography Injection */}
                                <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed font-normal">
                                  {safeDescriptionText}
                                </p>
                                
                                <p className="mt-1.5 text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                                  Units: {productItem.stock_quantity}
                                </p>
                              </div>
                              <p className="text-xs md:text-sm font-mono font-black text-zinc-900 shrink-0 mt-0.5 sm:mt-0">
                                ${Number(productItem.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-5 pt-2.5 md:pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] md:text-xs font-bold uppercase tracking-wide text-zinc-500 group-hover:text-black transition-colors">
                            <span>VIEW DETAILS →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between text-[11px] text-zinc-400">
          <p>&copy; 2026 Shopvella Platform. Tech Accessories Defense Systems Matrix Operations.</p>
          <p className="mt-2 sm:mt-0 font-mono tracking-tight uppercase">V2.8 // Turbopack Core</p>
        </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        checkoutLoading={checkoutLoading}
        handleCheckout={handleCheckout}
      />
    </div>
  );
}