'use client';

import React, { useEffect } from 'react';

export default function CheckoutSuccessPage() {
  
  // Wipe localized structural tracking state variables and trigger TikTok Purchase tracking
  useEffect(() => {
    // 1. Clear cart cache
    localStorage.removeItem('shopvella_cart_cache');
    console.log('🛒 Localized transactional cart parameters successfully reset.');

    // 2. 🚀 TRIGGER TIKTOK COMPLETE PAYMENT PIXEL EVENT
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompletePayment', {
        value: 2500,        // Pass your actual value or standard placeholder item price 
        currency: 'PKR',    // Set correctly to Pakistani Rupee
        content_type: 'product'
      });
      console.log('📈 TikTok Pixel: CompletePayment event successfully triggered.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-between selection:bg-black selection:text-white">
      
      {/* HEADER UTILITY BRAND DISPLAY BRAND BAR */}
      <nav className="w-full border-b border-zinc-200 bg-white py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="text-xl font-black tracking-tight uppercase text-zinc-900 select-none">
            Shopvella
          </span>
        </div>
      </nav>

      {/* MAIN CARRIER SECTION CONTENT CARD BOX */}
      <main className="mx-auto max-w-md w-full px-4 my-auto py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl transform animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* PREMIUM ANIMATED VECTOR STATUS ICON LAYER */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-8 w-8 animate-in zoom-in-50 duration-300 delay-150 fill-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            Transaction Authorized
          </span>

          <h2 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-zinc-900">
            Order Confirmed
          </h2>
          
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Your high-converting fashion asset procurement sequence has finalized smoothly. A delivery itinerary layout manifest along with tracking records will deliver to your inbox shortly.
          </p>

          <div className="mt-8 rounded-xl bg-zinc-50 border border-zinc-100 p-4 text-left">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-2">Next Steps</h3>
            <ul className="text-xs text-zinc-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                <span>Verify order manifest inside registration profile mailer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                <span>Aviation logistics fulfillment occurs within 24 hours</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center rounded-xl bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition active:scale-98"
            >
              Continue Exploring Drops
            </button>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER COMPLEMENTARY SIGNATURE LAYOUT ELEMENT */}
      <footer className="w-full border-t border-zinc-200 bg-white py-6 text-center text-[10px] uppercase font-bold tracking-widest text-zinc-400">
        © 2026 Shopvella Systems Architecture Inc. All rights reserved.
      </footer>
    </div>
  );
}