import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { BedrockService } from './bedrock.service';
import { MockDbService } from './mock-db.service';
import { Product, ProductResponse } from '../interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly bedrockService: BedrockService,
    private readonly dbService: MockDbService,
  ) {}

  async createProducts(products: CreateProductDto[]): Promise<void> {
    const productsWithEmbeddings: Product[] = await Promise.all(
      products.map(async (product) => {
        const embedding = await this.bedrockService.generateProductEmbedding(product);
        return {
          ...product,
          embedding,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    await this.dbService.batchPutProducts(productsWithEmbeddings);
  }

  async findSimilarProducts(productId: string, limit: number = 5): Promise<ProductResponse[]> {
    const product = await this.dbService.getProduct(productId);
    if (!product || !product.embedding) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const allProducts = await this.dbService.getAllProducts();
    
    const similarities = allProducts
      .filter((p) => p.id !== productId)
      .map((p) => ({
        ...p,
        similarityScore: this.cosineSimilarity(product.embedding!, p.embedding!),
      }))
      .sort((a, b) => b.similarityScore! - a.similarityScore!)
      .slice(0, limit);

    return similarities.map(({ embedding, ...rest }) => rest);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
