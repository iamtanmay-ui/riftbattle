import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface User {
  id: number;
  email: string;
  reg_date: number;
  role: string;
  balance: number;
  banned: boolean;
  ip_reg: string;
  ip_auth: string;
  user_agent: string;
  seller_name: string | null;
  seller_avatar: string | null;
  isSellerAllowed: boolean;
}

// User authentication atoms
export const userAtom = atomWithStorage<User | null>('auth-user', null);
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
);

// Login dialog state atoms
export const isLoginDialogOpenAtom = atom(false);
export const otpSentAtom = atom(false);
export const isLoadingAtom = atom(false);
export const resendDisabledAtom = atom(false);
export const countdownAtom = atom(0);

// Marketplace filter atoms
export const priceRangeAtom = atom([0, 10000]);
export const selectedCategoriesAtom = atom<string[]>([]);
export const selectedRaritiesAtom = atom<string[]>([]);
export const selectedCosmeticsAtom = atom<string[]>([]);
export const searchQueryAtom = atom('');
export const viewModeAtom = atom<'grid' | 'list'>('grid');
export const cosmeticSearchQueryAtom = atom('');
