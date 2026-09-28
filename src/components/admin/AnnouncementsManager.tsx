"use client";
import React, { useState, useRef } from 'react';
import { useMenuStore, AnnouncementPost } from '@/store/useMenuStore';

export default function AnnouncementsManager() {
  const adminBranch = useMenuStore((state) => state.adminBranch);
  const announcements = useMenuStore((state) => state.announcements);
  const addAnnouncement = useMenuStore((state) => state.addAnnouncement);
  const updateAnnouncement = useMenuStore((state) => state.updateAnnouncement);
  const toggleAnnouncement = useMenuStore((state) => state.toggleAnnouncement);
  const deleteAnnouncement = useMenuStore((state) => state.deleteAnnouncement);
  const reorderAnnouncements = useMenuStore((state) => state.reorderAnnouncements);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Drag and drop state
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [titleIt, setTitleIt] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [contentIt, setContentIt] = useState('');
  const [contentRu, setContentRu] = useState('');
  const [badgeIt, setBadgeIt] = useState('');
  const [badgeRu, setBadgeRu] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [badgeAr, setBadgeAr] = useState('📣 إعلان ترحيبي');
  const [badgeEn, setBadgeEn] = useState('📣 Welcome Announcement');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isVideoUrl = (url?: string, type?: string) => {
    if (!url) return false;
    if (type === 'video') return true;
    return Boolean(
      url.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ||
      url.startsWith('data:video/') ||
      url.includes('video')
    );
  };

  
  const handleAutoTranslate = async () => {
    if (!titleAr) return;
    setIsTranslating(true);
    try {
      const textsToTranslate = [titleAr, contentAr || ' ', badgeAr || ' '].join(' ||| ');
      
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
      setContentEn(partsEn?.[1]?.trim() || contentEn);
      setBadgeEn(partsEn?.[2]?.trim() || badgeEn);
      
      setTitleIt(partsIt?.[0]?.trim() || titleIt);
      setContentIt(partsIt?.[1]?.trim() || contentIt);
      setBadgeIt(partsIt?.[2]?.trim() || badgeIt);
      
      setTitleRu(partsRu?.[0]?.trim() || titleRu);
      setContentRu(partsRu?.[1]?.trim() || contentRu);
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
    setContentAr('');
    setContentEn('');
    setTitleIt('');
    setTitleRu('');
    setContentIt('');
    setContentRu('');
    setImagePreview('');
    setMediaType('image');
    setBadgeAr('📣 إعلان ترحيبي');
    setBadgeEn('📣 Welcome Announcement');
    setEditingPostId(null);
    setIsUploadingImage(false);
    setUploadError(null);
  };

  const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Resize large images for quick Firebase upload & Firestore storage
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            file.type === 'image/png' ? 'image/png' : 'image/jpeg',
            0.88
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = 'eafi192e';
    // Try common unsigned presets: 'rayahen_preset', 'ml_default', 'default_preset', 'unsigned_preset'
    const presets = ['rayahen_preset', 'ml_default', 'default_preset', 'unsigned_preset'];
    
    for (const preset of presets) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Cloudinary upload failed with preset ${preset}:`, errData);
          if (errData?.error?.message?.includes('preset')) {
            continue; // Preset doesn't exist, try next one!
          }
          throw new Error(errData?.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.secure_url;
      } catch (err: any) {
        if (preset === presets[presets.length - 1]) {
          throw err;
        }
      }
    }
    throw new Error('فشل الرفع عبر Cloudinary.');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview INSTANTLY
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsUploadingImage(true);
    setUploadError(null);

    const isVideoFile = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|m4v)$/i));
    if (isVideoFile) {
      setMediaType('video');
      if (file.size > 100 * 1024 * 1024) { // 100 MB max (supports 40s - 2 minutes videos)
        setUploadError('حجم الفيديو كبير جداً! يرجى اختيار فيديو مساحته أقل من 100 ميجابايت (حوالي دقيقة أو دقيقتين).');
        setIsUploadingImage(false);
        return;
      }
    } else {
      setMediaType('image');
    }

    try {
      if (isVideoFile) {
        // Step 1: Try Cloudinary first (100% free, no credit card required!)
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          if (cloudinaryUrl) {
            setImagePreview(cloudinaryUrl);
            setIsUploadingImage(false);
            return;
          }
        } catch (cloudErr: any) {
          console.warn('Cloudinary upload attempt failed, trying Firebase Storage fallback...', cloudErr);
        }

        // Step 2: Fallback to Firebase Storage with a 120-second (2 minutes) timeout
        const uploadPromise = (async () => {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const { storage } = await import('@/lib/firebase');
          const fileName = `announcements_videos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })();

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout (120s)')), 120000)
        );

        const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (downloadUrl) {
          setImagePreview(downloadUrl);
        } else {
          throw new Error('لم يتم الحصول على رابط التحميل');
        }
      } else {
        // Immediately generate compressed Data URL (< 100ms) to avoid blocking the UI/button
        const optimizedBlob = await optimizeImage(file);
        const compressedDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(optimizedBlob);
        });

        // Set preview to compressed Data URL and unlock save button immediately!
        URL.revokeObjectURL(localUrl);
        setImagePreview(compressedDataUrl);
        setIsUploadingImage(false); // Unlock Save button immediately so it never hangs!

        // Try Firebase Storage upload in background with a 4-second timeout race
        const uploadPromise = (async () => {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const { storage } = await import('@/lib/firebase');
          const fileName = `announcements/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, optimizedBlob);
          return await getDownloadURL(storageRef);
        })();

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 4000)
        );

        const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (downloadUrl) {
          setImagePreview(downloadUrl);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.code || String(err);
      console.warn('Media upload failed:', errorMsg, err);
      if (isVideoFile) {
        setImagePreview('');
        setUploadError('⚠️ فشل رفع الفيديو مجاناً! لتفعيل الرفع المباشر في المتصفح: ادخل على Cloudinary.com > الإعدادات (⚙️ Settings) > تبويب Upload > انزل لأسفل واضغط Add upload preset > اجعل Signing Mode على (Unsigned) > واكتب في المربع فوق اسم (rayahen_preset) ثم اضغط Save الأخضر فوق! وسيعمل الرفع فوراً.');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr || !contentAr) return;

    const currentMediaType = mediaType || (isVideoUrl(imagePreview) ? 'video' : 'image');

    if (editingPostId) {
      if (adminBranch !== 'all') {
        // Save as branch-specific override only
        const post = announcements.find(a => a.id === editingPostId);
        updateAnnouncement(editingPostId, {
          branchOverrides: {
            ...(post?.branchOverrides || {}),
            [adminBranch]: {
              ...(post?.branchOverrides?.[adminBranch] || {}),
              titleAr,
              titleEn: titleEn || titleAr,
              titleIt: titleIt || undefined,
              titleRu: titleRu || undefined,
              contentAr,
              contentEn: contentEn || contentAr,
              contentIt: contentIt || undefined,
              contentRu: contentRu || undefined,
              imageUrl: imagePreview || undefined,
              badgeAr: badgeAr || '📣 إعلان ترحيبي',
              badgeEn: badgeEn || '📣 Welcome Announcement',
            },
          },
        });
      } else {
        // Save to base record (affects all branches)
        updateAnnouncement(editingPostId, {
          titleAr,
          titleEn: titleEn || titleAr,
              titleIt: titleIt || undefined,
              titleRu: titleRu || undefined,
          contentAr,
          contentEn: contentEn || contentAr,
              contentIt: contentIt || undefined,
              contentRu: contentRu || undefined,
          imageUrl: imagePreview || undefined,
          mediaType: currentMediaType,
          badgeAr: badgeAr || '📣 إعلان ترحيبي',
          badgeEn: badgeEn || '📣 Welcome Announcement',
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
            titleEn: titleEn || titleAr,
              titleIt: titleIt || undefined,
              titleRu: titleRu || undefined,
            contentAr,
            contentEn: contentEn || contentAr,
              contentIt: contentIt || undefined,
              contentRu: contentRu || undefined,
            imageUrl: imagePreview || undefined,
            badgeAr: badgeAr || '📣 إعلان ترحيبي',
            badgeEn: badgeEn || '📣 Welcome Announcement',
          }
        };
      }

      const newPost: AnnouncementPost = {
        id: Date.now().toString(),
        titleAr,
        titleEn: titleEn || titleAr,
              titleIt: titleIt || undefined,
              titleRu: titleRu || undefined,
        contentAr,
        contentEn: contentEn || contentAr,
              contentIt: contentIt || undefined,
              contentRu: contentRu || undefined,
        imageUrl: imagePreview || undefined,
        mediaType: currentMediaType,
        badgeAr: badgeAr || '📣 إعلان ترحيبي',
        badgeEn: badgeEn || '📣 Welcome Announcement',
        isActive: isGloballyActive,
        branchOverrides
      };
      addAnnouncement(newPost);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (post: AnnouncementPost) => {
    setEditingPostId(post.id);
    // Load branch-specific values if a branch is selected, otherwise load base values
    const branchData = adminBranch !== 'all' ? post.branchOverrides?.[adminBranch] : undefined;
    setTitleAr(branchData?.titleAr ?? post.titleAr);
    setTitleEn(branchData?.titleEn ?? post.titleEn);
    setContentAr(branchData?.contentAr ?? post.contentAr);
    setContentEn(branchData?.contentEn ?? post.contentEn);
    const preview = (branchData?.imageUrl ?? post.imageUrl) || '';
    setImagePreview(preview);
    setMediaType(post.mediaType || (isVideoUrl(preview) ? 'video' : 'image'));
    setBadgeAr(branchData?.badgeAr ?? post.badgeAr ?? '📣 إعلان ترحيبي');
    setBadgeEn(branchData?.badgeEn ?? post.badgeEn ?? '📣 Welcome Announcement');
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
      const newItems = [...announcements];
      const draggedItem = newItems[dragItemIndex.current];
      newItems.splice(dragItemIndex.current, 1);
      newItems.splice(dragOverItemIndex.current, 0, draggedItem);
      reorderAnnouncements(newItems);
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
          <h4 className="text-lg font-bold text-soft-charcoal">Announcements & Welcome Posts / المنشورات وإعلانات الترحيب</h4>
          <p className="text-sm text-gray-500">Create & edit welcome cards with images and text displayed on the guest menu.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 hover:opacity-90 active:scale-95 text-sm"
        >
          + Create Announcement Post / إضافة منشور
        </button>
      </div>

      <div className="p-0 overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4 font-semibold">Image / الصورة</th>
              <th className="p-4 font-semibold">Title / العنوان</th>
              <th className="p-4 font-semibold">Content Preview / تفاصيل المنشور</th>
              <th className="p-4 font-semibold">Status / الحالة</th>
              <th className="p-4 font-semibold text-right">Actions / إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {announcements.map((post, index) => (
              <tr 
                key={post.id} 
                className={`hover:bg-gray-50/60 transition ${draggingId === post.id ? 'opacity-50 bg-gray-100' : ''} ${dragOverId === post.id ? 'border-t-2 border-brand-gold bg-brand-gold/5' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index, post.id)}
                onDragEnter={(e) => handleDragEnter(e, index, post.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <td className="p-4 text-gray-400 cursor-move">
                  ☰
                </td>
                <td className="p-4">
                  {post.imageUrl ? (
                    isVideoUrl(post.imageUrl, post.mediaType) ? (
                      <div className="w-12 h-12 bg-black/80 rounded-lg flex items-center justify-center text-white text-xs shadow-2xs border border-brand-gold/20 font-bold" title="فيديو ملحق">🎥 فيديو</div>
                    ) : (
                      <img src={post.imageUrl} alt="Post" className="w-12 h-12 object-cover rounded-lg border border-brand-gold/20 shadow-2xs" />
                    )
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">بدون وسائط</div>
                  )}
                </td>
                <td className="p-4">
                  {post.badgeAr && (
                    <span className="inline-block bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[11px] px-2.5 py-0.5 rounded-full font-bold mb-1 shadow-2xs">
                      {post.badgeAr}
                    </span>
                  )}
                  <p className="font-bold text-soft-charcoal">{post.titleAr}</p>
                  <p className="text-xs text-gray-400">{post.titleEn}</p>
                </td>
                <td className="p-4 text-gray-600 text-xs max-w-sm truncate">
                  {post.contentAr}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => toggleAnnouncement(post.id)}
                    className={`flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer shadow-inner border ${
                      post.isActive ? 'bg-brand-gold border-brand-gold justify-end' : 'bg-gray-200 border-gray-300 justify-start'
                    }`}
                    title={post.isActive ? 'نشط' : 'معطل'}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200" />
                  </button>
                </td>
                <td className="p-4 text-right space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="text-brand-gold hover:underline font-bold text-xs"
                  >
                    Edit / تعديل
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(post.id)}
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

      {/* Mobile Card List for Announcements (Spacious, Zero Horizontal Scrolling, Perfect Toggle Button!) */}
      <div className="block md:hidden p-3 space-y-3.5 bg-gray-50/70">
        {announcements.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200 shadow-2xs">
            لا توجد إعلانات أو منشورات حتى الآن
          </div>
        )}
        {announcements.map((post, index) => (
          <div 
            key={post.id} 
            className={`bg-white border ${dragOverId === post.id ? 'border-brand-gold bg-brand-gold/5 shadow-md scale-[1.02]' : 'border-gray-200'} rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 transition-all duration-200 ${draggingId === post.id ? 'opacity-40 scale-95' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index, post.id)}
            onDragEnter={(e) => handleDragEnter(e, index, post.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Row 1: Image & Status Toggle Button */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 items-center justify-center py-2 px-1 text-gray-300 cursor-move active:text-brand-gold hover:text-brand-gold transition-colors touch-none">
                  <span className="text-xl">⋮⋮</span>
                </div>
                {post.imageUrl ? (
                  isVideoUrl(post.imageUrl, post.mediaType) ? (
                    <div className="w-14 h-14 bg-black/80 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs border border-brand-gold/20" title="فيديو ملحق">🎥 فيديو</div>
                  ) : (
                    <img src={post.imageUrl} alt="Post" className="w-14 h-14 object-cover rounded-xl border border-brand-gold/20 shrink-0 shadow-2xs" />
                  )
                ) : (
                  <div className="w-14 h-14 bg-amber-50/80 rounded-xl flex items-center justify-center text-lg text-amber-700 font-bold shrink-0 border border-amber-200/50">📣</div>
                )}
                {post.badgeAr && (
                  <span className="inline-block bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-xs px-2.5 py-1 rounded-full font-bold shadow-2xs">
                    {post.badgeAr}
                  </span>
                )}
              </div>

              {/* Status Toggle Button - Flex justified (Never covers text or overflows!) */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {(() => {
                  const effectiveActive = adminBranch !== 'all' ? (post.branchOverrides?.[adminBranch]?.isActive ?? (post.isActive !== false)) : (post.isActive !== false);
                  return (
                    <>
                      <span className="text-[11px] text-gray-500 font-bold">
                        {effectiveActive ? '🟢 نشط ومتاح' : '⚪ معطل'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (adminBranch === 'all') {
                            toggleAnnouncement(post.id);
                          } else {
                            updateAnnouncement(post.id, {
                              branchOverrides: {
                                ...(post.branchOverrides || {}),
                                [adminBranch]: {
                                  ...(post.branchOverrides?.[adminBranch] || {}),
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
                {post.titleAr}
              </h4>
              {post.titleEn && (
                <p className="text-xs text-gray-400 font-medium leading-normal break-words">
                  {post.titleEn}
                </p>
              )}
            </div>

            {/* Row 3: Content Preview */}
            <div className="text-gray-600 text-xs bg-pearl-white/60 p-3 rounded-xl border border-gray-150 leading-relaxed break-words">
              {post.contentAr}
            </div>

            {/* Row 4: Actions Bar */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleEditClick(post)}
                className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <span>✏️</span>
                <span>تعديل المنشور</span>
              </button>
              <button
                type="button"
                onClick={() => deleteAnnouncement(post.id)}
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
          <form onSubmit={handleSave} className="bg-pearl-white border border-brand-gold/30 p-6 rounded-2xl w-full max-w-lg shadow-2xl text-soft-charcoal max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-gold mb-4">
              {editingPostId ? 'Edit Announcement Post / تعديل منشور' : 'Create Announcement Post / إضافة منشور جديد'}
            </h3>
            
            <div className="space-y-4 mb-6">
              
              {/* Media Uploader (Image & Short Video) */}
              <div className="bg-white/80 p-3.5 rounded-xl border border-brand-gold/20 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-soft-charcoal mb-1">اختر صورة أو فيديو قصير من جهازك (Media Upload):</label>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-soft-charcoal text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-gold file:text-white hover:file:opacity-90 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">أو أضف رابط الصورة / الفيديو مباشرة (Direct URL):</label>
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4 أو رابط صورة"
                    value={imagePreview}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImagePreview(val);
                      if (isVideoUrl(val)) {
                        setMediaType('video');
                      } else {
                        setMediaType('image');
                      }
                    }}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal text-xs font-mono focus:outline-none focus:border-brand-gold"
                  />
                </div>

                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-xs text-brand-gold font-bold animate-pulse p-2 bg-amber-50 rounded-lg">
                    <span>⏳ جاري رفع ومعالجة الوسائط (صورة / فيديو)... (Please wait)</span>
                  </div>
                )}
                {uploadError && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                    ⚠️ {uploadError}
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-3 relative w-full max-h-60 rounded-xl overflow-hidden border border-brand-gold/30 bg-gray-50 flex items-center justify-center p-2">
                    {isVideoUrl(imagePreview, mediaType) ? (
                      <video
                        src={imagePreview}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-auto max-h-56 object-contain mx-auto rounded-lg"
                      />
                    ) : (
                      <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-56 object-contain mx-auto rounded-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setUploadError(null); setMediaType('image'); }}
                      className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white text-xs px-3 py-1 rounded-full font-bold z-10 transition shadow-md"
                    >
                      إزالة الوسائط ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Badge / Tag Section with Preset Emoji Chips */}
              <div className="bg-amber-50/50 border border-brand-gold/20 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-brand-gold">🏷️ شارة المنشور (Badge / Tag)</label>
                  <span className="text-[11px] text-gray-500">اختر شارة سريعة أو اكتب شارة خاصة مع إيموجي:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { ar: '📣 إعلان ترحيبي', en: '📣 Welcome Announcement' },
                    { ar: '🌟 عرض خاص للمميزين', en: '🌟 Special Offer' },
                    { ar: '☕ جديد رياحين', en: '☕ New at Rayahen' },
                    { ar: '⏰ ساعات العمل الرسمية', en: '⏰ Working Hours' },
                    { ar: '🎉 خصم اليوم', en: '🎉 Today Discount' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBadgeAr(preset.ar);
                        setBadgeEn(preset.en);
                      }}
                      className="bg-white border border-brand-gold/30 hover:bg-brand-gold hover:text-white text-soft-charcoal text-[11px] px-2.5 py-1 rounded-lg transition font-medium shadow-2xs"
                    >
                      {preset.ar}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">الشارة (عربي)</label>
                    <input
                      type="text"
                      placeholder="مثال: 📣 إعلان هام"
                      value={badgeAr}
                      onChange={(e) => setBadgeAr(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-soft-charcoal focus:outline-none focus:border-brand-gold text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. 📣 Important Notice"
                      value={badgeEn}
                      onChange={(e) => setBadgeEn(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-soft-charcoal focus:outline-none focus:border-brand-gold text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">عنوان المنشور (بالعربي)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أهلاً بكم في رياحين ☕✨"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Title (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome to Rayahen!"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">نص الرسالة / الكلام (بالعربي)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب رسالة الترحيب أو الإعلان هنا..."
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Message Content (English)</label>
                <textarea
                  rows={2}
                  placeholder="Welcome message in English..."
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm"
                />
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
                disabled={isUploadingImage}
                className={`bg-gradient-to-r from-brand-gold to-brand-gold-light text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-brand-gold/20 text-sm ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUploadingImage ? 'جاري الرفع... / Uploading...' : editingPostId ? 'Save Changes / حفظ التعديلات' : 'Publish Post / نشر المنشور'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
