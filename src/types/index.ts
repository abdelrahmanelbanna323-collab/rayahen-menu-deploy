// Shared type definitions for the admin project

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
  isActive?: boolean;
  branches?: string[];
  branchOverrides?: {
    [branchId: string]: {
      price?: number;
      isActive?: boolean;
      nameAr?: string;
      nameEn?: string;
      nameIt?: string;
      nameRu?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      descriptionIt?: string;
      descriptionRu?: string;
      imageUrl?: string;
      badgeAr?: string;
      badgeEn?: string;
      badgeIt?: string;
      badgeRu?: string;
    };
  };
}

export interface Addon {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  selectedAddons: Addon[];
  quantity: number;
  totalPrice: number;
}


export const AVAILABLE_BRANCHES = [
  { id: 'fawzy-moaz', name: 'فوزي معاذ' },
  { id: 'naql-handasa', name: 'النقل والهندسة' },
  { id: 'sidi-bishr', name: 'سيدي بشر' },
  { id: 'roushdy', name: 'رشدي' },
  { id: 'raml', name: 'محطة الرمل' },
  { id: 'raml-cafe', name: 'محطة الرمل كافيه' },
  { id: 'san-stefano', name: 'سان استيفانو' },
  { id: 'san-stefano-cafe', name: 'سان استيفانو كافيه' },
  { id: 'asafra', name: 'العصافرة' },
  { id: 'sidi-gaber', name: 'سيدي جابر' },
  { id: 'sharm-delta', name: 'شرم الدلتا' },
  { id: 'sharm-souq', name: 'شرم السوق' },
  { id: 'sharm-nabq', name: 'شرم نبق' }
];


export interface ActivityLog {
  id: string;
  username: string;
  action: 'LOGIN' | 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_STATUS' | 'ADD_PROMO' | 'UPDATE_PROMO' | 'DELETE_PROMO' | 'ADD_CAT' | 'UPDATE_CAT' | 'DELETE_CAT' | 'ADD_ANNOUNCE' | 'UPDATE_ANNOUNCE' | 'DELETE_ANNOUNCE';
  details: string;
  timestamp: number;
}
