'use client';

import React, { useState, useEffect, use as reactUse } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Relative path imports going up 2 levels back to the 'app' root directory
import ProductDetail from '../../ProductDetail';
import CartDrawer from '../../CartDrawer';

export default function DynamicProductPage({ params }) {
  const router = useRouter();
  
  // 1. Unwrapping dynamic Next.js params asynchronously (React 19 / Next.js 15+ Standard)
  const { id } = reactUse(params);

  // Application State Matrix
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // 'NOT_FOUND' | 'SERVER_ERROR' | null
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // COD Checkout Core Inputs
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

  const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Synchronize dynamic TikTok Pixel layout
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
  }, []);

  // Synchronize cart records with localStorage on mounting
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

  // 2. Dynamic Fetching Layer with Fallback Error Status Catch
  useEffect(() => {
    const fetchTargetProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_API_URL}/api/products/${id}`);
        
        // Catch 404 and activate dynamic fallback view state
        if (response.status === 404) {
          setError('NOT_FOUND');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP sync exception: status ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError('NOT_FOUND');
        }
      } catch (err) {
        console.error('Critical dynamic single fetch operational hazard:', err);
        setError('SERVER_ERROR');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTargetProduct();
    }
  }, [id, BASE_API_URL]);

  const triggerToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateCachedCartState = (updatedCartStructure) => {
    setCart(updatedCartStructure);
    localStorage.setItem('shopvella_cart_cache', JSON.stringify(updatedCartStructure));
  };

  // Funnel Options corresponding to background sync
  const addToCart = (productItem) => {
    if (productItem.stock_quantity <= 0) {
      triggerToastNotification('Selection configuration sold out.');
      return;
    }

    const existingItem = cart.find((item) => item.id === productItem.id);
    let newCartItems = [];

    if (existingItem) {
      if (existingItem.quantity >= productItem.stock_quantity) {
        triggerToastNotification(`Maximum capacity limit hit (${productItem.stock_quantity} units available).`);
        return;
      }
      newCartItems = cart.map((item) =>
        item.id === productItem.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCartItems = [...cart, { ...productItem, quantity: 1 }];
    }
    
    updateCachedCartState(newCartItems);
    triggerToastNotification(`"${productItem.name}" injected safely into background cart.`);
  };

  const fastTrackBuyNow = (productItem) => {
    if (productItem.stock_quantity <= 0) {
      triggerToastNotification('Selection model configurations sold out.');
      return;
    }
    const fastTrackItem = [{ ...productItem, quantity: 1 }];
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

      const response = await fetch(`${BASE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        if (typeof window !== 'undefined' && window.ttq) {
          const cartSubtotal = cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);
          const shippingFee = cartSubtotal > 2000 ? 0 : 200;
          
          window.ttq.track('CompletePayment', {
            contents: cart.map((item) => ({
              content_id: String(item.id),
              content_name: item.name,
              quantity: item.quantity,
              price: Number(item.price)
            })),
            value: cartSubtotal + shippingFee,
            currency: 'PKR'
          });
        }

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
      console.error('Checkout loop exception:', err);
      router.push('/cancel');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Dynamic Search-To-Home Bridge Handler
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // 4. Gorgeous Branded "Product Not Found" Fallback UI
  if (!loading && error === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-between selection:bg-black selection:text-white">
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-black tracking-tight uppercase text-zinc-900 select-none">
              Shopvella
            </Link>
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center flex-grow px-4 py-24 text-center">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono">404 REGISTRY FAULT</span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 uppercase">
                Accessory Not Found
              </h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                The targeted defense shield layout or device accessory config is missing or has been retired from production cycles.
              </p>
            </div>

            <div className="pt-2">
              <Link 
                href="/" 
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 transition-all shadow-md active:scale-[0.98]"
              >
                ← Return to Shop
              </Link>
            </div>
          </div>
        </main>

        <footer className="w-full bg-white border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-[11px] text-zinc-400">
            <p>&copy; 2026 Shopvella Platform. Tech Accessories Defense Systems Matrix Operations.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-between selection:bg-black selection:text-white relative">
      
      {/* Dynamic Toast Layer */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2">
          <span className="text-amber-400">⚡</span> {toastMessage}
        </div>
      )}

      <div>
        {/* Navigation Wrapper */}
        <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-black tracking-tight uppercase text-zinc-900 select-none">
              Shopvella
            </Link>

            {/* Global Search Interface Redirect Engine */}
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
                onKeyDown={handleSearchKeyPress}
                placeholder="search and press enter..."
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

        <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 mt-8">
          {loading ? (
            // Full screen skeleton mirroring layout
            <div className="animate-pulse space-y-8 bg-white border border-zinc-200 rounded-3xl p-6 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-square bg-zinc-200 rounded-2xl w-full" />
                <div className="space-y-6 py-4">
                  <div className="h-8 bg-zinc-200 rounded w-3/4" />
                  <div className="h-4 bg-zinc-200 rounded w-1/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 rounded w-full" />
                    <div className="h-3 bg-zinc-200 rounded w-5/6" />
                  </div>
                  <div className="h-12 bg-zinc-200 rounded-xl w-full mt-10" />
                </div>
              </div>
            </div>
          ) : product ? (
            // 3. Injecting product data directly into your existing <ProductDetail /> component
            <ProductDetail
              product={product}
              onBack={() => router.push('/')}
              addToCart={addToCart}
              fastTrackBuyNow={fastTrackBuyNow}
            />
          ) : null}
        </main>
      </div>

      <footer className="w-full bg-white border-t border-zinc-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between text-[11px] text-zinc-400">
          <p>&copy; 2026 Shopvella Platform. Tech Accessories Defense Systems Matrix Operations.</p>
          <p className="mt-2 sm:mt-0 font-mono tracking-tight uppercase">V2.8 // Dynamic Router Engine</p>
        </div>
      </footer>

      {/* Cart Drawer Bridge sync */}
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