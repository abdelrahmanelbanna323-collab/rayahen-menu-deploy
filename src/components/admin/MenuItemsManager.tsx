"use client";
import React, { useState, useRef } from 'react';
import { useMenuStore } from '@/store/useMenuStore';
import { MenuItem, AVAILABLE_BRANCHES } from '@/types';
import { optimizeImage } from '@/lib/imageOptimizer';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

export default function MenuItemsManager() {
  const menuItems = useMenuStore((state) => state.menuItems);
  const categories = useMenuStore((state) => state.categories);
  const addMenuItem = useMenuStore((state) => state.addMenuItem);
  const updateMenuItem = useMenuStore((state) => state.updateMenuItem);
  const deleteMenuItem = useMenuStore((state) => state.deleteMenuItem);
  const reorderMenuItems = useMenuStore((state) => state.reorderMenuItems);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // ─── Admin Branch Filter ────────────────────────────────────────────────
  const adminBranch = useMenuStore((state) => state.adminBranch);
  const setAdminBranch = useMenuStore((state) => state.setAdminBranch);

  // ─── Category Filter ───────────────────────────────────────────────────
  const [filterCat, setFilterCat] = useState<string>('All');

  // ─── Drag & Drop State ─────────────────────────────────────────────────
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ─── Form State ────────────────────────────────────────────────────────
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameIt, setNameIt] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [descriptionIt, setDescriptionIt] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [badgeIt, setBadgeIt] = useState('');
  const [badgeRu, setBadgeRu] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [price, setPrice] = useState('');
  const [categoryEn, setCategoryEn] = useState('Coffee Drinks');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [badgeAr, setBadgeAr] = useState('');
  const [badgeEn, setBadgeEn] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [isActiveOverride, setIsActiveOverride] = useState<boolean>(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  
  const handleAutoTranslate = async () => {
    if (!nameAr) return;
    setIsTranslating(true);
    try {
      const textsToTranslate = [nameAr, descriptionAr || ' ', badgeAr || ' '].join(' ||| ');
      
      const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataEn = await resEn.json();
      const partsEn = dataEn[0]?.map((x: any) => x[0]).join('').split(' ||| ');
      
      const resIt = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=it&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataIt = await resIt.json();
      const partsIt = dataIt[0]?.map((x: any) => x[0]).join('').split(' ||| ');
      
      const resRu = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ru&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataRu = await resRu.json();
      const partsRu = dataRu[0]?.map((x: any) => x[0]).join('').split(' ||| ');

      setNameEn(partsEn?.[0]?.trim() || nameEn);
      setDescriptionEn(partsEn?.[1]?.trim() || descriptionEn);
      setBadgeEn(partsEn?.[2]?.trim() || badgeEn);
      
      setNameIt(partsIt?.[0]?.trim() || nameIt);
      setDescriptionIt(partsIt?.[1]?.trim() || descriptionIt);
      setBadgeIt(partsIt?.[2]?.trim() || badgeIt);
      
      setNameRu(partsRu?.[0]?.trim() || nameRu);
      setDescriptionRu(partsRu?.[1]?.trim() || descriptionRu);
      setBadgeRu(partsRu?.[2]?.trim() || badgeRu);
    } catch (e) {
      console.error('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setNameIt('');
    setNameRu('');
    setDescriptionIt('');
    setDescriptionRu('');
    setBadgeIt('');
    setBadgeRu('');
    setPrice('');
    setCategoryEn('Coffee Drinks');
    setDescriptionAr('');
    setDescriptionEn('');
    setBadgeAr('');
    setBadgeEn('');
    setImagePreview('');
    setSelectedBranches([]);
    setIsActiveOverride(true);
    setEditingItemId(null);
    setIsUploadingImage(false);
    setUploadError(null);
  };

  // ─── Image Helpers ─────────────────────────────────────────────────────


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview INSTANTLY
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const optimizedBlob = await optimizeImage(file);
      
      const downloadUrl = await uploadToCloudinary(optimizedBlob);
      
      URL.revokeObjectURL(localUrl);
      setImagePreview(downloadUrl);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError('فشل رفع الصورة، يرجى المحاولة مرة أخرى.');
      setImagePreview(''); 
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ─── Save / Edit ───────────────────────────────────────────────────────
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !price) return;

    const matchedCat = categories.find((c) => c.id === categoryEn);
    const categoryAr = matchedCat ? matchedCat.nameAr : 'مشروبات القهوة';

    if (editingItemId) {
      if (adminBranch !== 'all') {
        const itemToUpdate = menuItems.find(i => i.id === editingItemId);
        const currentOverrides = itemToUpdate?.branchOverrides || {};
        updateMenuItem(editingItemId, {
          branchOverrides: {
            ...currentOverrides,
            [adminBranch]: {
              price: Number(price),
              isActive: isActiveOverride
            }
          }
        });
      } else {
        updateMenuItem(editingItemId, {
          nameAr,
          nameEn: nameEn || nameAr,
              nameIt: nameIt || undefined,
              nameRu: nameRu || undefined,
          price: Number(price),
          categoryEn,
          categoryAr,
          descriptionAr,
          descriptionEn: descriptionEn || descriptionAr,
              descriptionIt: descriptionIt || undefined,
              descriptionRu: descriptionRu || undefined,
          badgeAr: badgeAr || '',
          badgeEn: badgeEn || '',
          imageUrl: imagePreview || undefined,
          branches: selectedBranches.length > 0 ? selectedBranches : undefined,
          isActive: isActiveOverride
        });
      }
    } else {
      let isGloballyActive = true;
      let branchOverrides = undefined;

      if (adminBranch !== 'all') {
        isGloballyActive = false;
        branchOverrides = {
          [adminBranch]: {
            isActive: true,
            nameAr,
            nameEn: nameEn || nameAr,
              nameIt: nameIt || undefined,
              nameRu: nameRu || undefined,
            descriptionAr,
            descriptionEn: descriptionEn || descriptionAr,
              descriptionIt: descriptionIt || undefined,
              descriptionRu: descriptionRu || undefined,
            price: Number(price),
            badgeAr: badgeAr || '',
            badgeEn: badgeEn || '',
            imageUrl: imagePreview || undefined,
          }
        };
      }

      const newItem: MenuItem = {
        id: Date.now().toString(),
        nameAr,
        nameEn: nameEn || nameAr,
              nameIt: nameIt || undefined,
              nameRu: nameRu || undefined,
        price: Number(price),
        categoryEn,
        categoryAr,
        descriptionAr,
        descriptionEn: descriptionEn || descriptionAr,
              descriptionIt: descriptionIt || undefined,
              descriptionRu: descriptionRu || undefined,
        badgeAr: badgeAr || '',
        badgeEn: badgeEn || '',
        imageUrl: imagePreview || undefined,
        branches: selectedBranches.length > 0 ? selectedBranches : undefined,
        isActive: isGloballyActive,
        branchOverrides
      };
      addMenuItem(newItem);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItemId(item.id);
    setNameAr(item.nameAr);
    setNameEn(item.nameEn);
    setNameIt(item.nameIt || '');
    setNameRu(item.nameRu || '');
    setPrice(item.price.toString());
    setCategoryEn(item.categoryEn);
    setDescriptionAr(item.descriptionAr);
    setDescriptionEn(item.descriptionEn);
    setDescriptionIt(item.descriptionIt || '');
    setDescriptionRu(item.descriptionRu || '');
    setBadgeAr(item.badgeAr || '');
    setBadgeEn(item.badgeEn || '');
    setBadgeIt(item.badgeIt || '');
    setBadgeRu(item.badgeRu || '');
    setImagePreview(item.imageUrl || '');
    setSelectedBranches(item.branches || []);

    if (adminBranch !== 'all') {
      const override = item.branchOverrides?.[adminBranch];
      setPrice((override?.price ?? item.price).toString());
      setIsActiveOverride(override?.isActive ?? (item.isActive !== false));
    } else {
      setPrice(item.price.toString());
      setIsActiveOverride(item.isActive !== false);
    }
    
    setIsModalOpen(true);
  };

  // ─── Filtered & displayed items ────────────────────────────────────────
  let filteredByBranch = menuItems;
  if (adminBranch !== 'all') {
    filteredByBranch = menuItems.filter(item => 
      !item.branches || item.branches.length === 0 || item.branches.includes(adminBranch)
    );
  }

  const displayedItems =
    filterCat === 'All' ? filteredByBranch : filteredByBranch.filter((it) => it.categoryEn === filterCat);

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragItemIndex.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number, id: string) => {
    dragOverItemIndex.current = index;
    setDragOverId(id);
  };

  const handleDragEnd = () => {
    const from = dragItemIndex.current;
    const to = dragOverItemIndex.current;

    if (from === null || to === null || from === to) {
      dragItemIndex.current = null;
      dragOverItemIndex.current = null;
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    // We reorder within the FULL menuItems array preserving items outside the filter
    const draggedItem = displayedItems[from];

    if (filterCat === 'All') {
      // Simple full-list reorder
      const newList = [...menuItems];
      newList.splice(from, 1);
      newList.splice(to, 0, draggedItem);
      reorderMenuItems(newList);
    } else {
      // Reorder only within the filtered subset, then rebuild full list
      const newDisplayed = [...displayedItems];
      newDisplayed.splice(from, 1);
      newDisplayed.splice(to, 0, draggedItem);

      // Replace items of this category in the full list keeping their original positions
      const otherItems = menuItems.filter((it) => it.categoryEn !== filterCat);
      // Find first index of this category in original list
      const firstCatIdx = menuItems.findIndex((it) => it.categoryEn === filterCat);
      const newFull = [...otherItems];
      newDisplayed.forEach((item, i) => {
        newFull.splice(firstCatIdx + i, 0, item);
      });
      reorderMenuItems(newFull);
    }

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };

  // ─── Unique category list for filter tabs ─────────────────────────────
  const availableCats = [
    { id: 'All', nameAr: 'الكل', nameEn: 'All' },
    ...categories.filter((c) => c.id !== 'All' && menuItems.some((it) => it.categoryEn === c.id)),
  ];

  return (
    <div className="bg-white border border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-pearl-white/50">
        <div>
          <h4 className="text-lg font-bold text-soft-charcoal">Menu Items Management / إدارة أصناف المنيو</h4>
          <p className="text-sm text-gray-500">اسحب الصنف لتغيير ترتيبه · اختر القسم للفلتر</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 hover:opacity-90 active:scale-95 text-sm whitespace-nowrap"
          >
            + Add New Item / إضافة صنف
          </button>
        </div>
      </div>

      {/* ── Category Filter Tabs (Smooth horizontal scrolling on mobile, clean wrapping on desktop) ── */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 bg-gray-50/60 md:flex-wrap">
        {availableCats.map((cat) => {
          const count = menuItems.filter((it) => cat.id === 'All' ? true : it.categoryEn === cat.id).length;
          const isSelected = filterCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shrink-0 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-gold to-brand-gold-light text-white border-brand-gold shadow-md shadow-brand-gold/25'
                  : 'bg-white text-soft-charcoal border-gray-200/80 hover:border-brand-gold/60 hover:text-brand-gold shadow-2xs'
              }`}
            >
              <span>{cat.nameAr}</span>
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Drag hint ── */}
      <div className="px-5 pt-3 pb-1 flex items-center gap-2 text-xs text-gray-400">
        <span className="text-base">⠿</span>
        <span>اسحب الصفوف لتغيير الترتيب — يُحفظ تلقائياً</span>
      </div>

      {/* ── Items Table (Desktop View) ── */}
      <div className="p-0 overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-8"></th>
              <th className="p-4 font-semibold">Item Name / اسم الصنف</th>
              <th className="p-4 font-semibold">Category / القسم</th>
              <th className="p-4 font-semibold">Price / السعر</th>
              <th className="p-4 font-semibold">Badge / الشارة</th>
              <th className="p-4 font-semibold text-center">Status / الحالة</th>
              <th className="p-4 font-semibold text-right">Actions / إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {displayedItems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                  لا توجد أصناف في هذا القسم
                </td>
              </tr>
            )}
            {displayedItems.map((item, index) => (
              <tr
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index, item.id)}
                onDragEnter={() => handleDragEnter(index, item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-150 ${
                  draggingId === item.id
                    ? 'opacity-40 bg-brand-gold/5'
                    : dragOverId === item.id && draggingId !== item.id
                    ? 'border-t-2 border-brand-gold bg-amber-50/40'
                    : 'hover:bg-gray-50/60'
                }`}
              >
                {/* Drag Handle */}
                <td className="p-4 cursor-grab active:cursor-grabbing select-none text-gray-300 hover:text-brand-gold text-lg text-center" title="اسحب لتغيير الترتيب">
                  ⠿
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.nameAr}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-bold text-soft-charcoal">{item.nameAr}</p>
                      <p className="text-xs text-gray-400">{item.nameEn}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2.5 py-1 rounded-full text-xs font-bold">
                    {item.categoryAr}
                  </span>
                </td>

                <td className="p-4">
                  {(() => {
                    const effectivePrice = adminBranch !== 'all' ? (item.branchOverrides?.[adminBranch]?.price ?? item.price) : item.price;
                    const effectiveActive = adminBranch !== 'all' ? (item.branchOverrides?.[adminBranch]?.isActive ?? (item.isActive !== false)) : (item.isActive !== false);
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={effectivePrice}
                            onChange={(e) => {
                              if (adminBranch === 'all') {
                                updateMenuItem(item.id, { price: Number(e.target.value) });
                              } else {
                                updateMenuItem(item.id, {
                                  branchOverrides: {
                                    ...(item.branchOverrides || {}),
                                    [adminBranch]: {
                                      ...(item.branchOverrides?.[adminBranch] || {}),
                                      price: Number(e.target.value)
                                    }
                                  }
                                });
                              }
                            }}
                            className="w-20 bg-pearl-white border border-brand-gold/30 rounded-lg p-1.5 font-bold text-brand-gold text-center focus:outline-none focus:border-brand-gold"
                          />
                          <span className="text-xs text-gray-500 ml-1">ج.م</span>
                        </div>
                        {!effectiveActive && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 self-start">مخفي</span>}
                      </div>
                    );
                  })()}
                </td>

                <td className="p-4">
                  {item.badgeAr ? (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {item.badgeAr}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                <td className="p-4 text-center">
                  {(() => {
                    const effectiveActive = adminBranch !== 'all' ? (item.branchOverrides?.[adminBranch]?.isActive ?? (item.isActive !== false)) : (item.isActive !== false);
                    return (
                      <button
                        onClick={() => {
                          if (adminBranch === 'all') {
                            updateMenuItem(item.id, { isActive: !effectiveActive });
                          } else {
                            updateMenuItem(item.id, {
                              branchOverrides: {
                                ...(item.branchOverrides || {}),
                                [adminBranch]: {
                                  ...(item.branchOverrides?.[adminBranch] || {}),
                                  isActive: !effectiveActive
                                }
                              }
                            });
                          }
                        }}
                        className={`flex items-center w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shadow-inner mx-auto ${
                          effectiveActive ? 'bg-brand-gold justify-end' : 'bg-gray-200 justify-start'
                        }`}
                        title={effectiveActive ? 'نشط (اضغط للإخفاء)' : 'مخفي (اضغط للتنشيط)'}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200" />
                      </button>
                    );
                  })()}
                </td>

                <td className="p-4 text-right space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-brand-gold hover:underline font-bold text-xs"
                  >
                    Edit / تعديل
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="text-red-500 hover:underline font-bold text-xs"
                  >
                    Delete / حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Items Cards (Mobile View - Perfectly proportioned, zero truncation, zero horizontal scroll!) ── */}
      <div className="block md:hidden p-3 space-y-3.5 bg-gray-50/70">
        {displayedItems.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200 shadow-2xs">
            لا توجد أصناف في هذا القسم
          </div>
        )}
        {displayedItems.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index, item.id)}
            onDragEnter={() => handleDragEnter(index, item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm transition-all duration-150 flex flex-col gap-3.5 ${
              draggingId === item.id
                ? 'opacity-40 bg-brand-gold/5 border-dashed border-brand-gold'
                : dragOverId === item.id && draggingId !== item.id
                ? 'border-2 border-brand-gold bg-amber-50/40'
                : ''
            }`}
          >
            {/* Row 1: Drag handle + Thumbnail + Price Badge (Spaced cleanly) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="cursor-grab active:cursor-grabbing select-none text-gray-300 hover:text-brand-gold text-2xl px-1 py-1 flex items-center justify-center shrink-0 transition-colors"
                  title="اسحب لتغيير الترتيب"
                >
                  ⠿
                </span>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.nameAr} className="w-14 h-14 rounded-xl object-cover border border-brand-gold/20 shrink-0 shadow-2xs" />
                ) : (
                  <div className="w-14 h-14 bg-amber-50/80 rounded-xl flex items-center justify-center text-lg text-amber-700 font-bold shrink-0 border border-amber-200/50">☕</div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {(() => {
                  const effectiveActive = adminBranch !== 'all' ? (item.branchOverrides?.[adminBranch]?.isActive ?? (item.isActive !== false)) : (item.isActive !== false);
                  return (
                    <button
                      onClick={() => {
                        if (adminBranch === 'all') {
                          updateMenuItem(item.id, { isActive: !effectiveActive });
                        } else {
                          updateMenuItem(item.id, {
                            branchOverrides: {
                              ...(item.branchOverrides || {}),
                              [adminBranch]: {
                                ...(item.branchOverrides?.[adminBranch] || {}),
                                isActive: !effectiveActive
                              }
                            }
                          });
                        }
                      }}
                      className={`flex items-center w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shadow-inner ${
                        effectiveActive ? 'bg-brand-gold justify-end' : 'bg-gray-200 justify-start'
                      }`}
                      title={effectiveActive ? 'نشط (اضغط للإخفاء)' : 'مخفي (اضغط للتنشيط)'}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                    </button>
                  );
                })()}
                <div className="shrink-0 bg-gradient-to-br from-pearl-white to-amber-50/50 px-3 py-1.5 rounded-xl border border-brand-gold/30 shadow-2xs text-center min-w-[70px] relative">
                {adminBranch !== 'all' && (item.branchOverrides?.[adminBranch]?.isActive === false) && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">مخفي</span>
                )}
                <span className="font-heading font-extrabold text-brand-gold text-base block leading-tight">
                  {adminBranch !== 'all' ? (item.branchOverrides?.[adminBranch]?.price ?? item.price) : item.price}
                </span>
                <span className="text-[10px] text-gray-500 font-bold block">جنيه مصري</span>
              </div>
              </div>
            </div>

            {/* Row 2: Full Item Names (Arabic & English) - Zero Truncation, Multi-line wrapping! */}
            <div className="w-full space-y-1">
              <h4 className="font-bold text-soft-charcoal text-base leading-snug break-words">
                {item.nameAr}
              </h4>
              {item.nameEn && (
                <p className="text-xs text-gray-400 font-medium leading-normal break-words">
                  {item.nameEn}
                </p>
              )}
            </div>

            {/* Row 3: Category & Badge Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-2xs">
                <span>📁</span>
                <span>{item.categoryAr}</span>
              </span>
              {item.badgeAr && (
                <span className="bg-amber-100/80 text-amber-900 border border-amber-300/60 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-2xs">
                  <span>🏷️</span>
                  <span>{item.badgeAr}</span>
                </span>
              )}
            </div>

            {/* Row 4: Actions Bar (Edit & Delete) */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleEditClick(item)}
                className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <span>✏️</span>
                <span>تعديل الصنف</span>
              </button>
              <button
                type="button"
                onClick={() => deleteMenuItem(item.id)}
                className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <span>🗑️</span>
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add / Edit Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-pearl-white border border-brand-gold/30 p-6 rounded-2xl w-full max-w-lg shadow-2xl text-soft-charcoal max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-gold mb-1">
              {editingItemId ? 'Edit Menu Item / تعديل صنف' : 'Add New Menu Item / إضافة صنف جديد'}
            </h3>
            {adminBranch !== 'all' && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-lg font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>أنت تقوم بتعديل هذا الصنف في فرع ({AVAILABLE_BRANCHES.find(b=>b.id===adminBranch)?.name}) فقط. الإسم والصورة ثابتان لجميع الفروع، التعديل هنا يخص السعر وحالة الإظهار فقط.</span>
              </div>
            )}

            <div className="space-y-4 mb-6">

              {adminBranch === 'all' && (
                <>
                  {/* File Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">اختر صورة الصنف من جهازك (Direct Image Upload)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-soft-charcoal text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-gold file:text-white hover:file:opacity-90 cursor-pointer disabled:opacity-50"
                    />

                    {isUploadingImage && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-brand-gold font-bold animate-pulse">
                        <span>⏳ جاري رفع ومعالجة صورة الصنف بجودة عالية... (Please wait)</span>
                      </div>
                    )}
                    {uploadError && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                        ⚠️ {uploadError}
                      </div>
                    )}

                    {imagePreview && (
                      <div className="mt-3 relative w-full max-h-48 rounded-xl overflow-hidden border border-brand-gold/30 bg-gray-50/50 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-48 object-contain mx-auto" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(''); setUploadError(null); }}
                          className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold z-10"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">اسم الصنف (بالعربي)</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: سبانش لاتيه بارد"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Item Name (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Iced Spanish Latte"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                      />
                    </div>
                  </div>

                  {/* Auto Translate Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAutoTranslate}
                      disabled={!nameAr || isTranslating}
                      className="flex items-center gap-2 bg-gradient-to-r from-brand-gold to-amber-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
                    >
                      {isTranslating ? (
                        <><span className="animate-spin">⏳</span><span>جاري الترجمة...</span></>
                      ) : (
                        <><span>✨</span><span>ترجمة تلقائية (إيطالي + روسي + إنجليزي)</span></>
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 125"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">القسم / Category</label>
                  <select
                    value={categoryEn}
                    onChange={(e) => setCategoryEn(e.target.value)}
                    disabled={adminBranch !== 'all'}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    {categories.filter((c) => c.id !== 'All').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nameAr} – {cat.nameEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-4 py-2.5 rounded-xl flex-1 text-sm font-bold text-soft-charcoal">
                  <input
                    type="checkbox"
                    checked={isActiveOverride}
                    onChange={(e) => setIsActiveOverride(e.target.checked)}
                    className="w-4 h-4 text-brand-gold rounded border-gray-300 focus:ring-brand-gold"
                  />
                  <span>عرض هذا الصنف (نشط)</span>
                </label>
              </div>

              {adminBranch === 'all' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">وصف الصنف (عربي)</label>
                    <textarea
                      rows={2}
                      placeholder="مثال: اسبريسو بارد مع الحليب المحلى والثلج"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Item Description (English)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Chilled espresso with sweetened milk"
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">شارات خاصة (عربي)</label>
                      <input
                        type="text"
                        placeholder="مثال: صباحي فقط / جديد"
                        value={badgeAr}
                        onChange={(e) => setBadgeAr(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Badge (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Morning Only"
                        value={badgeEn}
                        onChange={(e) => setBadgeEn(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                      />
                    </div>
                  </div>

                  {/* Additional Languages - IT & RU */}
                  <details className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <summary className="font-bold text-amber-800 cursor-pointer outline-none text-sm flex items-center gap-2">
                      <span>🌍</span>
                      <span>اللغات الإضافية (إيطالي وروسي) — تلقائي أو يدوي</span>
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">الاسم (إيطالي)</label>
                        <input
                          type="text"
                          value={nameIt}
                          onChange={(e) => setNameIt(e.target.value)}
                          placeholder="Nome (Italiano)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">الاسم (روسي)</label>
                        <input
                          type="text"
                          value={nameRu}
                          onChange={(e) => setNameRu(e.target.value)}
                          placeholder="Название (Русский)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">نص الشارة (إيطالي)</label>
                        <input
                          type="text"
                          value={badgeIt}
                          onChange={(e) => setBadgeIt(e.target.value)}
                          placeholder="Badge (IT)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">نص الشارة (روسي)</label>
                        <input
                          type="text"
                          value={badgeRu}
                          onChange={(e) => setBadgeRu(e.target.value)}
                          placeholder="Badge (RU)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">الوصف (إيطالي)</label>
                        <textarea
                          rows={2}
                          value={descriptionIt}
                          onChange={(e) => setDescriptionIt(e.target.value)}
                          placeholder="Descrizione (Italiano)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm resize-none"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">الوصف (روسي)</label>
                        <textarea
                          rows={2}
                          value={descriptionRu}
                          onChange={(e) => setDescriptionRu(e.target.value)}
                          placeholder="Описание (Русский)"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm resize-none"
                        />
                      </div>
                    </div>
                  </details>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-2">الفروع التي يعرض فيها الصنف (اتركه فارغاً لعرضه في جميع الفروع)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_BRANCHES.map(b => (
                        <label key={b.id} className="flex items-center gap-2 text-sm text-soft-charcoal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(b.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedBranches([...selectedBranches, b.id]);
                              else setSelectedBranches(selectedBranches.filter(id => id !== b.id));
                            }}
                            className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold w-4 h-4"
                          />
                          {b.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 transition text-sm"
              >
                Cancel / إلغاء
              </button>
              <button
                type="submit"
                disabled={isUploadingImage}
                className={`bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 text-sm ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploadingImage ? 'جاري الرفع... / Uploading...' : editingItemId ? 'Save Changes / حفظ التعديلات' : 'Save Item / حفظ الصنف'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
