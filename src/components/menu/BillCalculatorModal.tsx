"use client";
import React from 'react';
import { CartItem } from './AddonBottomSheet';
import { Lang, t } from '@/lib/translations';

interface BillCalculatorModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  lang: Lang;
  onClose: () => void;
  onUpdateQuantity: (cartId: string, newQty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearBill: () => void;
  showVat?: boolean;
}

export default function BillCalculatorModal({
  isOpen,
  cartItems,
  lang,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearBill,
  showVat = false,
}: BillCalculatorModalProps) {
  const isAr = lang === 'AR';
  const tr = t(lang);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const vatAmount = showVat ? Number((subtotal * 0.14).toFixed(2)) : 0;
  const totalBillAmount = Number((subtotal + vatAmount).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col text-[#4A3C2A]"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="text-xl font-heading font-extrabold text-[#B38E5D]">
                {tr.billTitle}
              </h3>
              <p className="text-xs text-[#6E5A47] font-semibold mt-0.5">
                {tr.billSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4A3C2A] hover:text-black p-2 rounded-full bg-white/50 backdrop-blur-sm border border-white transition-all shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Itemized List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {cartItems.length > 0 ? (
            cartItems.map((cartItem) => (
              <div
                key={cartItem.cartId}
                className="bg-white/70 backdrop-blur-md border border-white p-4 rounded-2xl flex justify-between items-start shadow-sm"
              >
                <div className="flex-1">
                  <h4 className="font-heading font-extrabold text-[#4A3C2A] text-base mb-1">
                    {lang === 'AR' ? cartItem.item.nameAr
                      : lang === 'IT' ? ((cartItem.item as any).nameIt || cartItem.item.nameEn)
                      : lang === 'RU' ? ((cartItem.item as any).nameRu || cartItem.item.nameEn)
                      : cartItem.item.nameEn}
                  </h4>
                  <p className="text-xs text-[#6E5A47] font-semibold">
                    {cartItem.item.price} {tr.currency} × {cartItem.quantity}
                  </p>

                  {/* Add-ons list */}
                  {cartItem.selectedAddons.length > 0 && (
                    <div className="mt-2 text-xs text-[#6E5A47] space-y-1">
                      <span className="text-[#4A3C2A] opacity-80 font-bold block">
                        {tr.addOns}:
                      </span>
                      {cartItem.selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex justify-between max-w-[200px]">
                          <span>• {isAr ? addon.nameAr : addon.nameEn}</span>
                          <span className="text-[#B38E5D] font-bold">+{addon.price} {tr.currency}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item Subtotal */}
                  <div className="mt-3 text-sm font-extrabold text-[#B38E5D]">
                    {tr.subtotal} {cartItem.totalPrice} {tr.currency}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => onRemoveItem(cartItem.cartId)}
                    className="text-red-500 hover:text-red-600 text-xs font-bold bg-white/50 px-3 py-1 rounded-full border border-red-100 shadow-sm"
                  >
                    {tr.remove}
                  </button>

                  <div className="flex items-center gap-2 bg-white/80 border border-gray-200/50 rounded-full px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm">
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity - 1)}
                      className="text-[#B38E5D] font-extrabold px-1 hover:opacity-80 text-lg leading-none"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-[#4A3C2A] min-w-[16px] text-center text-sm">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity + 1)}
                      className="text-[#B38E5D] font-extrabold px-1 hover:opacity-80 text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#6E5A47]">
              <span className="text-5xl block mb-3 opacity-80">☕</span>
              <p className="font-bold">{tr.noBillItems}</p>
            </div>
          )}
        </div>

        {/* Footer & Total */}
        {cartItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-4">
            {showVat && (
              <>
                <div className="flex justify-between items-center text-[#6E5A47] text-sm font-semibold">
                  <span>{tr.subtotal}</span>
                  <span>{subtotal} {tr.currency}</span>
                </div>
                <div className="flex justify-between items-center text-[#6E5A47] text-sm font-semibold">
                  <span>{tr.vatAddedNote}</span>
                  <span>{vatAmount} {tr.currency}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white shadow-inner">
              <span className="text-sm font-extrabold text-[#4A3C2A]">
                {tr.totalBill}
              </span>
              <span className="text-2xl font-extrabold text-[#B38E5D]">
                {totalBillAmount} <span className="text-sm">{tr.currency}</span>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClearBill}
                className="flex-1 bg-white/70 hover:bg-red-50 text-red-600 border border-red-200/50 py-3.5 rounded-[20px] font-extrabold text-sm transition shadow-sm"
              >
                {tr.clearBill}
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-gold-3d text-white py-3.5 rounded-[20px] font-extrabold text-sm transition"
              >
                {tr.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
