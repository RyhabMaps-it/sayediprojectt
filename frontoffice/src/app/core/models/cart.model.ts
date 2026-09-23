export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  colorId: number | null;
  colorName: string | null;
  colorCode: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}
