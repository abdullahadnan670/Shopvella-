'use client';

import React, { useState, useEffect } from 'react';

export default function ProductDetail({ product, onBack, addToCart, fastTrackBuyNow }) {
  // Enforce array checks to guarantee structural fallback reliability
  const structuralImageArray = product.image_urls && Array.isArray(product.image_urls) 
    ? product.image_urls.filter(Boolean) 
    : [];

  // Local active image viewport reference tracker
  const [activePhoto, setActivePhoto] = useState('');
  const [activeAccordionTab, setActiveAccordionTab] = useState('Narrative');

  // Sync active local picture viewing metrics safely when products mutate contexts
  useEffect(() => {
    if (structuralImageArray.length > 0) {
      setActivePhoto(structuralImageArray[0]);
    } else {
      setActivePhoto('');
    }
  }, [product]);

  // Premium Tech Accessories Data Extraction Mapping Blocks
  const accordionTabs = [
    {
      id: 'Narrative',
      title: 'Narrative',
      content: product.narrative || 'Military grade drop protection capsule engineered to secure your devices against high-impact collisions without adding bulk weight profiles.'
    },
    {
      id: 'Specs & Fit',
      title: 'Specs & Fit',
      content: product.specs_and_fit || 'Fully compatible with standard MagSafe wireless charging matrices. Features a 2.5mm raised defense bezel perimeter protection zone.'
    },
    {
      id: 'Care & Build',
      title: 'Care & Build',
      content: product.care_and_build || 'Formulated with an advanced oleophobic anti-fingerprint coating layer. Wipe cleanly using specialized micro-fiber cloth systems.'
    }
  ];

  const hasMultipleImages = structuralImageArray.length > 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Elegant Return Link Layout Framework Row */}
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-sm transition-all hover:bg-zinc-900 hover:text-white active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to accessories grid
        </button>
      </div>

      {/* Split Component Details Display Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white border border-zinc-200 rounded-3xl p-6 lg:p-10 shadow-sm">
        
        {/* LEFT COLUMN: MULTI-IMAGE DYNAMIC GALLERY CONDITION SHOWCASE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100 relative flex items-center justify-center">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-all duration-300"
              />
            ) : (
              <div className="text-xs text-zinc-400 uppercase font-mono tracking-widest">No Active Operational Frame</div>
            )}
          </div>

          {/* Condition B Multi-Image Thumbnail Track Implementation Row */}
          {hasMultipleImages && (
            <div className="grid grid-cols-4 gap-3">
              {structuralImageArray.map((photoUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhoto(photoUrl)}
                  onMouseEnter={() => setActivePhoto(photoUrl)}
                  className={`aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 border transition-all ${
                    activePhoto === photoUrl 
                      ? 'border-black ring-2 ring-black/5 scale-[0.97]' 
                      : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Switch main active viewport context frame matrix to alternate index element view ${index + 1}`}
                >
                  <img
                    src={photoUrl}
                    alt={`${product.name} structural alternate specification layout angle viewport capture ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREMIUM CONVERSION BLOCK CONTROLS */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                ✓ MILITARY-GRADE DROP PROTECTION VERIFIED
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 uppercase leading-none">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4 border-b border-zinc-100 pb-5">
              <span className="text-3xl font-mono font-black text-zinc-950">
                ${Number(product.price || 0).toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                Cash On Delivery Guaranteed
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${product.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <p className="text-xs text-zinc-600">
                {product.stock_quantity > 0 ? (
                  <span className="font-medium">● {product.stock_quantity} Units Available in Stock</span>
                ) : (
                  <span className="text-red-600 font-bold uppercase tracking-wider">Allocation exhausted from active distribution nodes.</span>
                )}
              </p>
            </div>
          </div>

          {/* TWO-BUTTON STRICT CONVERSION SPLIT FUNNEL CONTROL BLOCK */}
          <div className="space-y-3 pt-2">
            {/* Split A: Background Injection Control Module */}
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock_quantity <= 0}
              className="w-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add To Background Cart
            </button>

            {/* Split B: Direct Conversion Isolation Fast-Path Checkout Module */}
            <button
              onClick={() => fastTrackBuyNow(product)}
              disabled={product.stock_quantity <= 0}
              className="w-full bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Fast-Track Buy Now (COD)</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </button>
          </div>

          {/* DYNAMIC TABBED ACCORDION DATA EXTRACTIONS MODULES */}
          <div className="border-t border-zinc-200 pt-6 space-y-2">
            <div className="flex border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {accordionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAccordionTab(tab.id)}
                  className={`pb-2.5 pr-4 border-b-2 transition-all ${
                    activeAccordionTab === tab.id 
                      ? 'border-black text-zinc-950 font-black' 
                      : 'border-transparent hover:text-zinc-600'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            
            <div className="py-2 animate-in fade-in duration-150">
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                {accordionTabs.find(tab => tab.id === activeAccordionTab)?.content}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}