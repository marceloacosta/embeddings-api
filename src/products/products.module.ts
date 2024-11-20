import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { BedrockService } from './services/bedrock.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, BedrockService],
})
export class ProductsModule {}
