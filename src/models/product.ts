export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
