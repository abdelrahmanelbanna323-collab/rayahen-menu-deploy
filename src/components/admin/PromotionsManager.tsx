"use client";
import React, { useState, useRef } from 'react';
import { useMenuStore, PromotionItem } from '@/store/useMenuStore';
import { optimizeImage } from '@/lib/imageOptimizer';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

export default function PromotionsManager() {
  const adminBranch = useMenuStore((state) => state.adminBranch);
  const promotions = useMenuStore((state) => state.promotions);
  const addPromotion = useMenuStore((state) => state.addPromotion);
  const updatePromotion = useMenuStore((state) => state.updatePromotion);
  const togglePromotion = useMenuStore((state) => state.togglePromotion);
  const deletePromotion = useMenuStore((state) => state.deletePromotion);
  const reorderPromotions = useMenuStore((state) => state.reorderPromotions);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Drag and drop state
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleIt, setTitleIt] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [subtitleIt, setSubtitleIt] = useState('');
  const [subtitleRu, setSubtitleRu] = useState('');
  const [badgeIt, setBadgeIt] = useState('');
  const [badgeRu, setBadgeRu] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [subtitleAr, setSubtitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [badgeAr, setBadgeAr] = useState('عرض خاص');
  const [badgeEn, setBadgeEn] = useState('SPECIAL DEAL');

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  
  const handleAutoTranslate = async () => {
    if (!titleAr) return;
    setIsTranslating(true);
    try {
      const textsToTranslate = [titleAr, subtitleAr || ' ', badgeAr || ' '].join(' ||| ');
      
      const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataEn = await resEn.json();
      const partsEn = dataEn[0]?.map((x: any) => x[0]).join('').split(' ||| ');
      
      const resIt = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=it&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataIt = await resIt.json();
      const partsIt = dataIt[0]?.map((x: any) => x[0]).join('').split(' ||| ');
      
      const resRu = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ru&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
      const dataRu = await resRu.json();
      const partsRu = dataRu[0]?.map((x: any) => x[0]).join('').split(' ||| ');

      setTitleEn(partsEn?.[0]?.trim() || titleEn);
      setSubtitleEn(partsEn?.[1]?.trim() || subtitleEn);
      setBadgeEn(partsEn?.[2]?.trim() || badgeEn);
      
      setTitleIt(partsIt?.[0]?.trim() || titleIt);
      setSubtitleIt(partsIt?.[1]?.trim() || subtitleIt);
      setBadgeIt(partsIt?.[2]?.trim() || badgeIt);
      
      setTitleRu(partsRu?.[0]?.trim() || titleRu);
      setSubtitleRu(partsRu?.[1]?.trim() || subtitleRu);
      setBadgeRu(partsRu?.[2]?.trim() || badgeRu);
    } catch (e) {
      console.error('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const resetForm = () => {
    setTitleAr('');
    setTitleEn('');
    setTitleIt('');
    setTitleRu('');
    setSubtitleAr('');
    setSubtitleEn('');
    setSubtitleIt('');
    setSubtitleRu('');
    setBadgeAr('عرض خاص');
    setBadgeEn('SPECIAL DEAL');
    setBadgeIt('');
    setBadgeRu('');
    setImagePreview('');
    setUploadError(null);
    setEditingPromoId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setUploadError('فشل رفع الصورة على Cloudinary، يرجى المحاولة مرة أخرى.');
      setImagePreview(''); 
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr || !titleEn) return;

    if (editingPromoId) {
      if (adminBranch !== 'all') {
        // Save as branch-specific override only
        const promo = promotions.find(p => p.id === editingPromoId);
        updatePromotion(editingPromoId, {
          branchOverrides: {
            ...(promo?.branchOverrides || {}),
            [adminBranch]: {
              ...(promo?.branchOverrides?.[adminBranch] || {}),
              titleAr,
              titleEn,
              subtitleAr,
              subtitleEn,
              badgeAr,
              badgeEn,
              imageUrl: imagePreview || undefined,
            },
          },
        });
      } else {
        // Save to base record (affects all branches)
        updatePromotion(editingPromoId, {
          titleAr,
          titleEn,
          subtitleAr,
          subtitleEn,
          badgeAr,
          badgeEn,
          imageUrl: imagePreview || undefined,
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
            titleAr,
            titleEn,
            subtitleAr: subtitleAr || 'عرض خاص من رياحين الإسكندرية!',
            subtitleEn: subtitleEn || 'Special offer from Rayahen!',
            badgeAr: badgeAr || 'عرض',
            badgeEn: badgeEn || 'PROMO',
            imageUrl: imagePreview || undefined,
          }
        };
      }

      const newPromo: PromotionItem = {
        id: Date.now().toString(),
        titleEn,
        titleAr,
        subtitleEn: subtitleEn || 'Special offer from Rayahen!',
        subtitleAr: subtitleAr || 'عرض خاص من رياحين الإسكندرية!',
        badgeEn: badgeEn || 'PROMO',
        badgeAr: badgeAr || 'عرض',
        ctaEn: 'View Deal',
        ctaAr: 'استعرض العرض',
        gradient: 'from-brand-gold to-brand-gold-light text-white',
        imageUrl: imagePreview || undefined,
        isActive: isGloballyActive,
        branchOverrides
      };
      addPromotion(newPromo);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (promo: PromotionItem) => {
    setEditingPromoId(promo.id);
    // Load branch-specific values if a branch is selected, otherwise load base values
    const branchData = adminBranch !== 'all' ? promo.branchOverrides?.[adminBranch] : undefined;
    setTitleAr(branchData?.titleAr ?? promo.titleAr);
    setTitleEn(branchData?.titleEn ?? promo.titleEn);
    setSubtitleAr(branchData?.subtitleAr ?? promo.subtitleAr);
    setSubtitleEn(branchData?.subtitleEn ?? promo.subtitleEn);
    setBadgeAr(branchData?.badgeAr ?? promo.badgeAr);
    setBadgeEn(branchData?.badgeEn ?? promo.badgeEn);
    setImagePreview(branchData?.imageUrl ?? promo.imageUrl ?? '');
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragItemIndex.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.4';
      }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent, index: number, id: string) => {
    e.preventDefault();
    if (dragItemIndex.current !== null && dragItemIndex.current !== index) {
      dragOverItemIndex.current = index;
      setDragOverId(id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }

    if (dragItemIndex.current !== null && dragOverItemIndex.current !== null && dragItemIndex.current !== dragOverItemIndex.current) {
      const newItems = [...promotions];
      const draggedItem = newItems[dragItemIndex.current];
      newItems.splice(dragItemIndex.current, 1);
      newItems.splice(dragOverItemIndex.current, 0, draggedItem);
      reorderPromotions(newItems);
    }

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    setDraggingId(null);
    setDragOverId(null);
  };


  return (
    <div className="bg-white border border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-pearl-white/50">
        <div>
          <h4 className="text-lg font-bold text-soft-charcoal">Active Deals & Combos / إدارة العروض الخاصة</h4>
          <p className="text-sm text-gray-500">Offers created here appear instantly on the top guest menu carousel.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 hover:opacity-90 active:scale-95 text-sm"
        >
          + Create Promotion / إضافة عرض
        </button>
      </div>

      <div className="p-0 overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4 font-semibold">Title / عنوان العرض</th>
              <th className="p-4 font-semibold">Subtitle / التفاصيل</th>
              <th className="p-4 font-semibold">Active Status / الحالة</th>
              <th className="p-4 font-semibold text-right">Actions / إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.map((promo, index) => (
              <tr 
                key={promo.id} 
                className={`hover:bg-gray-50/60 transition text-sm ${draggingId === promo.id ? 'opacity-50 bg-gray-100' : ''} ${dragOverId === promo.id ? 'border-t-2 border-brand-gold bg-brand-gold/5' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index, promo.id)}
                onDragEnter={(e) => handleDragEnter(e, index, promo.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <td className="p-4 text-gray-400 cursor-move">
                  ☰
                </td>
                <td className="p-4">
                  <p className="font-bold text-soft-charcoal">{promo.titleAr}</p>
                  <p className="text-xs text-gray-400">{promo.titleEn}</p>
                </td>
                <td className="p-4 text-gray-600 text-xs max-w-xs truncate">
                  {promo.subtitleAr}
                </td>
                <td className="p-4">
                  {(() => {
                    const effectiveActive = adminBranch !== 'all' ? (promo.branchOverrides?.[adminBranch]?.isActive ?? (promo.isActive !== false)) : (promo.isActive !== false);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (adminBranch === 'all') {
                            togglePromotion(promo.id);
                          } else {
                            updatePromotion(promo.id, {
                              branchOverrides: {
                                ...(promo.branchOverrides || {}),
                                [adminBranch]: {
                                  ...(promo.branchOverrides?.[adminBranch] || {}),
                                  isActive: !effectiveActive
                                }
                              }
                            });
                          }
                        }}
                        className={`flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shadow-inner border mx-auto ${
                          effectiveActive ? 'bg-brand-gold border-brand-gold justify-end' : 'bg-gray-200 border-gray-300 justify-start'
                        }`}
                        title={effectiveActive ? 'نشط' : 'معطل'}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200" />
                      </button>
                    );
                  })()}
                </td>
                <td className="p-4 text-right space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleEditClick(promo)}
                    className="text-brand-gold hover:underline font-bold text-xs"
                  >
                    Edit / تعديل
                  </button>
                  <button
                    onClick={() => deletePromotion(promo.id)}
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

      {/* Mobile Card List for Promotions (Spacious, Zero Horizontal Scrolling, Perfect Toggle Button!) */}
      <div className="block md:hidden p-3 space-y-3.5 bg-gray-50/70">
        {promotions.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200 shadow-2xs">
            لا توجد عروض حالياً
          </div>
        )}
        {promotions.map((promo, index) => (
          <div 
            key={promo.id} 
            className={`bg-white border ${dragOverId === promo.id ? 'border-brand-gold bg-brand-gold/5 shadow-md scale-[1.02]' : 'border-gray-200'} rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 transition-all duration-200 ${draggingId === promo.id ? 'opacity-40 scale-95' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index, promo.id)}
            onDragEnter={(e) => handleDragEnter(e, index, promo.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Row 1: Header Icon & Status Toggle Button */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 items-center justify-center py-2 px-1 text-gray-300 cursor-move active:text-brand-gold hover:text-brand-gold transition-colors touch-none">
                  <span className="text-xl">⋮⋮</span>
                </div>
                <span className="w-10 h-10 bg-brand-gold/15 text-brand-gold rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs">🏷️</span>
                <span className="font-bold text-soft-charcoal text-sm">عرض ترويجي</span>
              </div>

              {/* Status Toggle Button */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {(() => {
                  const effectiveActive = adminBranch !== 'all' ? (promo.branchOverrides?.[adminBranch]?.isActive ?? (promo.isActive !== false)) : (promo.isActive !== false);
                  return (
                    <>
                      <span className="text-[11px] text-gray-500 font-bold">
                        {effectiveActive ? '🟢 نشط ومتاح' : '⚪ معطل'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (adminBranch === 'all') {
                            togglePromotion(promo.id);
                          } else {
                            updatePromotion(promo.id, {
                              branchOverrides: {
                                ...(promo.branchOverrides || {}),
                                [adminBranch]: {
                                  ...(promo.branchOverrides?.[adminBranch] || {}),
                                  isActive: !effectiveActive
                                }
                              }
                            });
                          }
                        }}
                        className={`flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shadow-inner border ${
                          effectiveActive ? 'bg-brand-gold border-brand-gold justify-end' : 'bg-gray-200 border-gray-300 justify-start'
                        }`}
                        title={effectiveActive ? 'نشط (اضغط للإيقاف)' : 'غير نشط (اضغط للتفعيل)'}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200" />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Row 2: Full Title (Arabic & English) - Zero Truncation! */}
            <div className="w-full space-y-1">
              <h4 className="font-bold text-soft-charcoal text-base leading-snug break-words">
                {promo.titleAr}
              </h4>
              {promo.titleEn && (
                <p className="text-xs text-gray-400 font-medium leading-normal break-words">
                  {promo.titleEn}
                </p>
              )}
            </div>

            {/* Row 3: Subtitle Preview */}
            <div className="text-gray-600 text-xs bg-pearl-white/60 p-3 rounded-xl border border-gray-150 leading-relaxed break-words">
              {promo.subtitleAr}
            </div>

            {/* Row 4: Actions Bar */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleEditClick(promo)}
                className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <span>✏️</span>
                <span>تعديل العرض</span>
              </button>
              <button
                type="button"
                onClick={() => deletePromotion(promo.id)}
                className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <span>🗑️</span>
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-pearl-white border border-brand-gold/30 p-6 rounded-2xl w-full max-w-lg shadow-2xl text-soft-charcoal">
            <h3 className="text-xl font-bold text-brand-gold mb-4">
              {editingPromoId ? 'Edit Promotion / تعديل العرض' : 'Create New Promotion / إضافة عرض جديد'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">عنوان العرض (بالعربي)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كومبو النشاط الصباحي"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Combo"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">وصف العرض (بالعربي)</label>
                  <input
                    type="text"
                    placeholder="مثال: قهوة + كرواسون بـ 100 جنيه"
                    value={subtitleAr}
                    onChange={(e) => setSubtitleAr(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Subtitle (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Coffee + Croissant 100 EGP"
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">الشارة (عربي) / Badge</label>
                  <input
                    type="text"
                    value={badgeAr}
                    onChange={(e) => setBadgeAr(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Badge (English)</label>
                  <input
                    type="text"
                    value={badgeEn}
                    onChange={(e) => setBadgeEn(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">صورة العرض / Promotion Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {imagePreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-sm group bg-white">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0">
                      <span className="text-2xl text-gray-400">🖼️</span>
                    </div>
                  )}
                  <div className="flex-1 w-full relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-white border border-gray-300 rounded-xl p-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-bold truncate">
                        {isUploadingImage ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                      </span>
                      <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-lg text-xs font-bold">
                        تصفح
                      </span>
                    </div>
                  </div>
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 transition text-sm"
              >
                Cancel / إلغاء
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 text-sm"
              >
                {editingPromoId ? 'Save Changes / حفظ التعديلات' : 'Save & Activate / حفظ وتفعيل العرض'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
