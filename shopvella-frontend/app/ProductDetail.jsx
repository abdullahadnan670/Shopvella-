'use client';

import React, { useState, useEffect } from 'react';

export default function ProductDetail({ product, onBack, addToCart, fastTrackBuyNow }) {
  // Enforce array checks to guarantee structural fallback reliability
  const structuralImageArray = product.image_urls && Array.isArray(product.image_urls) 
    ? product.image_urls.filter(Boolean) 
    : [];

  // Local active image viewport reference tracker
  const [activePhoto, setActivePhoto] = useState('');

  // 🛠️ Functional Dynamic Option Selectors
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Parse options safely from array or comma-separated string formats
  const parseOptions = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field.filter(Boolean);
    if (typeof field === 'string') {
      return field.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const availableSizes = parseOptions(product.sizes || product.size_options);
  const availableColors = parseOptions(product.colors || product.color_options);

  // Sync active local picture viewing metrics safely when products mutate contexts
  useEffect(() => {
    if (structuralImageArray.length > 0) {
      setActivePhoto(structuralImageArray[0]);
    } else {
      setActivePhoto('');
    }

    const sizes = parseOptions(product.sizes || product.size_options);
    const colors = parseOptions(product.colors || product.color_options);
    setSelectedSize(sizes.length > 0 ? sizes[0] : '');
    setSelectedColor(colors.length > 0 ? colors[0] : '');
    setQuantity(1);
  }, [product]);

  const hasMultipleImages = structuralImageArray.length > 1;

  // Defensive Structural Fallback: Guarantee string security even on temporary latency mismatch
  const safeDetailsContentText = product.details || '';

  // Safe tracking wrappers
  const handleAddToCartClick = () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: String(product.id),
          content_name: `${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`,
          quantity: quantity,
          price: Number(product.price)
        }],
        value: Number(product.price) * quantity,
        currency: 'PKR'
      });
    }
    addToCart(product, quantity, selectedSize || null, selectedColor || null);
  };

  const handleFastTrackClick = () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: [{
          content_id: String(product.id),
          content_name: `${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`,
          quantity: quantity,
          price: Number(product.price)
        }],
        value: Number(product.price) * quantity,
        currency: 'PKR'
      });
    }
    fastTrackBuyNow(product, quantity, selectedSize || null, selectedColor || null);
  };

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
          Back to products grid
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
                  aria-label={`Switch main active viewport context frame matrix to alternate index view ${index + 1}`}
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
                ✓ PREMIUM QUALITY GUARANTEED
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 uppercase leading-none">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4 border-b border-zinc-100 pb-5">
              <span className="text-3xl font-mono font-black text-zinc-950">
                pkr {Number(product.price || 0).toFixed(2)}
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

          {/* DYNAMIC SELECTORS MATRIX: ONLY RENDERS WHEN ATTRIBUTES EXIST */}
          <div className="space-y-5 border-t border-b border-zinc-100 py-6">
            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Select Size: <strong className="text-zinc-900">{selectedSize}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border transition-all ${
                        selectedSize === sz
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Select Color: <strong className="text-zinc-900">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border transition-all ${
                        selectedColor === col
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🚀 WHATSAPP SPECIFICATION NOTICE ALERT */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5">
              <span className="text-amber-600 shrink-0 text-sm mt-0.5">💬</span>
              <p className="text-[11px] leading-relaxed font-medium text-amber-800">
                If you want to specify the color, please send the link or a photo of this product and your chosen color to our WhatsApp: <strong className="font-bold underline tracking-wider text-amber-950">03054929863</strong>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Quantity
              </span>
              <div className="flex items-center w-32 border border-zinc-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock_quantity <= 0}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border-r border-zinc-200 transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  —
                </button>
                <span className="flex-1 text-center text-xs font-mono font-bold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity || product.stock_quantity <= 0}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border-l border-zinc-200 transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* TWO-BUTTON STRICT CONVERSION SPLIT FUNNEL CONTROL BLOCK */}
          <div className="space-y-3 pt-2">
            {/* Split A: Background Injection Control Module */}
            <button
              onClick={handleAddToCartClick}
              disabled={product.stock_quantity <= 0}
              className="w-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-black uppercase tracking-widest py-4 px-6 rounded-xl transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add To Background Cart
            </button>

            {/* Split B: Direct Conversion Isolation Fast-Path Checkout Module */}
            <button
              onClick={handleFastTrackClick}
              disabled={product.stock_quantity <= 0}
              className="w-full bg-black hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Fast-Track Buy Now (COD)</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </button>
          </div>

          {/* REFACTORED SINGLE ELEVATED CONTENT BOX */}
          <div className="border-t border-zinc-200 pt-6 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              SPECIFICATIONS & DETAILS
            </h3>
            <div className="py-1">
              <p className="text-xs leading-relaxed text-zinc-700 font-normal font-sans whitespace-pre-line">
                {safeDetailsContentText}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}