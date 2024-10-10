export enum ROLE_ENUM {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: ROLE_ENUM;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
