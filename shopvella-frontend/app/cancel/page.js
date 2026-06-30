'use client';

import React from 'react';

export default function CheckoutCancelPage() {
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
          
          {/* HIGH-CONVERTING WARNING RETENTION VECTOR ICON LAYER */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-8 w-8 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <span className="text-[10px] font-black tracking-widest uppercase text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
            Allocation Saved
          </span>

          <h2 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-zinc-900">
            Cart Preserved
          </h2>
          
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Your transaction pipeline was paused, but your exclusive selection allocation remains cached securely inside our local routing systems architecture. Demand remains high; items are not guaranteed if abandonment continues.
          </p>

          {/* HIGH-CONVERTING RETENTION HIGHLIGHT PROMPT BOX */}
          <div className="mt-6 border-2 border-dashed border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
            <p className="text-xs font-bold text-zinc-800 text-center">
              🔥 Complete transaction sequence now to bypass delivery delays.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center rounded-xl bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition active:scale-98"
            >
              Return To Open Collection
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center rounded-xl bg-white border border-zinc-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition active:scale-98"
            >
              Modify Item Selections
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