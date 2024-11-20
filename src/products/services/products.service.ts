import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { BedrockService } from './bedrock.service';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { ProductResponse } from '../interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly bedrockService: BedrockService,
    private readonly productRepository: ProductRepository,
  ) {}

  async createProducts(products: CreateProductDto[]): Promise<void> {
    const productsWithEmbeddings: Product[] = await Promise.all(
      products.map(async (productDto) => {
        const embedding = await this.bedrockService.generateProductEmbedding(productDto);
        const product = new Product();
        Object.assign(product, productDto);
        product.embedding = embedding;
        return product;
      })
    );

    await this.productRepository.batchInsert(productsWithEmbeddings);
  }

  async findSimilarProducts(productId: string, limit: number = 5): Promise<ProductResponse[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const similarProducts = await this.productRepository.findSimilarProducts(product.embedding, limit);
    
    return similarProducts.map(({ embedding, ...rest }) => ({
      ...rest,
      similarityScore: this.cosineSimilarity(product.embedding, embedding),
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
