import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findSimilarProducts(embedding: number[], limit: number = 5): Promise<Product[]> {
    // Using pgvector's <-> operator for L2 distance (Euclidean distance)
    return this.createQueryBuilder('product')
      .orderBy(`embedding <-> :embedding`, 'ASC')
      .setParameter('embedding', `[${embedding.join(',')}]`)
      .limit(limit)
      .getMany();
  }

  async batchInsert(products: Product[]): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(Product)
      .values(products)
      .execute();
  }
}
