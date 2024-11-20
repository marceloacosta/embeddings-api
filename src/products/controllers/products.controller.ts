import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProducts(@Body() products: CreateProductDto[]) {
    return this.productsService.createProducts(products);
  }

  @Get('similar/:productId')
  async getSimilarProducts(@Param('productId') productId: string) {
    return this.productsService.findSimilarProducts(productId);
  }
}
