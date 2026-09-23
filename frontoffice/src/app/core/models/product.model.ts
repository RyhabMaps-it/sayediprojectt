import { Color } from './color.model';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  material: string;
  heightCm: string;
  widthCm: string;
  depthCm: string;
  colorOptions: string;
  units: string;
  colors: Color[];
  price: number | null;
  priceOnRequest: boolean;
  hasTechnicalSheet: boolean;
  sku: string;
  stockQuantity: number;
  images: string[];
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  material?: string;
  heightCm?: string;
  widthCm?: string;
  depthCm?: string;
  colorOptions?: string;
  units?: string;
  colorIds?: number[];
  price?: number | null;
  priceOnRequest: boolean;
  hasTechnicalSheet: boolean;
  sku?: string;
  stockQuantity: number;
  images?: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
