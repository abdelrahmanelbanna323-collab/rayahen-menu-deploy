"use client";
import React, { useState } from 'react';
import { Lang, t } from '@/lib/translations';

export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr: string;
  nameIt?: string;
  nameRu?: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionIt?: string;
  descriptionRu?: string;
  price: number;
  badgeEn?: string;
  badgeAr?: string;
  badgeIt?: string;
  badgeRu?: string;
  categoryEn: string;
  categoryAr: string;
  imageUrl?: string;
}

export interface Addon {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
}

export const mockAddons: Addon[] = [
  { id: '1', nameEn: 'Extra Shot Espresso', nameAr: 'شوت اسبريسو إضافي', price: 15 },
  { id: '2', nameEn: 'Caramel Syrup', nameAr: 'سيرب كراميل', price: 10 },
  { id: '3', nameEn: 'Whipped Cream', nameAr: 'كريمة مخفوقة', price: 10 },
  { id: '4', nameEn: 'Oat Milk Substitute', nameAr: 'بديل حليب شوفان', price: 20 },
];

export interface CartItem {
  cartId: string;
  item: MenuItem;
  selectedAddons: Addon[];
  quantity: number;
  totalPrice: number;
}

interface AddonBottomSheetProps {
  item: MenuItem | null;
  lang: Lang;
  onClose: () => void;
  onAddToBill: (cartItem: CartItem) => void;
}

export default function AddonBottomSheet({ item, lang, onClose, onAddToBill }: AddonBottomSheetProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const isAr = lang === 'AR';
  const tr = t(lang);

  if (!item) return null;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const getAddonsList = () => {
    return mockAddons.filter((a) => selectedAddons.includes(a.id));
  };

  const calculateUnitTotal = () => {
    const addonsPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = mockAddons.find((a) => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
    return item.price + addonsPrice;
  };

  const calculateGrandTotal = () => {
    return calculateUnitTotal() * quantity;
  };

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartId: Date.now().toString() + Math.random().toString(),
      item,
      selectedAddons: getAddonsList(),
      quantity,
      totalPrice: calculateGrandTotal(),
    };
    onAddToBill(cartItem);
    onClose();
    setSelectedAddons([]);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-pearl-white border border-brand-gold/30 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto text-soft-charcoal"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />

        <button
          onClick={onClose}
          className={`absolute top-4 ${
            isAr ? 'left-4' : 'right-4'
          } text-gray-400 hover:text-soft-charcoal p-2 rounded-full bg-gray-100 border border-brand-gold/20`}
        >
          ✕
        </button>

        {/* Item Header */}
        <div className="mb-4">
          {/* Badge */}
          {(lang === 'AR' ? item.badgeAr : lang === 'IT' ? (item.badgeIt || item.badgeEn) : lang === 'RU' ? (item.badgeRu || item.badgeEn) : item.badgeEn) && (
            <span className="inline-block bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-xs px-3 py-1 rounded-full font-bold mb-2">
              {lang === 'AR' ? item.badgeAr : lang === 'IT' ? (item.badgeIt || item.badgeEn) : lang === 'RU' ? (item.badgeRu || item.badgeEn) : item.badgeEn}
            </span>
          )}
          {/* Primary name in selected language */}
          <h2 className="text-2xl font-heading font-bold text-soft-charcoal">
            {lang === 'AR' ? item.nameAr
              : lang === 'IT' ? (item.nameIt || item.nameEn)
              : lang === 'RU' ? (item.nameRu || item.nameEn)
              : item.nameEn}
          </h2>
          {/* Subtitle: Arabic for EN, English for everything else */}
          <h3 className="text-sm font-body text-gray-500">
            {lang === 'AR' ? item.nameEn
              : lang === 'EN' ? item.nameAr
              : item.nameEn}
          </h3>
          {/* Description in selected language */}
          <p className="text-gray-600 text-sm mt-2">
            {lang === 'AR' ? item.descriptionAr
              : lang === 'IT' ? (item.descriptionIt || item.descriptionEn)
              : lang === 'RU' ? (item.descriptionRu || item.descriptionEn)
              : item.descriptionEn}
          </p>
        </div>

        {/* Add-ons Selection */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-heading font-bold text-soft-charcoal mb-3 text-sm">
            {tr.addOns}
          </h4>
          <div className="space-y-3">
            {mockAddons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-brand-gold/10 border-brand-gold text-soft-charcoal shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 accent-brand-gold rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {lang === 'AR' ? addon.nameAr : addon.nameEn}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-gold text-sm">
                    +{addon.price} {tr.currency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
          <span className="text-sm font-bold text-gray-700">
            {tr.quantity}
          </span>
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-full px-4 py-1.5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-brand-gold font-bold text-lg px-2 hover:opacity-80"
            >
              -
            </button>
            <span className="font-bold text-soft-charcoal min-w-[20px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-brand-gold font-bold text-lg px-2 hover:opacity-80"
            >
              +
            </button>
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 block">
              {tr.itemTotal}
            </span>
            <span className="text-2xl font-bold text-brand-gold">
              {calculateGrandTotal()} {tr.currency}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-brand-gold/20 hover:opacity-90 transition active:scale-95"
          >
            {tr.addToBill}
          </button>
        </div>
      </div>
    </div>
  );
}
