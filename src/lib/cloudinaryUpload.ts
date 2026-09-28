// تم التحويل من Cloudinary إلى Supabase Storage
export const uploadToCloudinary = async (file: Blob | File): Promise<string> => {
  const formData = new FormData();
  const filename = file instanceof File ? file.name : 'image.webp';
  formData.append('file', file, filename);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'فشل رفع الصورة على Supabase');
    }

    const data = await res.json();
    return data.url;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('انتهت مهلة الرفع. تحقق من اتصالك بالإنترنت.');
    }
    throw error;
  }
};
