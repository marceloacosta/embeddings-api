import { Injectable } from '@nestjs/common';
import { Product } from '../interfaces/product.interface';

@Injectable()
export class MockDbService {
  private products: Map<string, Product> = new Map();

  async putProduct(product: Product): Promise<void> {
    this.products.set(product.id, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async batchPutProducts(products: Product[]): Promise<void> {
    const timestamp = new Date().toISOString();
    for (const product of products) {
      this.products.set(product.id, {
        ...product,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product || null;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const existing = this.products.get(id);
    if (existing) {
      this.products.set(id, {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Method to simulate DynamoDB query operations
  async queryProducts(params: {
    indexName?: string;
    keyCondition?: any;
    filterExpression?: string;
    limit?: number;
  }): Promise<Product[]> {
    let results = Array.from(this.products.values());

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  // Method to clear all data (useful for testing)
  async clear(): Promise<void> {
    this.products.clear();
  }
}
