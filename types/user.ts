export interface User {
  id: number;
  email: string;
  username?: string;
  role: string;
  balance: number;
  banned: boolean;
  reg_date: number;
  ip_reg: string;
  ip_auth: string;
  user_agent: string;
  seller_name: string | null;
  seller_avatar: string | null;
  authorization?: string;
  isSellerAllowed?: boolean;
} 