"use client";
import React, { useState } from 'react';
import { Lang } from '@/lib/translations';

interface RatingModalProps {
  isOpen: boolean;
  lang: Lang;
  onClose: () => void;
}

export default function RatingModal({ isOpen, lang, onClose }: RatingModalProps) {
  const isAr = lang === 'AR';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [receptionRating, setReceptionRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setComments('');
      onClose();
    }, 2500);
  };

  const renderStars = (currentRating: number, setRating: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition transform active:scale-125 ${
              star <= currentRating ? 'text-amber-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-pearl-white border border-brand-gold/30 rounded-3xl p-6 shadow-2xl z-10 text-soft-charcoal max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${
            isAr ? 'left-4' : 'right-4'
          } text-gray-400 hover:text-soft-charcoal p-2 rounded-full bg-gray-100 border border-brand-gold/20`}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white border border-brand-gold/30 rounded-full flex items-center justify-center p-2.5 mx-auto mb-3 shadow-md">
            <img src="/icon-192-v2.png" alt="Rayahen Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-brand-gold">
            {isAr ? 'تقييم تجربة ضيوف رياحين ⭐' : 'Rate Your Rayahen Experience ⭐'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isAr ? 'رأيك يهمنا جداً لتطوير خداماتنا وحفظ أرقام تذكاراتكم' : 'We value your feedback to continually elevate your experience'}
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-300">
            <span className="text-5xl block">🌟</span>
            <h3 className="text-xl font-bold text-brand-gold">
              {isAr ? 'شكراً لك على تقييمك الكريـم!' : 'Thank you for your review!'}
            </h3>
            <p className="text-sm text-gray-600">
              {isAr
                ? 'تم تسجيل تقييمك بنجاح، ويسعدنا دائماً استضافتك في رياحين الإسكندرية ❤️'
                : 'Your feedback has been submitted. We love hosting you at Rayahen! ❤️'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                {isAr ? 'اسمك الكريم *' : 'Your Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? "أدخل اسمك الكريم" : "Enter your name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold shadow-sm"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                required
                placeholder={isAr ? "أدخل رقم الهاتف" : "Enter phone number"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm font-bold shadow-sm"
              />
            </div>

            {/* Ratings Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">
                  {isAr ? 'الاستقبال والترحيب' : 'Reception & Hospitality'}
                </span>
                {renderStars(receptionRating, setReceptionRating)}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                <span className="text-xs font-bold text-gray-700">
                  {isAr ? 'جودة القهوة والأطعمة' : 'Coffee & Food Quality'}
                </span>
                {renderStars(qualityRating, setQualityRating)}
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                <span className="text-xs font-bold text-gray-700">
                  {isAr ? 'النظافة والجو العام' : 'Cleanliness & Atmosphere'}
                </span>
                {renderStars(cleanlinessRating, setCleanlinessRating)}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                {isAr ? 'ملاحظاتك وانطباعك لمساعدتنا' : 'Your Comments & Suggestions'}
              </label>
              <textarea
                rows={3}
                placeholder={isAr ? "اكتب انطباعك أو أي اقتراح هنا..." : "Write your feedback..."}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-soft-charcoal focus:outline-none focus:border-brand-gold text-sm shadow-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-light text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-gold/20 hover:opacity-90 active:scale-[0.98] transition text-sm"
            >
              {isAr ? 'إرسال التقييم ⭐' : 'Submit Rating ⭐'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
