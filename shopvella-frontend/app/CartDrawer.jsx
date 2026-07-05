'use client';

import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  shippingAddress,
  setShippingAddress,
  phoneNumber,
  setPhoneNumber,
  formErrors,
  setFormErrors,
  checkoutLoading,
  handleCheckout
}) {
  if (!isOpen) return null;

  const cartSubtotal = cart.reduce((total, item) => total + (parseFloat(item.price) || 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Sliding Frame */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col h-full border-l border-zinc-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">Your Shopping Cart</h2>
            <button
              onClick={onClose}
              className="rounded-md text-zinc-400 hover:text-zinc-500 p-1 hover:bg-zinc-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Content / Form Scroller */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12 mb-2 stroke-zinc-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-sm font-medium">Your selection layer is empty</p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <ul role="list" className="-my-6 divide-y divide-zinc-100 mb-8">
                  {cart.map((item) => (
                    <li key={item.id} className="flex py-6 animate-in fade-in duration-200">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600'; }}
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-sm font-bold text-zinc-900">
                            <h4 className="line-clamp-1">{item.name}</h4>
                            <p className="ml-4">${((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">${(parseFloat(item.price) || 0).toFixed(2)} each</p>
                        </div>
                        
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

                {/* Secure Form Controls */}
                <div className="border-t border-zinc-200 pt-6">
                  <h3 className="text-xs font-black tracking-wider uppercase text-zinc-900 mb-4 flex items-center gap-1.5">
                    <span className="text-zinc-950">⚡</span> Delivery Information (COD)
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Full Name</label>
                      <input 
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if(e.target.value.trim()) setFormErrors(p => ({...p, name: false}));
                        }}
                        placeholder="John Doe"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none transition-all ${
                          formErrors.name ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-zinc-200 bg-zinc-50 focus:border-black'
                        }`}
                      />
                      {formErrors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">Full Name field cannot be left blank.</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Email Address</label>
                      <input 
                        type="email"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if(e.target.value.trim()) setFormErrors(p => ({...p, email: false}));
                        }}
                        placeholder="johndoe@example.com"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none transition-all ${
                          formErrors.email ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-zinc-200 bg-zinc-50 focus:border-black'
                        }`}
                      />
                      {formErrors.email && <p className="text-[10px] text-red-500 font-semibold mt-1">Email address parameter sequence is required.</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Phone Number</label>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if(e.target.value.trim()) setFormErrors(p => ({...p, phoneNumber: false}));
                        }}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none transition-all ${
                          formErrors.phoneNumber ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-zinc-200 bg-zinc-50 focus:border-black'
                        }`}
                      />
                      {formErrors.phoneNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">Active phone contact mapping line is mandatory.</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1">Shipping Destination Address</label>
                      <textarea 
                        value={shippingAddress}
                        onChange={(e) => {
                          setShippingAddress(e.target.value);
                          if(e.target.value.trim()) setFormErrors(p => ({...p, shippingAddress: false}));
                        }}
                        placeholder="Street Address, Suite, Apartment, City, State"
                        rows="2"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none transition-all resize-none ${
                          formErrors.shippingAddress ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-zinc-200 bg-zinc-50 focus:border-black'
                        }`}
                      />
                      {formErrors.shippingAddress && <p className="text-[10px] text-red-500 font-semibold mt-1">Logistics delivery routing criteria field must be defined.</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Sticky Bar */}
          {cart.length > 0 && (
            <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-6 sm:px-6">
              <div className="flex justify-between text-base font-bold text-zinc-900">
                <p>Subtotal</p>
                <p>${cartSubtotal.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">Free delivery nationwide via Cash on Delivery parameters terms.</p>
              
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
                      Locking Order Matrix...
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
  );
}