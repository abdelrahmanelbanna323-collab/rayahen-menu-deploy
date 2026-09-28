"use client";
import React, { useState, useRef } from 'react';
import { useMenuStore, CategoryItem } from '@/store/useMenuStore';
import { optimizeImage } from '@/lib/imageOptimizer';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

export default function CategoriesManager() {
  const adminBranch = useMenuStore((state) => state.adminBranch);
  const categories = useMenuStore((state) => state.categories);
  const addCategory = useMenuStore((state) => state.addCategory);
  const updateCategory = useMenuStore((state) => state.updateCategory);
  const deleteCategory = useMenuStore((state) => state.deleteCategory);
  const reorderCategories = useMenuStore((state) => state.reorderCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Drag and drop state
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameIt, setNameIt] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [icon, setIcon] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  
  const handleAutoTranslate = async () => {
    if (!nameAr) return;
    setIsTranslating(true);
    try {
      const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(nameAr)}`);
      const dataEn = await resEn.json();
      
      const resIt = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=it&dt=t&q=${encodeURIComponent(nameAr)}`);
      const dataIt = await resIt.json();
      
      const resRu = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=ru&dt=t&q=${encodeURIComponent(nameAr)}`);
      const dataRu = await resRu.json();

      setNameEn(dataEn[0]?.map((x: any) => x[0]).join('') || nameEn);
      setNameIt(dataIt[0]?.map((x: any) => x[0]).join('') || nameIt);
      setNameRu(dataRu[0]?.map((x: any) => x[0]).join('') || nameRu);
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
    setIcon('');
    setImagePreview('');
    setUploadError(null);
    setEditingId(null);
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
    if (!nameAr) return;

    if (editingId) {
      if (adminBranch !== 'all') {
        const cat = categories.find(c => c.id === editingId);
        updateCategory(editingId, {
          branchOverrides: {
            ...(cat?.branchOverrides || {}),
            [adminBranch]: {
              ...(cat?.branchOverrides?.[adminBranch] || {}),
              nameAr,
              nameEn: nameEn || nameAr,
              nameIt: nameIt || undefined,
              nameRu: nameRu || undefined,
              imageUrl: imagePreview || undefined,
              icon: icon || undefined,
            }
          }
        });
      } else {
        updateCategory(editingId, {
          nameAr,
          nameEn: nameEn || nameAr,
          nameIt: nameIt || undefined,
          nameRu: nameRu || undefined,
          imageUrl: imagePreview || undefined,
          icon: icon || undefined,
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
            imageUrl: imagePreview || undefined,
            icon: icon || undefined,
          }
        };
      }

      const newCat: CategoryItem = {
        id: nameEn || nameAr,
        nameAr,
        nameEn: nameEn || nameAr,
              nameIt: nameIt || undefined,
              nameRu: nameRu || undefined,
        imageUrl: imagePreview || undefined,
        icon: icon || undefined,
        isActive: isGloballyActive,
        branchOverrides
      };
      addCategory(newCat);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    
    if (adminBranch !== 'all') {
      const override = cat.branchOverrides?.[adminBranch];
      setNameAr(override?.nameAr ?? cat.nameAr);
      setNameEn(override?.nameEn ?? cat.nameEn);
      setImagePreview(override?.imageUrl ?? cat.imageUrl ?? '');
      setIcon(override?.icon ?? cat.icon ?? '');
    } else {
      setNameAr(cat.nameAr);
      setNameEn(cat.nameEn);
    setNameIt(cat.nameIt || '');
    setNameRu(cat.nameRu || '');
      setImagePreview(cat.imageUrl ?? '');
      setIcon(cat.icon ?? '');
    }
    
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragItemIndex.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be generated before styling the original element
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
      const newItems = [...categories];
      const draggedItem = newItems[dragItemIndex.current];
      newItems.splice(dragItemIndex.current, 1);
      newItems.splice(dragOverItemIndex.current, 0, draggedItem);
      reorderCategories(newItems);
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
          <h4 className="text-lg font-bold text-soft-charcoal">Categories Manager / إدارة أقسام المنيو</h4>
          <p className="text-sm text-gray-500">Create, edit, or remove menu categories (e.g. Breakfast, Coffee, Smoothies).</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 hover:opacity-90 active:scale-95 text-sm"
        >
          + Add New Category / إضافة قسم جديد
        </button>
      </div>

      <div className="p-0 overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4 font-semibold">Category Name (Arabic) / اسم القسم</th>
              <th className="p-4 font-semibold">Category Name (English) / بالإنجليزية</th>
              <th className="p-4 font-semibold text-center">Status / الحالة</th>
              <th className="p-4 font-semibold text-right">Actions / إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {categories.map((cat, index) => (
              <tr 
                key={cat.id} 
                className={`hover:bg-gray-50/60 transition ${draggingId === cat.id ? 'opacity-50 bg-gray-100' : ''} ${dragOverId === cat.id ? 'border-t-2 border-brand-gold bg-brand-gold/5' : ''}`}
                draggable={cat.id !== 'All'}
                onDragStart={(e) => cat.id !== 'All' && handleDragStart(e, index, cat.id)}
                onDragEnter={(e) => cat.id !== 'All' && handleDragEnter(e, index, cat.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <td className="p-4 text-gray-400 cursor-move">
                  {cat.id !== 'All' && '☰'}
                </td>
                <td className="p-4 font-bold text-soft-charcoal text-base">{cat.nameAr}</td>
                <td className="p-4 text-gray-600 font-medium">{cat.nameEn}</td>
                <td className="p-4 text-center">
                  {cat.id !== 'All' && (() => {
                    const effectiveActive = adminBranch !== 'all' ? (cat.branchOverrides?.[adminBranch]?.isActive ?? (cat.isActive !== false)) : (cat.isActive !== false);
                    return (
                      <button
                        onClick={() => {
                          if (adminBranch === 'all') {
                            updateCategory(cat.id, { isActive: !effectiveActive });
                          } else {
                            updateCategory(cat.id, {
                              branchOverrides: {
                                ...(cat.branchOverrides || {}),
                                [adminBranch]: {
                                  ...(cat.branchOverrides?.[adminBranch] || {}),
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
                <td className="p-4 text-right space-x-3 space-x-reverse">
                  {cat.id !== 'All' && (
                    <>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
                      >
                        <span>✏️</span>
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
                      >
                        <span>🗑️</span>
                        <span>حذف</span>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Categories Cards (Mobile View) ── */}
      <div className="block md:hidden p-3 space-y-3.5 bg-gray-50/70">
        {categories.map((cat, index) => (
          <div 
            key={cat.id} 
            className={`bg-white border ${dragOverId === cat.id ? 'border-brand-gold bg-brand-gold/5 shadow-md scale-[1.02]' : 'border-gray-200'} rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-200 ${draggingId === cat.id ? 'opacity-40 scale-95' : ''}`}
            draggable={cat.id !== 'All'}
            onDragStart={(e) => cat.id !== 'All' && handleDragStart(e, index, cat.id)}
            onDragEnter={(e) => cat.id !== 'All' && handleDragEnter(e, index, cat.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Top row: Icon + Category Names (Full Width!) */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {cat.id !== 'All' && (
                  <div className="flex flex-col gap-1 items-center justify-center py-2 px-1 text-gray-300 cursor-move active:text-brand-gold hover:text-brand-gold transition-colors touch-none">
                    <span className="text-xl">⋮⋮</span>
                  </div>
                )}
                <span className="w-12 h-12 bg-gradient-to-br from-brand-gold/20 to-amber-50 text-brand-gold rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border border-brand-gold/20 shadow-2xs">
                  📁
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-soft-charcoal text-base sm:text-lg leading-snug break-words">
                    {cat.nameAr}
                  </h4>
                  {cat.nameEn && (
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-normal break-words">
                      {cat.nameEn}
                    </p>
                  )}
                </div>
              </div>

              {cat.id === 'All' && (
                <span className="text-xs bg-amber-100/90 text-amber-900 px-3 py-1.5 rounded-xl font-bold shrink-0 border border-amber-300/60 shadow-2xs">
                  🌟 أساسي
                </span>
              )}
            </div>

            {/* Bottom row: Actions Bar (Edit & Delete on their own spacious row!) */}
            {cat.id !== 'All' && (
              <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleEdit(cat)}
                  className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <span>✏️</span>
                  <span>تعديل القسم</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <span>🗑️</span>
                  <span>حذف</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-pearl-white border border-brand-gold/30 p-6 rounded-2xl w-full max-w-md shadow-2xl text-soft-charcoal">
            <h3 className="text-xl font-bold text-brand-gold mb-4">
              {editingId ? 'Edit Category / تعديل القسم' : 'Add New Category / إضافة قسم جديد'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">اسم القسم (بالعربي)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عصائر فريش"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Juices"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">أيقونة القسم / Category Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="e.g. 🍰, 🍔, ☕"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">صورة القسم / Category Image</label>
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
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="bg-white border border-gray-300 rounded-xl p-2.5 text-center text-sm font-bold text-gray-600 hover:bg-gray-50 transition w-full">
                      {isUploadingImage ? 'جاري الضغط والرفع... ⏳' : 'اختر صورة 📁'}
                    </div>
                  </div>
                </div>
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
                Save Category / حفظ القسم
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
