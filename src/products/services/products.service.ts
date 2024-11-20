import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { BedrockService } from './bedrock.service';

interface Product extends CreateProductDto {
  embedding?: number[];
}

@Injectable()
export class ProductsService {
  private products: Map<string, Product> = new Map();

  constructor(private readonly bedrockService: BedrockService) {}

  async createProducts(products: CreateProductDto[]): Promise<void> {
    for (const product of products) {
      const embedding = await this.bedrockService.generateProductEmbedding(product);
      this.products.set(product.id, { ...product, embedding });
    }
  }

  async findSimilarProducts(productId: string, limit: number = 5): Promise<Product[]> {
    const product = this.products.get(productId);
    if (!product || !product.embedding) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const similarities = Array.from(this.products.values())
      .filter((p) => p.id !== productId)
      .map((p) => ({
        product: p,
        similarity: this.cosineSimilarity(product.embedding!, p.embedding!),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities.map(({ product }) => {
      const { embedding, ...productWithoutEmbedding } = product;
      return productWithoutEmbedding;
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
