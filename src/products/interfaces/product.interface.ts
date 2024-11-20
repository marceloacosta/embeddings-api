export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  categories?: string[];
  tags?: string[];
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse extends Omit<Product, 'embedding'> {
  similarityScore?: number;
}
