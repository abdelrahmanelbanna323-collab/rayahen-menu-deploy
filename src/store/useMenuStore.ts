"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, ActivityLog } from '@/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

export interface PromotionItem {
  id: string;
  titleEn: string;
  titleAr: string;
  titleIt?: string;
  titleRu?: string;
  subtitleEn: string;
  subtitleAr: string;
  subtitleIt?: string;
  subtitleRu?: string;
  badgeEn: string;
  badgeAr: string;
  badgeIt?: string;
  badgeRu?: string;
  ctaEn: string;
  ctaAr: string;
  ctaIt?: string;
  ctaRu?: string;
  gradient: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      titleAr?: string;
      titleEn?: string;
      titleIt?: string;
      titleRu?: string;
      subtitleAr?: string;
      subtitleEn?: string;
      subtitleIt?: string;
      subtitleRu?: string;
      badgeAr?: string;
      badgeEn?: string;
      badgeIt?: string;
      badgeRu?: string;
      ctaAr?: string;
      ctaEn?: string;
      ctaIt?: string;
      ctaRu?: string;
      imageUrl?: string;
      icon?: string;
    };
  };
}

export interface CategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  nameIt?: string;
  nameRu?: string;
  imageUrl?: string;
  icon?: string;
  isActive?: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      nameAr?: string;
      nameEn?: string;
      nameIt?: string;
      nameRu?: string;
      imageUrl?: string;
      icon?: string;
    };
  };
}

export interface AnnouncementPost {
  id: string;
  titleAr: string;
  titleEn: string;
  titleIt?: string;
  titleRu?: string;
  contentAr: string;
  contentEn: string;
  contentIt?: string;
  contentRu?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  badgeAr: string;
  badgeEn: string;
  badgeIt?: string;
  badgeRu?: string;
  isActive: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      titleAr?: string;
      titleEn?: string;
      titleIt?: string;
      titleRu?: string;
      contentAr?: string;
      contentEn?: string;
      contentIt?: string;
      contentRu?: string;
      imageUrl?: string;
      badgeAr?: string;
      badgeEn?: string;
      badgeIt?: string;
      badgeRu?: string;
    };
  };
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'MANAGER';
}

const initialCategories: CategoryItem[] = [
  { id: 'All', nameEn: 'All', nameAr: 'ط§ظ„ظƒظ„' },
  { id: 'Breakfast Combos', nameEn: 'Breakfast Combos', nameAr: 'ط¹ط±ظˆط¶ ط§ظ„ظپط·ط§ط±' },
  { id: 'Breakfast', nameEn: 'Breakfast', nameAr: 'ط§ظ„ظپط·ط§ط±' },
  { id: 'Bakery', nameEn: 'Bakery', nameAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ' },
  { id: 'Coffee Drinks', nameEn: 'Coffee Drinks', nameAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©' },
  { id: 'Hot Drinks', nameEn: 'Hot Drinks', nameAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©' },
  { id: 'Milkshakes & Smoothies', nameEn: 'Milkshakes & Smoothies', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ' },
  { id: 'Frappes & Iced Coffee', nameEn: 'Frappأ©s & Iced Coffee', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ' },
  { id: 'Nuts & Bubbles', nameEn: 'Nuts & Bubbles', nameAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²' },
  { id: 'Cocktails & Soda', nameEn: 'Cocktails & Soda', nameAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§' },
  { id: 'Fresh Juices', nameEn: 'Fresh Juices', nameAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´' },
  { id: 'Desserts', nameEn: 'Desserts', nameAr: 'ط§ظ„ط­ظ„ظˆ' },
  { id: 'Soft Drinks & Addons', nameEn: 'Soft Drinks & Add-ons', nameAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ' },
];

const initialMenuItems: MenuItem[] = [
  // ط¹ط±ظˆط¶ ط§ظ„ظپط·ط§ط±
  { id: 'cb1', nameAr: 'ط§ظ„ظپط·ط§ط± ط§ظ„ط´ط±ظ‚ظٹ', nameEn: 'Oriental Breakfast Combo', descriptionAr: 'ظپظˆظ„ ظˆظپظ„ط§ظپظ„ ظˆط¨ط·ط§ط·ط³ ظ…ظ‚ط·ط¹ط© ظˆط¹ظٹط´ ط¨ظ„ط¯ظٹ ط³ط®ظ† + ط´ط§ظٹ ط£ظˆ ظ„ظٹظ…ظˆظ†', descriptionEn: 'Foul, falafel, sliced potatoes, fresh warm baladi bread + tea or lemon', price: 99, categoryAr: 'ط¹ط±ظˆط¶ ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast Combos', badgeAr: 'ط¹ط±ط¶ ظ…ظ…ظٹط²', badgeEn: 'Special Offer' },
  { id: 'cb2', nameAr: 'ط§ظ„ظپط·ط§ط± ط§ظ„ط؛ط±ط¨ظٹ', nameEn: 'Western Breakfast Combo', descriptionAr: 'ط³ظ…ظˆظƒ طھط±ظƒظٹ ظˆط¨ظٹط¶ ظˆط´ظٹط¯ط± ط£ط­ظ…ط± ظˆط¨ط·ط§ط·ط³ ظƒط±ظٹط³ط¨ + ط´ط§ظٹ ط£ظˆ ظ„ظٹظ…ظˆظ† ظ…ظ†ط¹ط´', descriptionEn: 'Smoked turkey, eggs, red cheddar, crispy potatoes + tea or lemon', price: 99, categoryAr: 'ط¹ط±ظˆط¶ ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast Combos', badgeAr: 'ط¹ط±ط¶ ظ…ظ…ظٹط²', badgeEn: 'Special Offer' },
  { id: 'cb3', nameAr: 'ط§ظ„ظپط·ط§ط± ط§ظ„ظپط±ظ†ط´', nameEn: 'French Breakfast Combo', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ط§ط¯ط© + ظƒط§ط¨طھط´ظٹظ†ظˆ ط£ظˆ ظ„ط§طھظٹظ‡ ط£ظˆ ط´ط§ظٹ', descriptionEn: 'Plain croissant + cappuccino, latte or tea', price: 99, categoryAr: 'ط¹ط±ظˆط¶ ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast Combos', badgeAr: 'ط¹ط±ط¶ ظ…ظ…ظٹط²', badgeEn: 'Special Offer' },

  // ط§ظ„ظپط·ط§ط±
  { id: 'bf1', nameAr: 'ظپط·ط§ط± ط±ظٹط§ط­ظٹظ†', nameEn: 'Rayahen Signature Breakfast', descriptionAr: 'ط¨ظٹط¶طŒ ظپظˆظ„طŒ ظپظ„ط§ظپظ„طŒ ط¬ط¨ظ†ط© ط¨ط§ظ„ط·ظ…ط§ط·ظ…طŒ ط¨ظˆظ… ظپط±ظٹطھطŒ ط¨ط§ط°ظ†ط¬ط§ظ† ط®ظ„ ظˆط«ظˆظ…', descriptionEn: 'Eggs, foul, falafel, cheese with tomatoes, pommes frites, eggplant with garlic & vinegar', price: 165, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast', badgeAr: 'ط§ظ„ط£ظƒط«ط± ط·ظ„ط¨ط§ظ‹', badgeEn: 'Best Seller' },
  { id: 'bf2', nameAr: 'ظپط·ط§ط± ط£ظ…ط±ظٹظƒط§ظ†', nameEn: 'American Breakfast', descriptionAr: 'طھط±ظƒظٹطŒ ط´ظٹط¯ط± ط£ط­ظ…ط±طŒ ظپظٹطھط§طŒ ظ‡ظˆطھ ط¯ظˆط¬طŒ طھظˆط³طھ', descriptionEn: 'Turkey, red cheddar, feta, hot dog, toast', price: 190, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf3', nameAr: 'ظپظˆظ„ ط³ط§ط¯ظ‡', nameEn: 'Plain Foul', descriptionAr: 'ط·ط¨ظ‚ ظپظˆظ„ ط³ط§ط¯ط©', descriptionEn: 'Plain oriental fava beans', price: 40, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf4', nameAr: 'ظپظˆظ„ ط²ظٹطھ ط²ظٹطھظˆظ†', nameEn: 'Foul with Olive Oil', descriptionAr: 'ظپظˆظ„ ظ…ط¹ ط²ظٹطھ ط§ظ„ط²ظٹطھظˆظ† ط§ظ„طµط§ظپظٹ', descriptionEn: 'Foul topped with virgin olive oil', price: 55, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf5', nameAr: 'ظپظˆظ„ ط¥ط³ظƒظ†ط¯ط±ط§ظ†ظٹ', nameEn: 'Alexandrian Foul', descriptionAr: 'ظپظˆظ„ ط¨ط§ظ„ط·ط±ظٹظ‚ط© ط§ظ„ط¥ط³ظƒظ†ط¯ط±ط§ظ†ظٹط©', descriptionEn: 'Special Alexandrian style foul', price: 50, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf6', nameAr: 'ظپظˆظ„ ط²ط¨ط¯ط©', nameEn: 'Foul with Butter', descriptionAr: 'ظپظˆظ„ ط¨ط§ظ„ط²ط¨ط¯ط© ط§ظ„ط¨ظ„ط¯ظٹط©', descriptionEn: 'Rich butter foul', price: 55, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf7', nameAr: 'ظپظˆظ„ ط¯ظٹظ†ط§ظ…ظٹطھ', nameEn: 'Dynamite Foul', descriptionAr: 'ظپظˆظ„ + ط¨ظٹط¶ + ط¨طھظ†ط¬ط§ظ†', descriptionEn: 'Foul + eggs + eggplant combo', price: 55, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf8', nameAr: 'ظپظ„ط§ظپظ„ ط¨ط§ظ„ط³ظ…ط³ظ…', nameEn: 'Sesame Falafel', descriptionAr: 'ط§ظ„ط·ط¨ظ‚ ظ£ ظ‚ط·ط¹ ظپظ„ط§ظپظ„ ط¨ط§ظ„ط³ظ…ط³ظ…', descriptionEn: '3 pcs sesame coated falafel', price: 50, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf9', nameAr: 'ظپظ„ط§ظپظ„ ظƒظٹط±ظ‰', nameEn: 'Kiri Stuffed Falafel', descriptionAr: 'ط§ظ„ط·ط¨ظ‚ ظ£ ظ‚ط·ط¹ ظپظ„ط§ظپظ„ ظ…ط­ط´ظˆط© ط¬ط¨ظ†ط© ظƒظٹط±ظٹ', descriptionEn: '3 pcs falafel stuffed with Kiri cheese', price: 70, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf10', nameAr: 'ظپظ„ط§ظپظ„ ط¬ط¨ظ†ظ‡ طھط±ظƒظ‰', nameEn: 'Roumy Cheese Falafel', descriptionAr: 'ط§ظ„ط·ط¨ظ‚ ظ£ ظ‚ط·ط¹ ظپظ„ط§ظپظ„ ظ…ط­ط´ظˆط© ط¬ط¨ظ†ط© طھط±ظƒظٹ', descriptionEn: '3 pcs falafel stuffed with Roumy cheese', price: 70, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf11', nameAr: 'ظپظ„ط§ظپظ„ ظ…ظˆطھط²ط§ط±ظٹظ„ط§', nameEn: 'Mozzarella Falafel', descriptionAr: 'ط§ظ„ط·ط¨ظ‚ ظ£ ظ‚ط·ط¹ ظپظ„ط§ظپظ„ ظ…ط­ط´ظˆط© ظ…ظˆطھط²ط§ط±ظٹظ„ط§', descriptionEn: '3 pcs falafel stuffed with mozzarella', price: 70, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf12', nameAr: 'ظپظ„ط§ظپظ„ ط¨ط³ط·ط±ظ…ظ‡', nameEn: 'Pastrami Falafel', descriptionAr: 'ط§ظ„ط·ط¨ظ‚ ظ£ ظ‚ط·ط¹ ظپظ„ط§ظپظ„ ظ…ط­ط´ظˆط© ط¨ط³ط·ط±ظ…ط©', descriptionEn: '3 pcs falafel stuffed with pastrami', price: 85, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf13', nameAr: 'ط£ظˆظ…ظ„ظٹطھ ط³ط§ط¯ط©', nameEn: 'Plain Omelette', descriptionAr: 'ط·ط¨ظ‚ ط£ظˆظ…ظ„ظٹطھ ظƒظ„ط§ط³ظٹظƒ', descriptionEn: 'Classic plain egg omelette', price: 60, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf14', nameAr: 'ط¥ط³ط¨ط§ظ†ط´ ط£ظˆظ…ظ„ظٹطھ', nameEn: 'Spanish Omelette', descriptionAr: 'ط£ظˆظ…ظ„ظٹطھ ظ…ط¹ ظ…ظٹظƒط³ ط®ط¶ط§ط±', descriptionEn: 'Omelette with mixed veggies', price: 80, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf15', nameAr: 'ط£ظˆظ…ظ„ظٹطھ ط¨ط³ط·ط±ظ…ط©', nameEn: 'Pastrami Omelette', descriptionAr: 'ط£ظˆظ…ظ„ظٹطھطŒ ظ…ظٹظƒط³ طھط´ظٹط²طŒ ط¨ط³ط·ط±ظ…ط©', descriptionEn: 'Omelette with mixed cheese & pastrami', price: 105, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf16', nameAr: 'ط£ظˆظ…ظ„ظٹطھ ط³ط¬ظ‚', nameEn: 'Sausage Omelette', descriptionAr: 'ط£ظˆظ…ظ„ظٹطھطŒ ظ…ظٹظƒط³ طھط´ظٹط²طŒ ط³ط¬ظ‚', descriptionEn: 'Omelette with mixed cheese & oriental sausage', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf17', nameAr: 'ط£ظˆظ…ظ„ظٹطھ ظ…ظٹظƒط³ طھط´ظٹط²', nameEn: 'Mix Cheese Omelette', descriptionAr: 'ط´ظٹط¯ط± ظ…ظٹظƒط³ ظˆظ…ظˆطھط²ط§ط±ظٹظ„ط§', descriptionEn: 'Cheddar mix & mozzarella omelette', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf18', nameAr: 'ط§ظˆظ…ظ„ظٹطھ ط³ظˆط¨ط±ظٹظ…', nameEn: 'Supreme Omelette', descriptionAr: 'ط¨ظٹط¶ + ط³ظ„ط§ظ…ظ‰ + ط³ط¯ظ‚ + ط³ظˆط³ظٹط³', descriptionEn: 'Eggs + salami + sausage + hot dog', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf19', nameAr: 'ط¨ظٹط¶ ظ…ط¯ط­ط±ط¬', nameEn: 'Fried Boiled Eggs', descriptionAr: 'ط¨ظٹط¶ ظ…ط³ظ„ظˆظ‚ ظˆظ…ظ‚ظ„ظٹ ط¨ط§ظ„ط²ط¨ط¯ط©', descriptionEn: 'Butter-fried boiled eggs', price: 60, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf20', nameAr: 'ط¨ظˆظ… ظپط±ظٹطھ', nameEn: 'Pommes Frites', descriptionAr: 'ط¨ط·ط§ط·ط³ ظ…ظ‚ظ„ظٹط© ط°ظ‡ط¨ظٹط©', descriptionEn: 'Crispy French fries', price: 50, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf21', nameAr: 'ط¬ط¨ظ†ط© ط¨ط§ظ„ط·ظ…ط§ط·ظ…', nameEn: 'Feta Cheese with Tomatoes', descriptionAr: 'ط¬ط¨ظ†ط© ظپظٹطھط§ ط¨ط§ظ„ط²ظٹطھ ظˆط§ظ„ط·ظ…ط§ط·ظ…', descriptionEn: 'Feta cheese with tomatoes & olive oil', price: 45, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf22', nameAr: 'ط·ط¨ظ‚ ط¹ط¬ظ‡', nameEn: 'Eggah Plate', descriptionAr: 'ط¹ط¬ط© ظ…طµط±ظٹط© ط¨ط§ظ„ط¨ظٹط¶ ظˆط§ظ„ط®ط¶ط§ط±', descriptionEn: 'Egyptian style baked eggah', price: 60, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf23', nameAr: 'ط´ظƒط´ظˆظƒط©', nameEn: 'Shakshuka', descriptionAr: 'ط¨ظٹط¶ ظ…ط·ط¨ظˆط® ط¨ط§ظ„طµظ„طµط© ظˆط§ظ„ظپظ„ظپظ„', descriptionEn: 'Eggs poached in tomato sauce', price: 60, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf24', nameAr: 'ظ…ط³ظ‚ط¹ظ‡', nameEn: 'Moussaka', descriptionAr: 'ظ…ط³ظ‚ط¹ط© ط¨ط§ط°ظ†ط¬ط§ظ† ط¨ط§ظ„طµظ„طµط©', descriptionEn: 'Egyptian eggplant moussaka', price: 50, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf25', nameAr: 'ظپط·ظٹط± ظ…ط´ظ„طھطھ', nameEn: 'Fiteer Meshaltet', descriptionAr: '3 ظ‚ط·ط¹ ظپط·ظٹط±طŒ ط·ط­ظٹظ†ط©طŒ ط¹ط³ظ„ ط£ط³ظˆط¯طŒ ط¹ط³ظ„ ط£ط¨ظٹط¶طŒ ظ…ط±ط¨ظ‰', descriptionEn: '3 pcs fiteer with tahini, black honey, white honey & jam', price: 105, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf26', nameAr: 'طھظˆط³طھ ظ…ظٹظƒط³ طھط´ظٹط²', nameEn: 'Mix Cheese Toast', descriptionAr: 'طھظˆط³طھطŒ ظ…ظٹظƒط³ طھط´ظٹط²طŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Mix cheese toast with fries', price: 110, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf27', nameAr: 'طھظˆط³طھ ط³ظ…ظˆظƒ طھط±ظƒظٹ', nameEn: 'Smoked Turkey Toast', descriptionAr: 'طھظˆط³طھطŒ ظ…ظٹظƒط³ ط´ظٹط¯ط±طŒ ط³ظ…ظˆظƒ طھط±ظƒظٹطŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Smoked turkey, cheddar toast & fries', price: 125, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf28', nameAr: 'طھظˆط³طھ ط³ط¬ظ‚', nameEn: 'Sausage Toast', descriptionAr: 'طھظˆط³طھ ظ…ط¹ ط§ظ„ط³ط¬ظ‚ ط§ظ„ط´ط±ظ‚ظٹ ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Oriental sausage toast with cheese', price: 110, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf29', nameAr: 'طھظˆط³طھ ط³ظ„ط§ظ…ظ‰', nameEn: 'Salami Toast', descriptionAr: 'ط¬ط¨ظ†ظ‡ ظƒظٹط±ظ‰ + طµظˆطµ ط´ظٹط¯ط± + ط³ظ„ط§ظ…ظ‰', descriptionEn: 'Kiri cheese, cheddar sauce & salami toast', price: 110, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf30', nameAr: 'طھظˆط³طھ ط³ظˆط¨ط±ظٹظ…', nameEn: 'Supreme Toast', descriptionAr: 'طµظˆطµ ط´ظٹط¯ط± + ط³ظ„ط§ظ…ظ‰ + ط³ظˆط³ظٹط³ + ط³ط¬ظ‚', descriptionEn: 'Cheddar sauce, salami, hot dog & sausage toast', price: 120, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf31', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ط§ط¯ط© (ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Plain Croissant (No Fries)', descriptionAr: 'ظٹظ‚ط¯ظ… ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Served without pommes frites', price: 70, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf32', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ط§ط¯ط© (ظ…ط¹ ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Plain Croissant (With Fries)', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ط¹ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Croissant served with pommes frites', price: 90, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf33', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ظٹظƒط³ طھط´ظٹط² (ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Mix Cheese Croissant (No Fries)', descriptionAr: 'ظٹظ‚ط¯ظ… ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Served without pommes frites', price: 80, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf34', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ظٹظƒط³ طھط´ظٹط² (ظ…ط¹ ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Mix Cheese Croissant (With Fries)', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ†طŒ ظ…ظٹظƒط³ طھط´ظٹط²طŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Croissant with mix cheese & pommes frites', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf35', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظ…ظˆظƒ طھط±ظƒظٹ (ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Smoked Turkey Croissant (No Fries)', descriptionAr: 'ظٹظ‚ط¯ظ… ط¨ط¯ظˆظ† ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Served without pommes frites', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf36', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظ…ظˆظƒ طھط±ظƒظٹ (ظ…ط¹ ط¨ظˆظ… ظپط±ظٹطھ)', nameEn: 'Smoked Turkey Croissant (With Fries)', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ†طŒ ط³ظ…ظˆظƒ طھط±ظƒظٹطŒ ظ…ظٹظƒط³ ط´ظٹط¯ط±طŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Croissant with smoked turkey, cheddar & fries', price: 125, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf37', nameAr: 'ظƒظ„ظˆط¨ ط³ط§ظ†ط¯ظˆطھط´', nameEn: 'Club Sandwich', descriptionAr: 'ط³ظ„ط§ظ…ظ‰ , ط³ظ…ظˆظƒ طھط±ظƒ , ط§ظˆظ…ظ„ظٹطھ , ط¨ظˆظ…ظپط±ظٹطھ', descriptionEn: 'Salami, smoked turkey, omelette & fries', price: 185, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf38', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ط³ظ…ظˆظƒ طھط±ظƒظٹ', nameEn: 'Smoked Turkey Sandwich', descriptionAr: 'ط³ظ…ظˆظƒ طھط±ظƒظٹطŒ ط­ظ„ظˆظ…طŒ ظƒظٹط±ظٹطŒ ط´ظٹط¯ط±طŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Smoked turkey, halloumi, Kiri, cheddar & fries', price: 125, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf39', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ط³ظ„ط§ظ…ظٹ', nameEn: 'Salami Sandwich', descriptionAr: 'ط³ظ„ط§ظ…ظٹطŒ ط´ظٹط¯ط±طŒ ط­ظ„ظˆظ…طŒ ظƒظٹط±ظٹطŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Salami, cheddar, halloumi, Kiri & fries', price: 125, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf40', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ظ…ظٹظƒط³ طھط´ظٹط²', nameEn: 'Mix Cheese Sandwich', descriptionAr: 'ط´ظٹط¯ط±طŒ ط­ظ„ظˆظ…طŒ ظƒظٹط±ظٹطŒ ط¨ظˆظ… ظپط±ظٹطھ', descriptionEn: 'Cheddar, halloumi, Kiri & fries', price: 110, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf41', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ط§ظ„ط­ط¨ظ‡ ط§ظ„ظƒط§ظ…ظ„ط© ط¬ط¨ظ†ظ‡', nameEn: 'Whole Grain Cheese Sandwich', descriptionAr: 'ط¬ط¨ظ†ظ‡ ط´ظٹط¯ط± ط§ط­ظ…ط± + ط¬ط¨ظ†ظ‡ طھط±ظƒظ‰ + ط¬ط¨ظ†ظ‡ ظƒظٹط±ظ‰', descriptionEn: 'Red cheddar + Roumy cheese + Kiri cheese', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf42', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ط§ظ„ط­ط¨ظ‡ ط§ظ„ظƒط§ظ…ظ„ط© ط³ظˆط¨ط±ظٹظ…', nameEn: 'Whole Grain Supreme Sandwich', descriptionAr: 'ط³ظ„ط§ظ…ظ‰ + ط³ظ…ظˆظƒ طھط±ظƒظ‰ + ط¬ط¨ظ†ظ‡ ظƒظٹط±ظ‰', descriptionEn: 'Salami + smoked turkey + Kiri cheese', price: 100, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },
  { id: 'bf43', nameAr: 'ط³ط§ظ†ط¯ظˆطھط´ ط§ظ„ط­ط¨ط© ط§ظ„ظƒط§ظ…ظ„ظ‡ ظ…ط´ظƒظ„ ظ„ط­ظˆظ…', nameEn: 'Whole Grain Mixed Meat Sandwich', descriptionAr: 'ط¨ط³ط·ط±ظ…ظ‡ + ط³ط¬ظ‚ + ط¬ط¨ظ†ظ‡ طھط±ظƒظ‰', descriptionEn: 'Pastrami + sausage + Roumy cheese', price: 110, categoryAr: 'ط§ظ„ظپط·ط§ط±', categoryEn: 'Breakfast' },

  // ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ (Bakery)
  { id: 'bk1', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ط§ط¯ط©', nameEn: 'Plain Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط²ط¨ط¯ط© ظپط±ظ†ط³ظٹ ط³ط§ط¯ط©', descriptionEn: 'Fresh plain butter croissant', price: 70, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk2', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ظٹظƒط³ طھط´ظٹط²', nameEn: 'Mix Cheese Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ط­ط´ظˆ ظ…ظٹظƒط³ ط£ط¬ط¨ط§ظ† ط؛ظ†ظٹ', descriptionEn: 'Croissant stuffed with mix cheese', price: 70, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk3', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظ…ظˆظƒ طھط±ظƒظ‰', nameEn: 'Smoked Turkey Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„طھط±ظƒظٹ ط§ظ„ظ…ط¯ط®ظ†', descriptionEn: 'Croissant filled with smoked turkey', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk4', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط´ظٹظƒظˆظ„ط§طھظ‡', nameEn: 'Chocolate Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ط­ط´ظˆ ط´ظˆظƒظˆظ„ط§طھط© ط؛ظ†ظٹط©', descriptionEn: 'Croissant with chocolate filling', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk5', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ†ظˆطھظٹظ„ط§', nameEn: 'Nutella Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ…ط­ط´ظˆ ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Croissant filled with Nutella', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk6', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ„ظˆطھط³', nameEn: 'Lotus Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط²ط¨ط¯ط© ط§ظ„ظ„ظˆطھط³', descriptionEn: 'Croissant filled with Lotus Biscoff', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk7', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ظٹط³طھط§ط´ظٹظˆ', nameEn: 'Pistachio Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ظƒط±ظٹظ…ط© ط§ظ„ظپط³طھظ‚', descriptionEn: 'Croissant with pistachio cream', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk8', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظƒظٹظ†ط¯ط±', nameEn: 'Kinder Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط´ظˆظƒظˆظ„ط§طھط© ظƒظٹظ†ط¯ط±', descriptionEn: 'Croissant stuffed with Kinder', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk9', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظ„ظˆط²', nameEn: 'Almond Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ظƒط±ظٹظ…ط© ط§ظ„ظ„ظˆط² ظˆط§ظ„ظ…ظƒط³ط±ط§طھ', descriptionEn: 'Croissant with almond cream', price: 130, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk10', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ظƒط±ط§ظ…ظٹظ„', nameEn: 'Caramel Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨طµظˆطµ ط§ظ„ظƒط±ط§ظ…ظٹظ„', descriptionEn: 'Croissant with caramel sauce', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk11', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط³ط·ط±ظ…ط© ظˆ ط¬ط¨ظ†ظ‡', nameEn: 'Pastrami & Cheese Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ط¨ط³ط·ط±ظ…ط© ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Croissant with pastrami & cheese', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk12', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ظٹط¨ط±ظˆطھظ‰ ظˆ ظ…ظˆطھط²ط§ط±ظٹظ„ط§', nameEn: 'Pepperoni & Mozzarella Croissant', descriptionAr: 'ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ط¨ظٹط¨ط±ظˆظ†ظٹ ظˆط§ظ„ظ…ظˆطھط²ط§ط±ظٹظ„ط§', descriptionEn: 'Croissant with pepperoni & mozzarella', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk13', nameAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ط³طھط±ظ‰ ظƒط±ظٹظ…', nameEn: 'Cigar Croissant Pastry Cream', descriptionAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ط¨ظƒط±ظٹظ…ط© ط§ظ„ط¨ط§ط³طھط±ظٹ', descriptionEn: 'Cigar croissant with pastry cream', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk14', nameAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ط¨ظ„ظˆط¨ظٹط±ظ‰', nameEn: 'Cigar Croissant Blueberry', descriptionAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ط¨ط­ط´ظˆط© ط§ظ„ط¨ظ„ظˆط¨ظٹط±ظٹ', descriptionEn: 'Cigar croissant with blueberry filling', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk15', nameAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ظ†ظˆطھظٹظ„ط§', nameEn: 'Cigar Croissant Nutella', descriptionAr: 'ط³ظٹط¬ط§ط± ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Cigar croissant with Nutella', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk16', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظˆط¨ط±ظٹظ… ط±ظˆظ„ ظ†ظˆطھظٹظ„ط§', nameEn: 'Supreme Roll Nutella', descriptionAr: 'ط±ظˆظ„ ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Supreme croissant roll with Nutella', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk17', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظˆط¨ط±ظٹظ… ط±ظˆظ„ ظ„ظˆطھط³', nameEn: 'Supreme Roll Lotus', descriptionAr: 'ط±ظˆظ„ ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ظ„ظˆطھط³', descriptionEn: 'Supreme croissant roll with Lotus', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk18', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظˆط¨ط±ظٹظ… ط±ظˆظ„ ظƒظٹط¯ط±', nameEn: 'Supreme Roll Kinder', descriptionAr: 'ط±ظˆظ„ ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ظƒظٹظ†ط¯ط±', descriptionEn: 'Supreme croissant roll with Kinder', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk19', nameAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ظˆط¨ط±ظٹظ… ط±ظˆظ„ ط¨ظٹط³طھط§ط´ظٹظˆ', nameEn: 'Supreme Roll Pistachio', descriptionAr: 'ط±ظˆظ„ ظƒط±ظˆط§ط³ظˆظ† ط¨ط§ظ„ط¨ظٹط³طھط§ط´ظٹظˆ', descriptionEn: 'Supreme croissant roll with Pistachio', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk20', nameAr: 'ظپط§ظ†ظٹظ„ط§ ظپظ„ط§ظ† ظƒط±ظٹظ… ط¨ظˆط±ظ„ظٹظ‡', nameEn: 'Vanilla Flan Crأ¨me Brأ»lأ©e', descriptionAr: 'ظپظ„ط§ظ† ظپط§ظ†ظٹظ„ظٹط§ ظƒط±ظٹظ… ط¨ط±ظˆظ„ظٹظ‡ ظپط±ظ†ط³ظٹ', descriptionEn: 'French vanilla flan crأ¨me brأ»lأ©e', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk21', nameAr: 'ط¯ط§ظ†ط´ ظƒط§ط³طھط±ط¯', nameEn: 'Danish Custard', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط­ط´ظˆط© ط§ظ„ظƒط§ط³طھط±ط¯ ط؛ظ†ظٹ', descriptionEn: 'Danish pastry with rich custard', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk22', nameAr: 'ط¯ط§ظ†ط´ ط¬ط¨ظ†ظ‡', nameEn: 'Danish Cheese', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط§ظ„ط¬ط¨ظ†ط© ط§ظ„ظ†ط§ط¹ظ…ط©', descriptionEn: 'Danish pastry with cream cheese', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk23', nameAr: 'ط¯ط§ظ†ط´ طھظپط§ط­ ظˆ ظ‚ط±ظپظ‡', nameEn: 'Danish Apple & Cinnamon', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط§ظ„طھظپط§ط­ ظˆط§ظ„ظ‚ط±ظپط©', descriptionEn: 'Danish pastry with apple & cinnamon', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk24', nameAr: 'ط¯ط§ظ†ط´ ظپط±ط§ظˆظ„ظ‡', nameEn: 'Danish Strawberry', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط§ظ„ظپط±ط§ظˆظ„ط© ط§ظ„ظپط±ظٹط´', descriptionEn: 'Danish pastry with strawberry', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk25', nameAr: 'ط¯ط§ظ†ط´ طھظˆطھ ظ…ط´ظƒظ„', nameEn: 'Danish Mixed Berries', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط§ظ„طھظˆطھ ط§ظ„ظ…ط´ظƒظ„', descriptionEn: 'Danish pastry with mixed berries', price: 95, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk26', nameAr: 'ط¯ط§ظ†ط´ ظ…ط´ظ…ط´', nameEn: 'Danish Apricot', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط­ط´ظˆط© ط§ظ„ظ…ط´ظ…ط´', descriptionEn: 'Danish pastry with apricot', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk27', nameAr: 'ط¯ط§ظ†ط´ ط¨ظٹط³طھط§ط´ظٹظˆ ظˆ ظƒط§ط³طھط±ط¯', nameEn: 'Danish Pistachio & Custard', descriptionAr: 'ط¯ط§ظ†ط´ ط¨ط§ظ„ط¨ظٹط³طھط§ط´ظٹظˆ ظˆط§ظ„ظƒط§ط³طھط±ط¯', descriptionEn: 'Danish pastry with pistachio & custard', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk28', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط´ظˆظƒظˆظ„ط§طھظ‡ ط¨ط§ط³طھط±ظ‰ ظƒط±ظٹظ…', nameEn: 'Pain Suisse Chocolate Pastry Cream', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط´ظˆظƒظˆظ„ط§طھط© ظˆط¨ط§ط³طھط±ظٹ ظƒط±ظٹظ…', descriptionEn: 'Pain suisse with chocolate & pastry cream', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk29', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ظٹط³طھط§ط´ظٹظˆ', nameEn: 'Pain Suisse Pistachio', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„ط¨ظٹط³طھط§ط´ظٹظˆ', descriptionEn: 'Pain suisse with pistachio', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk30', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ظ„ظˆطھط³', nameEn: 'Pain Suisse Lotus', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„ظ„ظˆطھط³', descriptionEn: 'Pain suisse with Lotus', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk31', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ظپط§ظ†ظٹظ„ظٹط§', nameEn: 'Pain Suisse Vanilla', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„ظپط§ظ†ظٹظ„ظٹط§', descriptionEn: 'Pain suisse with vanilla', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk32', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ظƒظˆظ†طھ', nameEn: 'Pain Suisse Count', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ظƒظˆظ†طھ ظپط±ظ†ط³ظٹ', descriptionEn: 'French pain suisse count', price: 95, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk33', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ طھط±ظƒظ‰ ط¬ط¨ظ†ظ‡', nameEn: 'Pain Suisse Turkey & Cheese', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„طھط±ظƒظٹ ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Pain suisse with turkey & cheese', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk34', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ظٹط¨ط±ظˆظ†ظ‰', nameEn: 'Pain Suisse Pepperoni', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„ط¨ظٹط¨ط±ظˆظ†ظٹ', descriptionEn: 'Pain suisse with pepperoni', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk35', nameAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط³ط·ط±ظ…ظ‡ ظˆ ط¬ط¨ظ†ظ‡', nameEn: 'Pain Suisse Pastrami & Cheese', descriptionAr: 'ط¨ط§ظ† ط³ظˆظٹط³ ط¨ط§ظ„ط¨ط³ط·ط±ظ…ط© ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Pain suisse with pastrami & cheese', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk36', nameAr: 'ظ…ظ†ظ‚ظˆط´ظ‡ ط²ط¹طھط±', nameEn: 'Thyme Manakish', descriptionAr: 'ظ…ظ†ظ‚ظˆط´ط© ط¨ط§ظ„ط²ط¹طھط± ظˆط²ظٹطھ ط§ظ„ط²ظٹطھظˆظ†', descriptionEn: 'Thyme & olive oil manakish', price: 80, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk37', nameAr: 'ظ…ظ†ظ‚ظˆط´ظ‡ ط¬ط¨ظ†ظ‡', nameEn: 'Cheese Manakish', descriptionAr: 'ظ…ظ†ظ‚ظˆط´ط© ط¨ط§ظ„ط¬ط¨ظ†ط© ط§ظ„ط´ط§ظ…ظٹ', descriptionEn: 'Cheese manakish', price: 85, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk38', nameAr: 'ظ…ظ†ظ‚ظˆط´ظ‡ ظ…ظٹظƒط³ طھط´ظٹط²', nameEn: 'Mix Cheese Manakish', descriptionAr: 'ظ…ظ†ظ‚ظˆط´ط© ط¨ظ…ظٹظƒط³ ط§ظ„ط£ط¬ط¨ط§ظ†', descriptionEn: 'Mix cheese manakish', price: 90, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk39', nameAr: 'ظ…ظ†ظ‚ظˆط´ظ‡ ط¨ط³ط·ط±ظ…ظ‡ ظˆ ط¬ط¨ظ†ظ‡', nameEn: 'Pastrami & Cheese Manakish', descriptionAr: 'ظ…ظ†ظ‚ظˆط´ط© ط¨ط§ظ„ط¨ط³ط·ط±ظ…ط© ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Pastrami & cheese manakish', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk40', nameAr: 'ظ…ظ†ظ‚ظˆط´ظ‡ ط¨ظٹط±ظˆظ†ظ‰ ظˆ ط¬ط¨ظ†ظ‡', nameEn: 'Pepperoni & Cheese Manakish', descriptionAr: 'ظ…ظ†ظ‚ظˆط´ط© ط¨ط§ظ„ط¨ظٹط¨ط±ظˆظ†ظٹ ظˆط§ظ„ط¬ط¨ظ†ط©', descriptionEn: 'Pepperoni & cheese manakish', price: 120, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk41', nameAr: 'ط±ظˆظ„ ط³ظˆط³ظٹط³', nameEn: 'Sausage Roll', descriptionAr: 'ط±ظˆظ„ ط§ظ„ط³ظˆط³ظٹط³ ط§ظ„ظ…ط®ط¨ظˆط²', descriptionEn: 'Baked sausage roll', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk42', nameAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ظƒظ„ط§ط³ظٹظƒ', nameEn: 'Classic Cinnabon', descriptionAr: 'ط±ظˆظ„ ط§ظ„ظ‚ط±ظپط© ط§ظ„ظƒظ„ط§ط³ظٹظƒظٹ', descriptionEn: 'Classic cinnamon roll', price: 100, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk43', nameAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ظƒط±ط§ظ…ظٹظ„', nameEn: 'Caramel Cinnabon', descriptionAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ظ…ط؛ط·ظ‰ ط¨طµظˆطµ ط§ظ„ظƒط±ط§ظ…ظٹظ„', descriptionEn: 'Cinnamon roll with caramel sauce', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },
  { id: 'bk44', nameAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ظ†ظˆطھظٹظ„ط§', nameEn: 'Nutella Cinnabon', descriptionAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ظ…ط؛ط·ظ‰ ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Cinnamon roll topped with Nutella', price: 110, categoryAr: 'ط§ظ„ظ…ط®ط¨ظˆط²ط§طھ', categoryEn: 'Bakery' },

  // ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط© (Coffee Drinks)
  { id: 'cd1', nameAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط³ظ†ط¬ظ„', nameEn: 'Single Espresso', descriptionAr: 'ط´ظˆطھ ط¥ط³ط¨ط±ظٹط³ظˆ ط؛ظ†ظٹ ط·ط§ط²ط¬', descriptionEn: 'Single shot of fresh specialty espresso', price: 70, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd2', nameAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¯ط§ط¨ظ„', nameEn: 'Double Espresso', descriptionAr: 'ط¯ط§ط¨ظ„ ط´ظˆطھ ط¥ط³ط¨ط±ظٹط³ظˆ ط؛ظ†ظٹ', descriptionEn: 'Double shot of specialty espresso', price: 85, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd3', nameAr: 'ظ…ط§ظƒظٹط§طھظˆ ط³ظ†ط¬ظ„', nameEn: 'Single Macchiato', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط³ظ†ط¬ظ„ ظ…ط¹ ظ†ظ‚ط·ط© ظپظˆظ… ط­ظ„ظٹط¨', descriptionEn: 'Single espresso with milk foam spot', price: 80, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd4', nameAr: 'ظ…ط§ظƒظٹط§طھظˆ ط¯ط§ط¨ظ„', nameEn: 'Double Macchiato', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¯ط§ط¨ظ„ ظ…ط¹ ظ†ظ‚ط·ط© ظپظˆظ… ط­ظ„ظٹط¨', descriptionEn: 'Double espresso with milk foam spot', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd5', nameAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظƒظˆظ† ط¨ط§ظ†ط§', nameEn: 'Espresso Con Panna', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ط§ظ„ظƒط±ظٹظ…ط© ط§ظ„ظ…ط®ظپظˆظ‚ط©', descriptionEn: 'Espresso topped with whipped cream', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd6', nameAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط£ظپظˆظƒط§ط¯ظˆ', nameEn: 'Affogato Espresso', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ط¢ظٹط³ ظƒط±ظٹظ… ظپط§ظ†ظٹظ„ظٹط§', descriptionEn: 'Espresso poured over vanilla ice cream', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd7', nameAr: 'ظƒط§ط¨طھط´ظٹظ†ظˆ', nameEn: 'Cappuccino', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ظپظˆظ… ط§ظ„ط­ظ„ظٹط¨ ط§ظ„ظƒط«ظٹظپ', descriptionEn: 'Espresso with thick steamed milk foam', price: 95, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd8', nameAr: 'ظپظ„ط§طھ ظˆط§ظٹطھ', nameEn: 'Flat White', descriptionAr: 'ط¯ط§ط¨ظ„ ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ظ…ط§ظٹظƒط±ظˆظپظˆظ… ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Double shot espresso with microfoam milk', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd9', nameAr: 'ظƒظˆط±طھظˆ', nameEn: 'Cortado', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…طھظˆط§ط²ظ† ط¨ظ†ط³ط¨ط© ظ…ط³ط§ظˆظٹط© ظ…ظ† ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Equal parts espresso and warm milk', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd10', nameAr: 'ط±ظٹط§ط­ظٹظ† ظ„ط§طھظٹظ‡', nameEn: 'Rayahen Signature Latte', descriptionAr: 'ظ„ط§طھظٹظ‡ ظ…ط¹ ظپظ„ظٹظپط± ط¢ظٹط±ظٹط´ ظƒط±ظٹظ… ظˆظپط§ظ†ظٹظ„ظٹط§', descriptionEn: 'Latte infused with Irish cream & vanilla', price: 110, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks', badgeAr: 'طھظˆظ‚ظٹط¹ ط±ظٹط§ط­ظٹظ†', badgeEn: 'Signature' },
  { id: 'cd11', nameAr: 'ط³ظٹظ†ط§ط¨ظˆظ† ط£ط¨ظ„ ظ„ط§طھظٹظ‡', nameEn: 'Cinnabon Apple Latte', descriptionAr: 'ظ„ط§طھظٹظ‡ ظ…ط¹ ظپظ„ظٹظپط± ظ‚ط±ظپط© ظˆطھظپط§ط­', descriptionEn: 'Latte infused with cinnamon & apple', price: 110, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd12', nameAr: 'ظ…ط§طھط´ط§ ظ„ط§طھظٹظ‡', nameEn: 'Matcha Latte', descriptionAr: 'ظ…ط§طھط´ط§ ظٹط§ط¨ط§ظ†ظٹط© ظپط§ط®ط±ط© ظ…ط¹ ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Premium Japanese matcha with milk', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd13', nameAr: 'ظ…ظˆظƒط§', nameEn: 'Caffأ¨ Mocha', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ط´ظˆظƒظˆظ„ط§طھط© ظˆط­ظ„ظٹط¨', descriptionEn: 'Espresso blended with cocoa & milk', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd14', nameAr: 'ظˆط§ظٹطھ ظ…ظˆظƒط§ ظƒط±ظٹظ…', nameEn: 'White Mocha Cream', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¨ط´ظˆظƒظˆظ„ط§طھط© ط¨ظٹط¶ط§ط، ظˆظƒط±ظٹظ…ط©', descriptionEn: 'Espresso with white chocolate & cream', price: 125, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd15', nameAr: 'ط£ظ…ط±ظٹظƒط§ظ† ظƒظˆظپظٹ', nameEn: 'Americano Coffee', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ظ…ط§ط، ط³ط§ط®ظ†', descriptionEn: 'Espresso diluted with hot water', price: 120, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd16', nameAr: 'ظ†ط³ظƒط§ظپظٹظ‡', nameEn: 'Nescafe', descriptionAr: 'ظ†ط³ظƒط§ظپظٹظ‡ ظƒظ„ط§ط³ظٹظƒ ط¨ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Classic Nescafe with milk', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd17', nameAr: 'ظ‚ظ‡ظˆط© طھط±ظƒظٹ ط³ظ†ط¬ظ„', nameEn: 'Single Turkish Coffee', descriptionAr: 'ظ‚ظ‡ظˆط© طھط±ظƒظٹط© ظ…ط­ظ…طµط© ط·ط§ط²ط¬ط§ظ‹', descriptionEn: 'Freshly roasted Turkish coffee', price: 50, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd18', nameAr: 'ظ‚ظ‡ظˆط© طھط±ظƒظٹ ط¯ط§ط¨ظ„', nameEn: 'Double Turkish Coffee', descriptionAr: 'ط¯ط§ط¨ظ„ ظ‚ظ‡ظˆط© طھط±ظƒظٹط©', descriptionEn: 'Double shot Turkish coffee', price: 80, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd19', nameAr: 'ظ‚ظ‡ظˆط© ظپط±ظ†ط³ط§ظˆظٹ', nameEn: 'French Coffee', descriptionAr: 'ظ‚ظ‡ظˆط© طھط±ظƒظٹط© ط¨ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Turkish coffee prepared with milk', price: 85, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd20', nameAr: 'ظ‚ظ‡ظˆط© ط¨ظ†ط¯ظ‚', nameEn: 'Hazelnut Coffee', descriptionAr: 'ظ‚ظ‡ظˆط© ط¨ظ†ظƒظ‡ط© ط§ظ„ط¨ظ†ط¯ظ‚ ط§ظ„ط؛ظ†ظٹط©', descriptionEn: 'Turkish coffee with hazelnut flavor', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd21', nameAr: 'ظ‚ظ‡ظˆط© ظ†ظˆطھظٹظ„ط§', nameEn: 'Nutella Coffee', descriptionAr: 'ظ‚ظ‡ظˆط© ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Coffee blended with Nutella', price: 95, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },
  { id: 'cd22', nameAr: 'ظ„ط§طھظٹظ‡', nameEn: 'Caffأ¨ Latte', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط¹ ط§ظ„ط­ظ„ظٹط¨ ط§ظ„ظ…ط¨ط®ط±', descriptionEn: 'Espresso with steamed milk', price: 100, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط§ظ„ظ‚ظ‡ظˆط©', categoryEn: 'Coffee Drinks' },

  // ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط© (Hot Drinks)
  { id: 'hd1', nameAr: 'ط´ط§ظٹ', nameEn: 'Classic Red Tea', descriptionAr: 'ط´ط§ظٹ ط£ط­ظ…ط± ظƒظ„ط§ط³ظٹظƒ', descriptionEn: 'Classic red tea', price: 50, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd2', nameAr: 'ط´ط§ظٹ ط£ط®ط¶ط±', nameEn: 'Green Tea', descriptionAr: 'ط´ط§ظٹ ط£ط®ط¶ط± ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Natural green tea', price: 65, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd3', nameAr: 'ط´ط§ظٹ ظپظ„ظٹظپط±', nameEn: 'Flavored Tea', descriptionAr: 'ط´ط§ظٹ ط¨ظ†ظƒظ‡ط§طھ ط§ظ„ظپظˆط§ظƒظ‡ ظ…ظ† ط§ط®طھظٹط§ط±ظƒ', descriptionEn: 'Tea with fruit flavors of choice', price: 70, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd4', nameAr: 'ط´ط§ظٹ ظƒط±ظƒ', nameEn: 'Karak Tea', descriptionAr: 'ط´ط§ظٹ ظƒط±ظƒ ط¨ط§ظ„ط¨ظ‡ط§ط±ط§طھ ظˆط§ظ„ظ„ط¨ظ†', descriptionEn: 'Spiced Karak tea with milk', price: 80, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd5', nameAr: 'ط´ط§ظٹ ط­ظ„ظٹط¨', nameEn: 'Tea with Milk', descriptionAr: 'ط´ط§ظٹ ط£ط­ظ…ط± ط¨ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Red tea with fresh milk', price: 70, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd6', nameAr: 'ط´ط§ظٹ ط²ط±ط¯ط©', nameEn: 'Zarda Tea', descriptionAr: 'ط´ط§ظٹ ط²ط±ط¯ط© ط«ظ‚ظٹظ„ ط¨ط§ظ„ط·ط±ظٹظ‚ط© ط§ظ„طھظ‚ظ„ظٹط¯ظٹط©', descriptionEn: 'Traditional strong Zarda tea', price: 70, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd7', nameAr: 'ظƒظ„ط§ط³ظٹظƒ ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ', nameEn: 'Classic Hot Chocolate', descriptionAr: 'ط´ظˆظƒظˆظ„ط§طھط© ط³ط§ط®ظ†ط© ط¨ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Rich hot chocolate with milk', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd8', nameAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ظ…ط§ط±ط´ظ…ظٹظ„ظˆ', nameEn: 'Hot Chocolate Marshmallow', descriptionAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ظ…ط¹ ظ‚ط·ط¹ ط§ظ„ظ…ط§ط±ط´ظ…ظ„ظˆ', descriptionEn: 'Hot chocolate topped with marshmallows', price: 125, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd9', nameAr: 'ظˆط§ظٹطھ ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ', nameEn: 'White Hot Chocolate', descriptionAr: 'ط´ظˆظƒظˆظ„ط§طھط© ط¨ظٹط¶ط§ط، ط³ط§ط®ظ†ط©', descriptionEn: 'Creamy white hot chocolate', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd10', nameAr: 'ظ‡ظˆطھ ط³ظٹط¯ط±', nameEn: 'Hot Apple Cider', descriptionAr: 'ط¹طµظٹط± طھظپط§ط­ ط³ط§ط®ظ† ظ…ط¹ ط§ظ„ظ‚ط±ظپط©', descriptionEn: 'Hot apple juice infused with cinnamon', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd11', nameAr: 'ط³ط­ظ„ط¨', nameEn: 'Traditional Sahlab', descriptionAr: 'ط³ط­ظ„ط¨ ط³ط§ط®ظ† ط¨ط§ظ„ظ…ظƒط³ط±ط§طھ ظˆط§ظ„ظ‚ط±ظپط©', descriptionEn: 'Warm sahlab topped with nuts & cinnamon', price: 110, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd12', nameAr: 'ظƒظˆظƒطھظٹظ„ ط£ط¹ط´ط§ط¨', nameEn: 'Herbal Cocktail', descriptionAr: 'ظٹط§ظ†ط³ظˆظ†طŒ ظ†ط¹ظ†ط§ط¹طŒ ظ„ظٹظ…ظˆظ†طŒ ط¹ط³ظ„طŒ ظ‚ط±ظپط©', descriptionEn: 'Anise, mint, lemon, honey & cinnamon', price: 90, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd13', nameAr: 'ط£ط¹ط´ط§ط¨ ط±ظٹط§ط­ظٹظ†', nameEn: 'Rayahen Immunity Herbs', descriptionAr: 'ط¨ط±طھظ‚ط§ظ„ ظپط±ظٹط´طŒ ط²ظ†ط¬ط¨ظٹظ„ ظپط±ظٹط´طŒ ظ‚ط±ظپط©طŒ ط¹ط³ظ„', descriptionEn: 'Fresh orange, fresh ginger, cinnamon & honey', price: 105, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks', badgeAr: 'ظ…ظ†ط§ط¹ط©', badgeEn: 'Immunity' },
  { id: 'hd14', nameAr: 'ط£ط¹ط´ط§ط¨ (ط¨ط§ظƒظٹطھ ظ…ظ† ط§ط®طھظٹط§ط±ظƒ)', nameEn: 'Herbal Tea Bag Choice', descriptionAr: 'ط¨ط§ظƒظٹطھ ظ…ظ† ط§ط®طھظٹط§ط±ظƒ', descriptionEn: 'Herbal tea bag of your choice', price: 70, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },
  { id: 'hd15', nameAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ط£ظˆط±ظٹظˆ', nameEn: 'Hot Chocolate Oreo', descriptionAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ظ…ط¹ ظ‚ط·ط¹ ط£ظˆط±ظٹظˆ', descriptionEn: 'Hot chocolate blended with crushed Oreo', price: 125, categoryAr: 'ظ…ط´ط±ظˆط¨ط§طھ ط³ط§ط®ظ†ط©', categoryEn: 'Hot Drinks' },

  // ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ (Milkshakes & Smoothies)
  { id: 'ms1', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظپط§ظ†ظٹظ„ظٹط§', nameEn: 'Vanilla Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظپط§ظ†ظٹظ„ظٹط§ ظƒط±ظٹظ…ظٹ', descriptionEn: 'Creamy vanilla milkshake', price: 105, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms2', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط´ظˆظƒظ„ظٹطھ', nameEn: 'Chocolate Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط´ظˆظƒظˆظ„ط§طھط©', descriptionEn: 'Decadent chocolate milkshake', price: 105, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms3', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ…ط§ظ†ط¬ظˆ', nameEn: 'Mango Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ…ط§ظ†ط¬ظˆ ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh mango milkshake', price: 105, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms4', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظپط±ط§ظˆظ„ط©', nameEn: 'Strawberry Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظپط±ط§ظˆظ„ط©', descriptionEn: 'Fresh strawberry milkshake', price: 105, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms5', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط£ظˆط±ظٹظˆ', nameEn: 'Oreo Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط£ظˆط±ظٹظˆ ط¨ظ‚ط·ط¹ ط§ظ„ط£ظˆط±ظٹظˆ', descriptionEn: 'Oreo milkshake with crushed biscuits', price: 125, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms6', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط²ط¨ط§ط¯ظٹ طھظˆطھ', nameEn: 'Yogurt Berry Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط²ط¨ط§ط¯ظٹ ظ…ط¹ ط§ظ„طھظˆطھ', descriptionEn: 'Yogurt milkshake with mixed berries', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms7', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ„ظˆطھط³', nameEn: 'Lotus Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ط²ط¨ط¯ط© ط§ظ„ظ„ظˆطھط³', descriptionEn: 'Milkshake with Lotus Biscoff spread', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms8', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ†ظˆطھظٹظ„ط§', nameEn: 'Nutella Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Rich Nutella milkshake', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms9', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظƒط±ط§ظ…ظٹظ„', nameEn: 'Caramel Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨طµظˆطµ ط§ظ„ظƒط±ط§ظ…ظٹظ„', descriptionEn: 'Creamy caramel milkshake', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms10', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ظ„ظˆط¨ظٹط±ظٹ', nameEn: 'Blueberry Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ط§ظ„ط¨ظ„ظˆط¨ظٹط±ظٹ', descriptionEn: 'Blueberry milkshake', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms11', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ…ط³طھظƒط©', nameEn: 'Mastic Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ظ†ظƒظ‡ط© ط§ظ„ظ…ط³طھظƒط© ط§ظ„ظٹظˆظ†ط§ظ†ظٹط©', descriptionEn: 'Traditional Greek mastic flavored milkshake', price: 125, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms12', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ…ط§طھط´ط§', nameEn: 'Matcha Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط§ظ„ظ…ط§طھط´ط§ ط§ظ„ظپط§ط®ط±ط©', descriptionEn: 'Premium Japanese matcha milkshake', price: 125, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms13', nameAr: 'ط³ظ…ظˆط²ظٹ ظ…ط§ظ†ط¬ظˆ', nameEn: 'Mango Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ظ…ط§ظ†ط¬ظˆ ظپط±ظٹط´ ظ…ط«ظ„ط¬', descriptionEn: 'Refreshing icy mango smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms14', nameAr: 'ط³ظ…ظˆط²ظٹ ظپط±ط§ظˆظ„ط©', nameEn: 'Strawberry Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ظپط±ط§ظˆظ„ط© ظپط±ظٹط´ ظ…ط«ظ„ط¬', descriptionEn: 'Icy strawberry smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms15', nameAr: 'ط³ظ…ظˆط²ظٹ ط¨ظ„ظˆط¨ظٹط±ظٹ', nameEn: 'Blueberry Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط¨ظ„ظˆط¨ظٹط±ظٹ', descriptionEn: 'Blueberry icy smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms16', nameAr: 'ط³ظ…ظˆط²ظٹ ط¨ط·ظٹط®', nameEn: 'Watermelon Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط¨ط·ظٹط® ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh watermelon smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms17', nameAr: 'ط³ظ…ظˆط²ظٹ ظƒظˆظ„ط§', nameEn: 'Cola Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط§ظ„ظƒظˆظ„ط§ ط§ظ„ظ…ظ†ط¹ط´', descriptionEn: 'Refreshing icy cola smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms18', nameAr: 'ط³ظ…ظˆط²ظٹ ط¨ط§ط´ظˆظ† ظپط±ظˆطھ', nameEn: 'Passion Fruit Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط¨ط§ط´ظˆظ† ظپط±ظˆطھ ط§ط³طھظˆط§ط¦ظٹ', descriptionEn: 'Tropical passion fruit smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms19', nameAr: 'ط³ظ…ظˆط²ظٹ ظ„ظٹظ…ظˆظ†', nameEn: 'Lemon Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ظ„ظٹظ…ظˆظ† ظپط±ظٹط´', descriptionEn: 'Fresh icy lemon smoothie', price: 95, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms20', nameAr: 'ط³ظ…ظˆط²ظٹ ظ„ظٹظ…ظˆظ† ظ†ط¹ظ†ط§ط¹', nameEn: 'Mint Lemonade Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ظ„ظٹظ…ظˆظ† ط¨ط§ظ„ظ†ط¹ظ†ط§ط¹', descriptionEn: 'Mint lemonade icy smoothie', price: 100, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms21', nameAr: 'ط³ظ…ظˆط²ظٹ ط¬ط±ظٹظ† ط£ط¨ظ„', nameEn: 'Green Apple Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط§ظ„طھظپط§ط­ ط§ظ„ط£ط®ط¶ط±', descriptionEn: 'Green apple smoothie', price: 100, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms22', nameAr: 'ط³ظ…ظˆط²ظٹ ظƒظٹظˆظٹ ط£ط¨ظ„ ظ…ظ†طھ', nameEn: 'Kiwi Apple Mint Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ظƒظٹظˆظٹ ظˆطھظپط§ط­ ظˆظ†ط¹ظ†ط§ط¹', descriptionEn: 'Kiwi, green apple & fresh mint smoothie', price: 130, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms23', nameAr: 'ط³ظ…ظˆط²ظٹ ط±ط§ط³ ط¨ظٹط±ظٹ', nameEn: 'Raspberry Smoothie', descriptionAr: 'ط³ظ…ظˆط²ظٹ ط§ظ„طھظˆطھ ط§ظ„ط£ط­ظ…ط±', descriptionEn: 'Red raspberry smoothie', price: 110, categoryAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظˆط³ظ…ظˆط²ظٹ', categoryEn: 'Milkshakes & Smoothies' },

  // ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ (Frappes & Iced Coffee)
  { id: 'fc1', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ظ…ط§طھط´ط§', nameEn: 'Matcha Frappأ©', descriptionAr: 'ظ…ط§طھط´ط§ ظ…ط«ظ„ط¬ط© ظ…ظپظ‚ظˆظ‚ط© ظ…ط¹ ط§ظ„ظƒط±ظٹظ…ط©', descriptionEn: 'Blended icy matcha frappe with cream', price: 125, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc2', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ط£ظˆط±ظٹظˆ', nameEn: 'Oreo Frappأ©', descriptionAr: 'ظپط±ط§ط¨ظٹظ‡ ظ…ط«ظ„ط¬ ط¨ظ‚ط·ط¹ ط§ظ„ط£ظˆط±ظٹظˆ ظˆط§ظ„ظƒط±ظٹظ…ط©', descriptionEn: 'Blended Oreo frappe with whipped cream', price: 125, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc3', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ظƒظ„ط§ط³ظٹظƒ', nameEn: 'Classic Coffee Frappأ©', descriptionAr: 'ظپط±ط§ط¨ظٹظ‡ ظ‚ظ‡ظˆط© ظ…ط«ظ„ط¬ ظƒظ„ط§ط³ظٹظƒ', descriptionEn: 'Classic blended icy coffee frappe', price: 110, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc4', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ط´ظˆظƒظ„ظٹطھ', nameEn: 'Chocolate Frappأ©', descriptionAr: 'ظپط±ط§ط¨ظٹظ‡ ط´ظˆظƒظˆظ„ط§طھط© ظ…ط«ظ„ط¬', descriptionEn: 'Blended chocolate frappe', price: 110, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc5', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ظƒط±ط§ظ…ظٹظ„', nameEn: 'Caramel Frappأ©', descriptionAr: 'ظپط±ط§ط¨ظٹظ‡ ظƒط±ط§ظ…ظٹظ„ ظ…ط«ظ„ط¬', descriptionEn: 'Blended caramel frappe', price: 110, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc6', nameAr: 'ظپط±ط§ط¨ظٹظ‡ ط³ظˆظ„طھظٹط¯ ظƒط±ط§ظ…ظٹظ„', nameEn: 'Salted Caramel Frappأ©', descriptionAr: 'ظپط±ط§ط¨ظٹظ‡ ظƒط±ط§ظ…ظٹظ„ ظ…ظ…ظ„ط­', descriptionEn: 'Blended salted caramel frappe', price: 120, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc7', nameAr: 'ط¢ظٹط³ ظ„ط§طھظٹظ‡', nameEn: 'Iced Caffأ¨ Latte', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¨ط§ط±ط¯ ظ…ط¹ ط§ظ„ط­ظ„ظٹط¨ ظˆط§ظ„ط«ظ„ط¬', descriptionEn: 'Chilled espresso with cold milk & ice', price: 105, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc8', nameAr: 'ط¢ظٹط³ ظƒط§ط¨طھط´ظٹظ†ظˆ', nameEn: 'Iced Cappuccino', descriptionAr: 'ظƒط§ط¨طھط´ظٹظ†ظˆ ط¨ط§ط±ط¯ ظ…ط¹ ظپظˆظ… ط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Chilled cappuccino with cold foam', price: 105, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc9', nameAr: 'ط¢ظٹط³ ظ…ظˆظƒط§', nameEn: 'Iced Caffأ¨ Mocha', descriptionAr: 'ظ…ظˆظƒط§ ط¨ط§ط±ط¯ط© ط¨ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ظˆط§ظ„ط«ظ„ط¬', descriptionEn: 'Chilled espresso with chocolate & milk', price: 110, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc10', nameAr: 'ط¢ظٹط³ ط³ط¨ط§ظ†ط´ ظ„ط§طھظٹظ‡', nameEn: 'Iced Spanish Latte', descriptionAr: 'ط³ط¨ط§ظ†ط´ ظ„ط§طھظٹظ‡ ط¨ط§ط±ط¯ ظ…ط¹ ط§ظ„ط­ظ„ظٹط¨ ط§ظ„ظ…ط­ظ„ظ‰', descriptionEn: 'Chilled espresso with sweetened milk', price: 125, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee', badgeAr: 'ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ط§ظ‹', badgeEn: 'Best Seller' },
  { id: 'fc11', nameAr: 'ط¢ظٹط³ ظ…ط§طھط´ط§ ظ„ط§طھظٹظ‡', nameEn: 'Iced Matcha Latte', descriptionAr: 'ظ…ط§طھط´ط§ ط¨ط§ط±ط¯ط© ظ…ط¹ ط§ظ„ط­ظ„ظٹط¨ ظˆط§ظ„ط«ظ„ط¬', descriptionEn: 'Chilled Japanese matcha with cold milk', price: 125, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc12', nameAr: 'ط¢ظٹط³ ظƒط±ط§ظ…ظٹظ„ ظ…ط§ظƒظٹط§طھظˆ', nameEn: 'Iced Caramel Macchiato', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¨ط§ط±ط¯ ظ…ط¹ ظپظ„ظٹظپط± ط§ظ„ظƒط±ط§ظ…ظٹظ„', descriptionEn: 'Chilled espresso with vanilla & caramel drizzle', price: 125, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc13', nameAr: 'ط¢ظٹط³ ط£ظ…ط±ظٹظƒط§ظ†ظˆ', nameEn: 'Iced Americano', descriptionAr: 'ط¥ط³ط¨ط±ظٹط³ظˆ ط¨ط§ط±ط¯ ظ…ط¹ ظ…ط§ط، ظ…ط«ظ„ط¬', descriptionEn: 'Chilled espresso over cold water & ice', price: 100, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc14', nameAr: 'ط¢ظٹط³ ظ…ط§طھط´ط§', nameEn: 'Iced Pure Matcha', descriptionAr: 'ظ…ط§طھط´ط§ ظ…ط«ظ„ط¬ط© ط®ط§ظپظٹط© ط¨ط¯ظˆظ† ط­ظ„ظٹط¨', descriptionEn: 'Chilled pure matcha over ice', price: 110, categoryAr: 'ظپط±ط§ط¨ظٹظ‡ ظˆط¢ظٹط³ ظƒظˆظپظٹ', categoryEn: 'Frappes & Iced Coffee' },

  // ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط² (Nuts & Bubbles)
  { id: 'nb1', nameAr: 'ط¨ط³طھط§ط´ظٹظˆ ظ„ط§طھظٹظ‡', nameEn: 'Pistachio Latte', descriptionAr: 'ظ„ط§طھظٹظ‡ ظ…ط¹ طµظˆطµ ط¨ط³طھط§ط´ظٹظˆ ظˆظƒط±ظٹظ…ط© ظˆظپط³طھظ‚ ظ…ط¬ط±ظˆط´', descriptionEn: 'Latte with pistachio sauce, cream & crushed pistachios', price: 135, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles', badgeAr: 'ظپط§ط®ط±', badgeEn: 'Luxury' },
  { id: 'nb2', nameAr: 'ظ…ظˆظƒط§ ظ†ط§طھط³', nameEn: 'Mocha Nuts', descriptionAr: 'ظ…ظˆظƒط§ ظ…ط¹ ظپظ„ظٹظپط± ط¨ظ†ط¯ظ‚ ظˆظƒط±ظٹظ…ط© ظˆط¨ظ†ط¯ظ‚ ظ…ط¬ط±ظˆط´', descriptionEn: 'Mocha with hazelnut syrup, cream & crushed hazelnuts', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb3', nameAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ط¨ظ†ط¯ظ‚', nameEn: 'Hazelnut Hot Chocolate', descriptionAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ظ…ط¹ ط§ظ„ط¨ظ†ط¯ظ‚ ظˆط§ظ„ظ…ظƒط³ط±ط§طھ', descriptionEn: 'Hot chocolate infused with hazelnut & nuts', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb4', nameAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ط£ظˆط±ظٹظˆ ظ†ط§طھط³', nameEn: 'Oreo Nuts Hot Chocolate', descriptionAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ظ…ط¹ ط£ظˆط±ظٹظˆ ظˆظ…ظƒط³ط±ط§طھ', descriptionEn: 'Hot chocolate with Oreo & crushed nuts', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb5', nameAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ طھظٹط±ط§ظ…ظٹط³ظˆ', nameEn: 'Tiramisu Hot Chocolate', descriptionAr: 'ظ‡ظˆطھ ط´ظˆظƒظ„ظٹطھ ط¨ظ†ظƒظ‡ط© ط§ظ„طھظٹط±ط§ظ…ظٹط³ظˆ ظˆط§ظ„ظ‚ظ‡ظˆط©', descriptionEn: 'Hot chocolate infused with tiramisu flavor', price: 140, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb6', nameAr: 'ط¨ط³طھط§ط´ظٹظˆ (ط·ط¨ظ‚ ط£ظپظˆظƒط§ط¯ظˆ ظˆظپط³طھظ‚)', nameEn: 'Pistachio Avocado Bowl', descriptionAr: 'ط£ظپظˆظƒط§ط¯ظˆطŒ ظ…ظˆط²طŒ ط¢ظٹط³ ظپط³طھظ‚ ط¥ظٹط·ط§ظ„ظٹطŒ ظ…ظƒط³ط±ط§طھطŒ ط¹ط³ظ„', descriptionEn: 'Avocado, banana, Italian pistachio ice cream, nuts & honey', price: 150, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles', badgeAr: 'ط³ظˆط¨ط± ط؛ظ†ظٹ', badgeEn: 'Super Rich' },
  { id: 'nb7', nameAr: 'طھط§ظ‡ظٹطھظٹ', nameEn: 'Tahiti Bowl', descriptionAr: 'ط£ظپظˆظƒط§ط¯ظˆطŒ ظ…ط§ظ†ط¬ظˆطŒ ظ…ظƒط³ط±ط§طھطŒ ط¹ط³ظ„', descriptionEn: 'Avocado, mango, nuts & honey', price: 150, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb8', nameAr: 'ط£ظپظˆظ†ط§طھط³', nameEn: 'Avonuts Bowl', descriptionAr: 'ط£ظپظˆظƒط§ط¯ظˆطŒ ظƒظٹظˆظٹطŒ ظ…ظƒط³ط±ط§طھطŒ ط¹ط³ظ„', descriptionEn: 'Avocado, kiwi, nuts & honey', price: 150, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb9', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظپط³طھظ‚', nameEn: 'Pistachio Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ط§ظ„ظپط³طھظ‚ ط§ظ„ط¥ظٹط·ط§ظ„ظٹ ظˆط§ظ„ظ…ظƒط³ط±ط§طھ', descriptionEn: 'Milkshake with Italian pistachio & nuts', price: 140, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb10', nameAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ظ…ظƒط³ط±ط§طھ', nameEn: 'Mixed Nuts Milkshake', descriptionAr: 'ظ…ظٹظ„ظƒ ط´ظٹظƒ ط¨ظ…ظٹظƒط³ ط§ظ„ظ…ظƒط³ط±ط§طھ ط§ظ„ظ…ط­ظ…طµط© ظˆط§ظ„ط¹ط³ظ„', descriptionEn: 'Milkshake loaded with mixed roasted nuts & honey', price: 140, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb11', nameAr: 'ظ…ط§ظ†ط¬ظˆ ط¨ط§ط¨ظ„ط²', nameEn: 'Mango Bubbles', descriptionAr: 'ظ…ط§ظ†ط¬ظˆ ظپط±ظٹط´ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط² ط§ظ„ظ…ظ†ط¹ط´ط©', descriptionEn: 'Fresh mango with popping boba bubbles', price: 110, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb12', nameAr: 'ظƒظˆظ„ط¯ ط¨ط§ط¨ظ„ط²', nameEn: 'Cold Bubbles Soda', descriptionAr: 'طµظˆط¯ط§ ط¨ط§ط±ط¯ط© ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Chilled soda with boba bubbles', price: 110, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb13', nameAr: 'ظٹظˆط¬ط§ط±طھ ط¨ظٹط±ظٹ ط¨ط§ط¨ظ„ط²', nameEn: 'Yogurt Berry Bubbles', descriptionAr: 'ط²ط¨ط§ط¯ظٹ ط¨ط§ظ„طھظˆطھ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Berry yogurt drink with popping boba', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb14', nameAr: 'طھط±ظˆط¨ظٹظƒط§ظ„ ط¨ط§ط¨ظ„ط²', nameEn: 'Tropical Bubbles', descriptionAr: 'ط¹طµظٹط± ط§ط³طھظˆط§ط¦ظٹ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Tropical juice with popping boba bubbles', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb15', nameAr: 'ظ…ط§طھط´ط§ ط¨ط§ط¨ظ„ط²', nameEn: 'Matcha Bubbles', descriptionAr: 'ظ…ط§طھط´ط§ ظ…ط«ظ„ط¬ط© ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Iced matcha with boba bubbles', price: 130, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb16', nameAr: 'ط¢ظٹط³ طھظٹ ط¨ط§ط¨ظ„ط²', nameEn: 'Iced Tea Bubbles', descriptionAr: 'ط¢ظٹط³ طھظٹ ظ…ط«ظ„ط¬ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Iced tea with popping boba bubbles', price: 105, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb17', nameAr: 'ظ…ظˆظ‡ظٹطھظˆ ط¨ط§ط¨ظ„', nameEn: 'Mojito Bubbles', descriptionAr: 'ظ…ظˆظ‡ظٹطھظˆ ظ…ظ†ط¹ط´ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Refreshing mojito with popping boba', price: 125, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb18', nameAr: 'ط±ظٹط¯ط¨ظ„ ط¨ط§ط¨ظ„ط²', nameEn: 'Red Bull Bubbles', descriptionAr: 'ط±ظٹط¯ط¨ظˆظ„ ظ…ط«ظ„ط¬ ظ…ط¹ ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط²', descriptionEn: 'Red Bull energy drink with popping boba', price: 150, categoryAr: 'ظ†ط§طھط³ ظˆط¨ط§ط¨ظ„ط²', categoryEn: 'Nuts & Bubbles' },

  // ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§ (Cocktails & Soda)
  { id: 'cs1', nameAr: 'ظپظ„ظˆط±ظٹط¯ط§', nameEn: 'Florida Cocktail', descriptionAr: 'ظ…ط§ظ†ط¬ظˆطŒ ظپط±ط§ظˆظ„ط©طŒ ظ…ظˆط²', descriptionEn: 'Fresh mango, strawberry & banana', price: 110, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda' },
  { id: 'cs2', nameAr: 'طµظ† ط´ط§ظٹظ†', nameEn: 'Sunshine Mojito', descriptionAr: 'ط³ظپظ†طŒ ظ†ط¹ظ†ط§ط¹طŒ ط´ط±ط§ط¦ط­ ظ„ظٹظ…ظˆظ†طŒ ظ†ط¹ظ†ط§ط¹ ظپط±ظٹط´', descriptionEn: '7Up, mint, lemon slices & fresh mint leaves', price: 105, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda' },
  { id: 'cs3', nameAr: 'ظ…ط§ظ†ط¬ظˆ ظƒظٹظˆظٹ', nameEn: 'Mango Kiwi Cocktail', descriptionAr: 'ط¹طµظٹط± ظ…ط§ظ†ط¬ظˆ ظپط±ظٹط´ ظ…ط¹ ظ‚ط·ط¹ ط§ظ„ظƒظٹظˆظٹ', descriptionEn: 'Fresh mango juice with kiwi slices', price: 125, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda' },
  { id: 'cs4', nameAr: 'ط²ط¨ط§ط¯ظٹ ط¹ط³ظ„', nameEn: 'Yogurt with Honey', descriptionAr: 'ظ…ط´ط±ظˆط¨ ط§ظ„ط²ط¨ط§ط¯ظٹ ط§ظ„ط·ط¨ظٹط¹ظٹ ط¨ط§ظ„ط¹ط³ظ„', descriptionEn: 'Fresh yogurt drink with natural honey', price: 100, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda' },
  { id: 'cs5', nameAr: 'ط²ط¨ط§ط¯ظٹ ظپظˆط§ظƒظ‡', nameEn: 'Fruit Yogurt Drink', descriptionAr: 'ط²ط¨ط§ط¯ظٹ ظ…ط¹ ط¹طµط§ط¦ط± ظپظˆط§ظƒظ‡ ظپط±ظٹط´', descriptionEn: 'Fresh yogurt with natural fruit juices', price: 125, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda' },
  { id: 'cs6', nameAr: 'ط±ظٹط¯ ط¨ظˆظ„ ط¥ظ†ط±ط¬ظٹ', nameEn: 'Red Bull Energy Shot', descriptionAr: 'ط±ظٹط¯ ط¨ظˆظ„طŒ ط¥ط³ط¨ط±ظٹط³ظˆطŒ ط¢ظٹط±ظٹط´ ظƒط±ظٹظ…', descriptionEn: 'Red Bull energy drink, espresso shot & Irish cream', price: 150, categoryAr: 'ظƒظˆظƒطھظٹظ„ ظپط±ظٹط´ ظˆطµظˆط¯ط§', categoryEn: 'Cocktails & Soda', badgeAr: 'ط·ط§ظ‚ط© ظ…ط¶ط§ط¹ظپط©', badgeEn: 'Double Energy' },

  // ط¹طµط§ط¦ط± ظپط±ظٹط´ (Fresh Juices)
  { id: 'fj1', nameAr: 'ط¨ط±طھظ‚ط§ظ„', nameEn: 'Fresh Orange Juice', descriptionAr: 'ط¹طµظٹط± ط¨ط±طھظ‚ط§ظ„ ط·ط¨ظٹط¹ظٹ ظپط±ظٹط´ 100%', descriptionEn: '100% fresh squeezed orange juice', price: 85, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj2', nameAr: 'ظ…ط§ظ†ط¬ظˆ', nameEn: 'Fresh Mango Juice', descriptionAr: 'ط¹طµظٹط± ظ…ط§ظ†ط¬ظˆ ظپط±ظٹط´ ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh natural mango juice', price: 100, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj3', nameAr: 'ظپط±ط§ظˆظ„ط©', nameEn: 'Fresh Strawberry Juice', descriptionAr: 'ط¹طµظٹط± ظپط±ط§ظˆظ„ط© ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh strawberry juice', price: 90, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj4', nameAr: 'ط¬ظˆط§ظپط©', nameEn: 'Fresh Guava Juice', descriptionAr: 'ط¹طµظٹط± ط¬ظˆط§ظپط© ظپط±ظٹط´', descriptionEn: 'Fresh guava juice', price: 90, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj5', nameAr: 'ط±ظ…ط§ظ†', nameEn: 'Fresh Pomegranate Juice', descriptionAr: 'ط¹طµظٹط± ط±ظ…ط§ظ† ظپط±ظٹط´', descriptionEn: 'Fresh pomegranate juice', price: 90, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj6', nameAr: 'ظ„ظٹظ…ظˆظ†', nameEn: 'Fresh Lemon Juice', descriptionAr: 'ط¹طµظٹط± ظ„ظٹظ…ظˆظ† ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh lemon juice', price: 70, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj7', nameAr: 'ط¨ط·ظٹط®', nameEn: 'Fresh Watermelon Juice', descriptionAr: 'ط¹طµظٹط± ط¨ط·ظٹط® ظپط±ظٹط´', descriptionEn: 'Fresh watermelon juice', price: 90, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj8', nameAr: 'ظƒظٹظˆظٹ', nameEn: 'Fresh Kiwi Juice', descriptionAr: 'ط¹طµظٹط± ظƒظٹظˆظٹ ظپط±ظٹط´ ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh kiwi juice', price: 165, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj9', nameAr: 'ظ„ظٹظ…ظˆظ† ظ†ط¹ظ†ط§ط¹', nameEn: 'Fresh Lemon Mint Juice', descriptionAr: 'ط¹طµظٹط± ظ„ظٹظ…ظˆظ† ط¨ط§ظ„ظ†ط¹ظ†ط§ط¹ ط§ظ„ظپط±ظٹط´', descriptionEn: 'Fresh lemon mint juice', price: 80, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj10', nameAr: 'ط¨ط·ظٹط® ظ†ط¹ظ†ط§ط¹', nameEn: 'Watermelon Mint Juice', descriptionAr: 'ط¹طµظٹط± ط¨ط·ظٹط® ط¨ط§ظ„ظ†ط¹ظ†ط§ط¹ ط§ظ„ظپط±ظٹط´', descriptionEn: 'Fresh watermelon juice with mint', price: 105, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj11', nameAr: 'ط¨ط±طھظ‚ط§ظ„ ظ†ط¹ظ†ط§ط¹', nameEn: 'Orange Mint Juice', descriptionAr: 'ط¹طµظٹط± ط¨ط±طھظ‚ط§ظ„ ط¨ط§ظ„ظ†ط¹ظ†ط§ط¹ ط§ظ„ظپط±ظٹط´', descriptionEn: 'Fresh orange juice with mint', price: 95, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj12', nameAr: 'ط²ط¨ط§ط¯ظٹ', nameEn: 'Fresh Yogurt Drink', descriptionAr: 'ظ…ط´ط±ظˆط¨ ط²ط¨ط§ط¯ظٹ ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Fresh natural yogurt drink', price: 105, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },
  { id: 'fj13', nameAr: 'ط£ظپظˆظƒط§ط¯ظˆ', nameEn: 'Fresh Avocado Juice', descriptionAr: 'ط¹طµظٹط± ط£ظپظˆظƒط§ط¯ظˆ ظپط±ظٹط´ ط¨ط§ظ„ط¹ط³ظ„ ظˆط§ظ„ظ…ظƒط³ط±ط§طھ', descriptionEn: 'Fresh avocado blended with honey & nuts', price: 165, categoryAr: 'ط¹طµط§ط¦ط± ظپط±ظٹط´', categoryEn: 'Fresh Juices' },

  // ط§ظ„ط­ظ„ظˆ (Desserts)
  { id: 'ds1', nameAr: 'ظ…ظˆظ„طھظ†', nameEn: 'Molten Cake', descriptionAr: 'ظ…ظˆظ„طھظ† ظƒظٹظƒ ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ط§ظ„ط¯ط§ظپط¦ط©', descriptionEn: 'Warm chocolate molten lava cake', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds2', nameAr: 'ط¨ط±ط§ظˆظ†ظٹط²', nameEn: 'Chocolate Brownie', descriptionAr: 'ط¨ط±ط§ظˆظ†ظٹط² ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ط§ظ„ط؛ظ†ظٹط©', descriptionEn: 'Fudgy chocolate brownie', price: 105, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds3', nameAr: 'طھط´ظٹط² ظƒظٹظƒ', nameEn: 'Cheesecake', descriptionAr: 'طھط´ظٹط² ظƒظٹظƒ ظƒظ„ط§ط³ظٹظƒ', descriptionEn: 'Classic cheesecake', price: 105, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds4', nameAr: 'ظƒظٹظƒ ظپط³طھظ‚', nameEn: 'Pistachio Cake', descriptionAr: 'ظƒظٹظƒ ط§ظ„ظپط³طھظ‚ ط§ظ„ط¥ظٹط·ط§ظ„ظٹ', descriptionEn: 'Pistachio cake slice', price: 125, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds5', nameAr: 'ط±ظٹط¯ ظپظ„ظپظٹطھ', nameEn: 'Red Velvet Cake', descriptionAr: 'ظƒظٹظƒ ط±ظٹط¯ ظپظ„ظپظٹطھ ط§ظ„ظƒظ„ط§ط³ظٹظƒظٹ', descriptionEn: 'Red velvet cake slice', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds6', nameAr: 'ظپط§ط¯ط¬', nameEn: 'Chocolate Fudge Cake', descriptionAr: 'ظƒظٹظƒ ط´ظˆظƒظˆظ„ط§طھط© ظپط§ط¯ط¬ ط؛ظ†ظٹ', descriptionEn: 'Rich chocolate fudge cake', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds7', nameAr: 'ظƒظٹظƒ ط±ظٹط§ط­ظٹظ†', nameEn: 'Rayahen Signature Cake', descriptionAr: 'ظƒظٹظƒط© ط±ظٹط§ط­ظٹظ† ط§ظ„ظ…طھظ…ظٹط²ط© ط§ظ„ط®ط§طµط©', descriptionEn: 'Rayahen special house cake', price: 100, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts', badgeAr: 'ط®ط§طµ ط¨ط±ظٹط§ط­ظٹظ†', badgeEn: 'Special' },
  { id: 'ds8', nameAr: 'ظƒظˆط¨ ط¬ط§ظƒ', nameEn: 'Jack Cup Dessert', descriptionAr: 'ط­ظ„ظˆظ‰ ظƒظˆط¨ ط¬ط§ظƒ ط§ظ„ط؛ظ†ظٹط©', descriptionEn: 'Jack cup dessert blend', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds9', nameAr: 'ظپط±ظˆطھ ط³ظ„ط§ط¯', nameEn: 'Fresh Fruit Salad', descriptionAr: 'ط³ظ„ط·ط© ظپظˆط§ظƒظ‡ ظ…ظˆط³ظ…ظٹط© ط·ط§ط²ط¬ط©', descriptionEn: 'Fresh seasonal fruit salad', price: 100, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds10', nameAr: 'ظˆط§ظپظ„ ظˆطھط´', nameEn: 'Waffle-Witch', descriptionAr: 'ظˆط§ظپظ„ ظˆطھط´ ظ…ط­ط´ظˆ ظˆظ…ط؛ط·ظ‰ ط¨ط§ظ„ط´ظˆظƒظˆظ„ط§طھط©', descriptionEn: 'Waffle-witch loaded with chocolate', price: 125, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds11', nameAr: 'ظˆط§ظپظ„', nameEn: 'Classic Belgian Waffle', descriptionAr: 'ظˆط§ظپظ„ ط¨ظ„ط¬ظٹظƒظٹ ط¯ط§ظپط¦ ظ…ط¹ ط§ظ„طµظˆطµط§طھ', descriptionEn: 'Warm Belgian waffle with toppings', price: 125, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds12', nameAr: 'ظƒظˆظƒظٹط²', nameEn: 'Fresh Cookies', descriptionAr: 'ظƒظˆظƒظٹط² ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ط§ظ„ط·ط§ط²ط¬', descriptionEn: 'Freshly baked chocolate chip cookie', price: 70, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds13', nameAr: 'ط¨ط±ط§ظˆظ†ظٹط² ظ…ظƒط³ط±ط§طھ', nameEn: 'Nuts Brownie', descriptionAr: 'ط¨ط±ط§ظˆظ†ظٹط² ط¨ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ظˆط§ظ„ظ…ظƒط³ط±ط§طھ', descriptionEn: 'Chocolate brownie topped with nuts', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds14', nameAr: 'ط¨ط±ط§ظˆظ†ظٹط² ط£ظˆط±ظٹظˆ', nameEn: 'Oreo Brownie', descriptionAr: 'ط¨ط±ط§ظˆظ†ظٹط² ط¨ظ‚ط·ط¹ ط§ظ„ط£ظˆط±ظٹظˆ', descriptionEn: 'Chocolate brownie with Oreo', price: 100, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds15', nameAr: 'ظƒظˆظƒظٹط² ط¨ط§ظٹ ظ†ظˆطھظٹظ„ط§', nameEn: 'Nutella Cookie Pie', descriptionAr: 'ظƒظˆظƒظٹط² ط¨ط§ظٹظٹ ظ…ط­ط´ظˆ ط¨ط§ظ„ظ†ظˆطھظٹظ„ط§', descriptionEn: 'Cookie pie stuffed with Nutella', price: 95, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds16', nameAr: 'ط¨ط·ط§ط·ط§', nameEn: 'Baked Sweet Potato', descriptionAr: 'ط¨ط·ط§ط·ط§ ط­ظ„ظˆط© ظ…ط´ظˆظٹط© ظˆظ…ط²ظٹظ†ط©', descriptionEn: 'Baked sweet potato with toppings', price: 85, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds17', nameAr: 'ظƒظٹظƒ ط³ظٹظƒظˆظ„ط§طھظ‡', nameEn: 'Chocolate Layer Cake', descriptionAr: 'ظƒظٹظƒ ط´ظˆظƒظˆظ„ط§طھط© ظ‡ط´ط©', descriptionEn: 'Fluffy chocolate cake', price: 100, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds18', nameAr: 'ظƒظٹظƒ ط¬ط²ط±', nameEn: 'Carrot Cake', descriptionAr: 'ظƒظٹظƒ ط§ظ„ط¬ط²ط± ط¨ط§ظ„ط¬ظˆط² ظˆط§ظ„ظ‚ط±ظپط©', descriptionEn: 'Carrot cake with walnuts & cinnamon', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds19', nameAr: 'طھط±ظٹط³ ظ„ظٹطھط´ظٹط²', nameEn: 'Tres Leches Cake', descriptionAr: 'ظƒظٹظƒ ط§ظ„ط­ظ„ظٹط¨ ط§ظ„ط¥ط³ط¨ط§ظ†ظٹ', descriptionEn: 'Traditional three milks cake', price: 95, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds20', nameAr: 'طھظٹط±ط§ظ…ظٹط³ظˆ', nameEn: 'Italian Tiramisu', descriptionAr: 'طھظٹط±ط§ظ…ظٹط³ظˆ ط¥ظٹط·ط§ظ„ظٹ ط¨ط§ظ„ط¥ط³ط¨ط±ظٹط³ظˆ', descriptionEn: 'Italian espresso tiramisu', price: 110, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds21', nameAr: 'طھط§ط±طھ ط´ظٹظƒظˆظ„ط§طھظ‡', nameEn: 'Chocolate Tart', descriptionAr: 'طھط§ط±طھ ط§ظ„ط´ظˆظƒظˆظ„ط§طھط© ط§ظ„ط؛ظ†ظٹط©', descriptionEn: 'Rich chocolate tart', price: 95, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds22', nameAr: 'ظ…ظٹظ„ظپظٹظ‡', nameEn: 'Mille-Feuille', descriptionAr: 'ظ…ظٹظ„ظپظٹظ‡ ظپط±ظ†ط³ظٹ ط¨ط§ظ„ظƒط§ط³طھط±ط¯', descriptionEn: 'French mille-feuille with custard', price: 95, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },
  { id: 'ds23', nameAr: 'ط§ظ… ط¹ظ„ظ‰', nameEn: 'Om Ali', descriptionAr: 'ط£ظ… ط¹ظ„ظٹ ط³ط§ط®ظ†ط© ط¨ط§ظ„ظ…ظƒط³ط±ط§طھ ظˆط§ظ„ط­ظ„ظٹط¨', descriptionEn: 'Warm Om Ali with nuts & milk', price: 100, categoryAr: 'ط§ظ„ط­ظ„ظˆ', categoryEn: 'Desserts' },

  // ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ (Soft Drinks & Add-ons)
  { id: 'sd1', nameAr: 'ظ…ظٹط§ظ‡ طµط؛ظٹط±ط©', nameEn: 'Small Mineral Water', descriptionAr: 'ط²ط¬ط§ط¬ط© ظ…ظٹط§ظ‡ ظ…ط¹ط¯ظ†ظٹط© طµط؛ظٹط±ط©', descriptionEn: 'Small mineral water bottle', price: 15, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd2', nameAr: 'ظ…ظٹط§ظ‡ ظ„ط§ط±ط¬', nameEn: 'Large Mineral Water', descriptionAr: 'ط²ط¬ط§ط¬ط© ظ…ظٹط§ظ‡ ظ…ط¹ط¯ظ†ظٹط© ظƒط¨ظٹط±ط©', descriptionEn: 'Large mineral water bottle', price: 30, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd3', nameAr: 'ظƒط§ظ†ط²', nameEn: 'Canned Soft Drink', descriptionAr: 'ظƒط§ظ†ط² ظ…ط´ط±ظˆط¨ ط؛ط§ط²ظٹ', descriptionEn: 'Canned soft drink', price: 60, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd4', nameAr: 'ط´ظˆظٹط¨ط³ ط¬ظˆظ„ط¯', nameEn: 'Schweppes Gold', descriptionAr: 'ط´ظˆظٹط¨ط³ ط¬ظˆظ„ط¯ ط؛ط§ط²ظٹط©', descriptionEn: 'Schweppes Gold soda', price: 70, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd5', nameAr: 'ط¨ط±ظٹظ„', nameEn: 'Birell Malt Drink', descriptionAr: 'ظ…ط´ط±ظˆط¨ ط´ط¹ظٹط± ط¨ط±ظٹظ„', descriptionEn: 'Birell non-alcoholic malt drink', price: 70, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd6', nameAr: 'ط±ظٹط¯ط¨ظˆظ„', nameEn: 'Red Bull Energy Drink', descriptionAr: 'ظ…ط´ط±ظˆط¨ ط§ظ„ط·ط§ظ‚ط© ط±ظٹط¯ط¨ظˆظ„', descriptionEn: 'Red Bull energy drink', price: 125, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd7', nameAr: 'ط¥ط¶ط§ظپط© ظپظ„ظٹظپط±', nameEn: 'Extra Syrup Flavor', descriptionAr: 'ط¥ط¶ط§ظپط© ظپظ„ظٹظپط± (ظپط§ظ†ظٹظ„ظٹط§ / ظƒط±ط§ظ…ظٹظ„ / ط¨ظ†ط¯ظ‚ / ظ‚ط±ظپط©)', descriptionEn: 'Extra syrup flavor', price: 40, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd8', nameAr: 'ط¥ط¶ط§ظپط© ط­ظ„ظٹط¨', nameEn: 'Extra Milk', descriptionAr: 'ط¥ط¶ط§ظپط© ط­ظ„ظٹط¨ ط·ط§ط²ط¬', descriptionEn: 'Extra fresh milk shot', price: 40, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd9', nameAr: 'ط¥ط¶ط§ظپط© ط¨ط§ط¨ظ„ط²', nameEn: 'Extra Popping Boba Bubbles', descriptionAr: 'ط¥ط¶ط§ظپط© ظƒط±ط§طھ ط§ظ„ط¨ط§ط¨ظ„ط² ط§ظ„ظ…ظ†ط¹ط´ط©', descriptionEn: 'Extra popping boba bubbles', price: 60, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd10', nameAr: 'ط¥ط¶ط§ظپط© ظƒط±ظٹظ…ط©', nameEn: 'Extra Whipped Cream', descriptionAr: 'ط¥ط¶ط§ظپط© ظƒط±ظٹظ…ط© ظ…ط®ظپظˆظ‚ط© ط؛ظ†ظٹط©', descriptionEn: 'Extra rich whipped cream', price: 50, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd11', nameAr: 'ط¥ط¶ط§ظپط© ط¹ط³ظ„', nameEn: 'Extra Natural Honey', descriptionAr: 'ط¥ط¶ط§ظپط© ط¹ط³ظ„ ط·ط¨ظٹط¹ظٹ', descriptionEn: 'Extra natural honey', price: 35, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd12', nameAr: 'ط¥ط¶ط§ظپط© ط¥ط³ط¨ط±ظٹط³ظˆ', nameEn: 'Extra Shot Espresso', descriptionAr: 'ط´ظˆطھ ط¥ط³ط¨ط±ظٹط³ظˆ ط¥ط¶ط§ظپظٹ', descriptionEn: 'Extra shot of specialty espresso', price: 50, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd13', nameAr: 'ط¥ط¶ط§ظپط© ظ…ظƒط³ط±ط§طھ', nameEn: 'Extra Roasted Nuts', descriptionAr: 'ط¥ط¶ط§ظپط© ظ…ظƒط³ط±ط§طھ ظ…ط­ظ…طµط© ظ…ط¬ط±ظˆط´ط©', descriptionEn: 'Extra roasted crushed nuts', price: 70, categoryAr: 'ط³ظˆظپطھ ط¯ط±ظٹظ†ظƒ ظˆط§ظ„ط¥ط¶ط§ظپط§طھ', categoryEn: 'Soft Drinks & Addons' },
];

const initialPromotions: PromotionItem[] = [
  {
    id: '1',
    titleEn: 'Oriental Breakfast Deal',
    titleAr: 'ط¹ط±ط¶ ط§ظ„ظپط·ط§ط± ط§ظ„ط´ط±ظ‚ظٹ',
    subtitleEn: 'Foul + Falafel + Sliced Potatoes + Baladi Bread + Tea or Lemon for 99 EGP',
    subtitleAr: 'ظپظˆظ„ ظˆظپظ„ط§ظپظ„ ظˆط¨ط·ط§ط·ط³ ظˆط¹ظٹط´ ط¨ظ„ط¯ظٹ ط³ط®ظ† + ط´ط§ظٹ ط£ظˆ ظ„ظٹظ…ظˆظ† ط¨ظ€ 99 ط¬ظ†ظٹظ‡ ظپظ‚ط·',
    badgeEn: 'SPECIAL DEAL 99 EGP',
    badgeAr: 'ط¹ط±ط¶ 99 ط¬ظ†ظٹظ‡',
    ctaEn: 'View Deal',
    ctaAr: 'ط§ط³طھط¹ط±ط¶ ط§ظ„ط¹ط±ط¶',
    gradient: 'from-brand-gold via-amber-600 to-brand-gold-light text-white',
    isActive: true,
  },
  {
    id: '2',
    titleEn: 'French Breakfast Deal',
    titleAr: 'ط¹ط±ط¶ ط§ظ„ظپط·ط§ط± ط§ظ„ظپط±ظ†ط´',
    subtitleEn: 'Plain Croissant + Cappuccino or Latte or Tea for 99 EGP',
    subtitleAr: 'ظƒط±ظˆط§ط³ظˆظ† ط³ط§ط¯ط© + ظƒط§ط¨طھط´ظٹظ†ظˆ ط£ظˆ ظ„ط§طھظٹظ‡ ط£ظˆ ط´ط§ظٹ ط¨ظ€ 99 ط¬ظ†ظٹظ‡',
    badgeEn: 'FRENCH COMBO',
    badgeAr: 'ظƒظˆظ…ط¨ظˆ ظپط±ظ†ط³ظٹ',
    ctaEn: 'Explore Combo',
    ctaAr: 'ط§ظƒطھط´ظپ ط§ظ„ظƒظˆظ…ط¨ظˆ',
    gradient: 'from-mediterranean-blue to-blue-950 text-white',
    isActive: true,
  },
];

const initialAnnouncements: AnnouncementPost[] = [
  {
    id: '1',
    titleAr: 'ط£ظ‡ظ„ط§ظ‹ ط¨ظƒظ… ظپظٹ ط±ظٹط§ط­ظٹظ† ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط© âک•âœ¨',
    titleEn: 'Welcome to Rayahen Alexandria âک•âœ¨',
    contentAr: 'ط§ط³طھظ…طھط¹ظˆط§ ط¨ط£ط¬ظˆط¯ ط£ظ†ظˆط§ط¹ ط§ظ„ظ‚ظ‡ظˆط© ط§ظ„ظ…ط®طھطµط© ظˆط§ظ„ظ…ط­ظ…طµط© ط·ط§ط²ط¬ط§ظ‹ ظٹظˆظ…ظٹط§ظ‹طŒ ظ…ط¹ طھط´ظƒظٹظ„ط© ط§ظ„ظپط·ط§ط± ط§ظ„ط´ط±ظ‚ظٹ ظˆط§ظ„ظ…ط®ط¨ظˆط²ط§طھ ط§ظ„ظپط±ظ†ط³ظٹط© ط§ظ„ظپط§ط®ط±ط©!',
    contentEn: 'Enjoy our freshly roasted specialty coffee alongside our delicious oriental breakfast and premium French bakery!',
    badgeAr: 'ط±ط³ط§ظ„ط© طھط±ط­ظٹط¨ظٹط©',
    badgeEn: 'Welcome Message',
    isActive: true,
  },
];

const initialAdminUsers: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '123456',
    role: 'SUPER_ADMIN',
  },
];

interface MenuStoreState {
  categories: CategoryItem[];
  menuItems: MenuItem[];
  promotions: PromotionItem[];
  announcements: AnnouncementPost[];
  adminUsers: AdminUser[];
  ratingUrl: string;
  vatSettings: Record<string, boolean>; // branchId â†’ showVat
  currentSessionUser: string | null;
  adminBranch: string;
  activityLogs: ActivityLog[];
  isSupabaseSynced: boolean;
  lastItemsUpdatedAt: number;
  unsubListeners: (() => void) | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncError: string;

  // Firebase Auto Sync Helper
  syncToSupabase: () => Promise<void>;
  initSupabaseListener: () => (() => void) | void;

  // System Settings Actions
  setRatingUrl: (url: string) => void;

  // Auth Actions
  loginAdmin: (username: string, passwordHash: string) => boolean;
  logoutAdmin: () => void;
  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (id: string, updated: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  setAdminBranch: (branch: string) => void;
  logActivity: (action: string, details: string) => void;

  // Menu Item Actions
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (newOrder: MenuItem[]) => void;

  // Promotion Actions
  addPromotion: (promo: PromotionItem) => void;
  updatePromotion: (id: string, updated: Partial<PromotionItem>) => void;
  togglePromotion: (id: string) => void;
  deletePromotion: (id: string) => void;
  reorderPromotions: (newOrder: PromotionItem[]) => void;

  // Category Actions
  addCategory: (cat: CategoryItem) => void;
  updateCategory: (id: string, updated: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: CategoryItem[]) => void;

  // Announcement Actions
  addAnnouncement: (post: AnnouncementPost) => void;
  updateAnnouncement: (id: string, updated: Partial<AnnouncementPost>) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  reorderAnnouncements: (newOrder: AnnouncementPost[]) => void;

  // Branch Copy Action
  copyBranchSettings: (sourceBranchId: string, targetBranchIds: string[]) => Promise<void>;

  // System Reset Actions
  clearAllData: () => void;

}

// âœ… Deep sanitizer: removes ALL undefined values from any object/array
// Firestore rejects ANY field with undefined value (even nested) and fails silently
const sanitize = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(sanitize) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitize(v)])
    ) as T;
  }
  if (typeof obj === 'string') {
    // Prevent massive base64 strings (> 400KB) from exceeding Firestore's 1MB limit or causing network timeouts!
    if (obj.length > 400000 && (obj.startsWith('data:') || obj.startsWith('blob:'))) {
      console.warn('âڑ ï¸ڈ Prevented massive base64/blob string from being sent to Firestore:', obj.substring(0, 50) + '...');
      return '' as unknown as T;
    }
  }
  return obj;
};

// Helper to push state to Supabase safely â€” returns success/error
const syncStateToFirestore = async (
  state: MenuStoreState,
  setStatus?: (s: 'success' | 'error', msg?: string) => void
) => {
  if (typeof window === 'undefined') return;
  try {
    const updatedAt = new Date().toISOString();
    const categoriesPayload = sanitize({ data: state.categories, updatedAt });
    const menuItemsPayload = sanitize({ data: state.menuItems, updatedAt });
    const promotionsPayload = sanitize({ data: state.promotions, updatedAt });
    const announcementsPayload = sanitize({ data: state.announcements, updatedAt });
    const settingsPayload = sanitize({ adminUsers: state.adminUsers, ratingUrl: state.ratingUrl || '', vatSettings: state.vatSettings || {}, updatedAt });
    
    // We store the entire state as one row to make it simple and atomic
    const stateData = {
      categories: categoriesPayload,
      menuItems: menuItemsPayload,
      promotions: promotionsPayload,
      announcements: announcementsPayload,
      settings: settingsPayload,
    };

    const promises = [
      setDoc(doc(db, 'menu_state', 'menuItems'), { data: menuItemsPayload.data, updatedAt }),
      setDoc(doc(db, 'menu_state', 'categories'), { data: categoriesPayload.data, updatedAt }),
      setDoc(doc(db, 'menu_state', 'promotions'), { data: promotionsPayload.data, updatedAt }),
      setDoc(doc(db, 'menu_state', 'announcements'), { data: announcementsPayload.data, updatedAt }),
      setDoc(doc(db, 'menu_state', 'settings'), settingsPayload)
    ];

    const syncPromise = Promise.all(promises);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('ط§ظ†طھظ‡ظ‰ ظˆظ‚طھ ط§ظ„ط§طھطµط§ظ„ ط¨ط§ظ„ط³ط­ط§ط¨ط© (20 ط«ط§ظ†ظٹط©). طھط£ظƒط¯ ظ…ظ† ط§طھطµط§ظ„ ط§ظ„ط¥ظ†طھط±ظ†طھ ط£ظˆ ط­ط¬ظ… ط§ظ„ط¨ظٹط§ظ†ط§طھ.')), 20000)
    );
    await Promise.race([syncPromise, timeoutPromise]);
    console.log('ًں”¥ Synced to Firestore successfully!');
    setStatus?.('success');
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('â‌Œ Firestore sync error:', msg);
    setStatus?.('error', msg);
  }
};

export const useMenuStore = create<MenuStoreState>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      menuItems: initialMenuItems,
      promotions: initialPromotions,
      announcements: initialAnnouncements,
      adminUsers: initialAdminUsers,
      ratingUrl: 'https://rayahen-rating.vercel.app/',
      vatSettings: {},
      currentSessionUser: null,
      adminBranch: 'all',
      activityLogs: [],
      isSupabaseSynced: false,
      lastItemsUpdatedAt: 0,
      unsubListeners: null,
      lastSyncStatus: 'idle' as const,
      lastSyncError: '',

      // Sync Trigger â€” with visible status
      syncToSupabase: async () => {
        set({ lastSyncStatus: 'syncing', lastSyncError: '' });
        await syncStateToFirestore(get(), (status, msg) => {
          set({ lastSyncStatus: status, lastSyncError: msg || '' });
        });
      },

      // Realtime Listener (Firebase Firestore)
      // Listens to the 5 separate documents that syncStateToFirestore writes to.
      initSupabaseListener: () => {
        if (typeof window === 'undefined') return;

        // Prevent multiple listeners
        if (get().unsubListeners) return get().unsubListeners!;

        try {
          const unsubFns: (() => void)[] = [];

          // -- menuItems listener
          unsubFns.push(
            onSnapshot(doc(db, 'menu_state', 'menuItems'), (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();
              if (data?.data) {
                const items = data.data as MenuItem[];
                items.sort((a: any, b: any) => (a.orderIndex ?? 99999) - (b.orderIndex ?? 99999));
                const serverTs = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
                set({ menuItems: items, lastItemsUpdatedAt: serverTs, isSupabaseSynced: true });
              }
            }, (e) => console.log('menuItems listener error, local mode active.', e))
          );

          // -- categories listener
          unsubFns.push(
            onSnapshot(doc(db, 'menu_state', 'categories'), (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();
              if (data?.data) set({ categories: data.data, isSupabaseSynced: true });
            }, (e) => console.log('categories listener error, local mode active.', e))
          );

          // -- promotions listener
          unsubFns.push(
            onSnapshot(doc(db, 'menu_state', 'promotions'), (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();
              if (data?.data) set({ promotions: data.data });
            }, (e) => console.log('promotions listener error, local mode active.', e))
          );

          // -- announcements listener
          unsubFns.push(
            onSnapshot(doc(db, 'menu_state', 'announcements'), (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();
              if (data?.data) set({ announcements: data.data });
            }, (e) => console.log('announcements listener error, local mode active.', e))
          );

          // -- settings listener
          unsubFns.push(
            onSnapshot(doc(db, 'menu_state', 'settings'), (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();
              if (data) {
                set({
                  adminUsers: data.adminUsers || get().adminUsers,
                  ratingUrl: data.ratingUrl || get().ratingUrl,
                  vatSettings: data.vatSettings || get().vatSettings || {},
                });
              }
            }, (e) => console.log('settings listener error, local mode active.', e))
          );

          const cleanup = () => {
            unsubFns.forEach((fn) => fn());
            set({ unsubListeners: null });
          };

          set({ unsubListeners: cleanup });
          return cleanup;
        } catch (e) {
          console.log('Firestore listener status: Local mode active.', e);
        }
      },
      // System Settings Actions
      setRatingUrl: (url) => {
        set({ ratingUrl: url });
        syncStateToFirestore(get());
      },

      // Auth Handlers
      loginAdmin: (username, password) => {
        const found = get().adminUsers.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password
        );
        if (found) {
          set({ currentSessionUser: found.username });
          get().logActivity('طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„', 'طھظ… طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ظ„ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ط¨ظ†ط¬ط§ط­');
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ currentSessionUser: null }),
      setAdminBranch: (branch) => set({ adminBranch: branch }),
      logActivity: (action, details) => {
        set((state) => {
          const newLog: ActivityLog = {
            id: Date.now().toString(),
            username: state.currentSessionUser || 'Admin',
            action: action as any,
            details: details,
            timestamp: Date.now(),
          };
          const newLogs = [newLog, ...(state.activityLogs || [])].slice(0, 100);
          return { activityLogs: newLogs };
        });
        // Only update settings doc (not a full 4-doc sync) to save writes
        syncStateToFirestore(get()).catch((e: any) => console.error('logActivity sync error:', e));
      },

      addAdminUser: (user) => {
        set((state) => ({ adminUsers: [...state.adminUsers, user] }));
        syncStateToFirestore(get());
      },
      updateAdminUser: (id, updated) => {
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === id ? { ...u, ...updated } : u
          ),
        }));
        syncStateToFirestore(get());
      },
      deleteAdminUser: (id) => {
        set((state) => ({
          adminUsers: state.adminUsers.filter((u) => u.id !== id),
        }));
        syncStateToFirestore(get());
      },


      // Menu Item Handlers
      addMenuItem: async (item) => {
        set((state) => {
          const firstIdx = state.menuItems.findIndex(
            (i) => i.categoryAr === item.categoryAr || i.categoryEn === item.categoryEn
          );
          if (firstIdx !== -1) {
            const newItems = [...state.menuItems];
            newItems.splice(firstIdx, 0, item);
            return { menuItems: newItems };
          }
          return { menuItems: [...state.menuItems, item] };
        });
        get().logActivity('ط¥ط¶ط§ظپط© طµظ†ظپ', `طھظ…طھ ط¥ط¶ط§ظپط© ط§ظ„طµظ†ظپ: ${item.nameAr}`);
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      updateMenuItem: async (id, updated) => {
        const itemName = get().menuItems.find(i => i.id === id)?.nameAr || id;
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        }));
        if (updated.branchOverrides) {
           get().logActivity('طھط¹ط¯ظٹظ„ ط­ط§ظ„ط© ظپط±ط¹', `طھظ… طھط¹ط¯ظٹظ„ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„طµظ†ظپ (${itemName}) ظ„ظپط±ط¹ ظ…ط­ط¯ط¯`);
        } else if (updated.isActive !== undefined) {
           get().logActivity('طھط¹ط¯ظٹظ„ ط­ط§ظ„ط©', `طھظ… ${updated.isActive ? 'طھظ†ط´ظٹط·' : 'ط¥ط®ظپط§ط،'} ط§ظ„طµظ†ظپ: ${itemName}`);
        } else {
           get().logActivity('طھط¹ط¯ظٹظ„ طµظ†ظپ', `طھظ… طھط¹ط¯ظٹظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„طµظ†ظپ: ${itemName}`);
        }
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      deleteMenuItem: async (id) => {
        const itemName = get().menuItems.find(i => i.id === id)?.nameAr || id;
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
        get().logActivity('ط­ط°ظپ طµظ†ظپ', `طھظ… ط­ط°ظپ ط§ظ„طµظ†ظپ: ${itemName}`);
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      reorderMenuItems: async (newOrder) => {
        // Fix the orderIndex of each item before saving to state
        const fixedOrder = newOrder.map((item, idx) => ({ ...item, orderIndex: idx }));
        set({ menuItems: fixedOrder });
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },

      // Promotion Handlers
      addPromotion: (promo) => {
        set((state) => ({ promotions: [promo, ...state.promotions] }));
        syncStateToFirestore(get());
      },
      updatePromotion: (id, updated) => {
        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        }));
        syncStateToFirestore(get());
      },
      togglePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        }));
        syncStateToFirestore(get());
      },
      deletePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.filter((p) => p.id !== id),
        }));
        syncStateToFirestore(get());
      },
      reorderPromotions: (newOrder) => {
        set({ promotions: newOrder });
        syncStateToFirestore(get());
      },

      // Category Handlers
      addCategory: (cat) => {
        set((state) => ({ categories: [...state.categories, cat] }));
        syncStateToFirestore(get());
      },
      updateCategory: (id, updated) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        }));
        syncStateToFirestore(get());
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          menuItems: state.menuItems.filter((item) => item.categoryEn !== id),
        }));
        syncStateToFirestore(get());
      },
      reorderCategories: (newOrder) => {
        set({ categories: newOrder });
        syncStateToFirestore(get());
      },

      // Announcement Handlers
      addAnnouncement: (post) => {
        set((state) => ({ announcements: [post, ...state.announcements] }));
        syncStateToFirestore(get());
      },
      updateAnnouncement: (id, updated) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        }));
        syncStateToFirestore(get());
      },
      toggleAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        }));
        syncStateToFirestore(get());
      },
      deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
        syncStateToFirestore(get());
      },
      reorderAnnouncements: (newOrder) => {
        set({ announcements: newOrder });
        syncStateToFirestore(get());
      },

      // System Reset Handlers
      clearAllData: () => {
        set({
          menuItems: [],
          promotions: [],
          announcements: [],
          categories: [{ id: 'All', nameEn: 'All', nameAr: 'ط§ظ„ظƒظ„' }],
        });
        syncStateToFirestore(get());
      },


      // Branch Settings Copy Handler
      // Copies branchOverrides from sourceBranchId to each targetBranchId
      // for menuItems, promotions, announcements, and categories.
      // Base data (names, prices, images) is NEVER touched.
      copyBranchSettings: async (sourceBranchId, targetBranchIds) => {
        if (!targetBranchIds.length) return;
        const state = get();

        const copyOverrides = <T extends { branchOverrides?: { [k: string]: unknown } }>(
          items: T[]
        ): T[] =>
          items.map((item) => {
            const sourceOverride = item.branchOverrides?.[sourceBranchId];
            if (sourceOverride === undefined) return item;
            const newOverrides = { ...(item.branchOverrides || {}) };
            for (const targetId of targetBranchIds) {
              newOverrides[targetId] = { ...sourceOverride as object };
            }
            return { ...item, branchOverrides: newOverrides };
          });

        set({
          menuItems:     copyOverrides(state.menuItems)     as typeof state.menuItems,
          promotions:    copyOverrides(state.promotions)    as typeof state.promotions,
          announcements: copyOverrides(state.announcements) as typeof state.announcements,
          categories:    copyOverrides(state.categories)    as typeof state.categories,
        });

        const targetNames = targetBranchIds.join(', ');
        get().logActivity(
          'ظ†ط³ط® ط¥ط¹ط¯ط§ط¯ط§طھ ظپط±ط¹',
          `طھظ… ظ†ط³ط® ط¥ط¹ط¯ط§ط¯ط§طھ ظپط±ط¹ (${sourceBranchId}) ط¥ظ„ظ‰: ${targetNames}`
        );
        await syncStateToFirestore(get());
      },
    }),
    {
      name: 'rayahen-menu-storage',
      version: 2, // Bump version to force cache invalidation
      partialize: (state) => ({
        categories: state.categories,
        menuItems: state.menuItems,
        promotions: state.promotions,
        announcements: state.announcements,
        adminUsers: state.adminUsers,
        ratingUrl: state.ratingUrl,
        vatSettings: state.vatSettings,
      }),
    }
  )
);

// Auto-start the Firestore realtime listener when the app loads (client-side only).
// This runs once at module level - independent of any component lifecycle -
// so the listener is never accidentally torn down by a useEffect cleanup.
if (typeof window !== 'undefined') {
  // Small delay to let the store hydrate from localStorage first.
  setTimeout(() => {
    useMenuStore.getState().initSupabaseListener();
  }, 0);
}
