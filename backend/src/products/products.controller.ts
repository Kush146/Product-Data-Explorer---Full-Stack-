import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')  
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products for a category path' })
  @ApiQuery({ name: 'categoryPath', required: true, example: 'books/fiction/classics' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 24 })
  @ApiOkResponse({ description: 'OK' })
  list(
    @Query('categoryPath') categoryPath: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
  ): any {
    return this.svc.list(categoryPath, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail (description, ratings, reviews, related)' })
  @ApiParam({ name: 'id', example: 'cmftkay3i0006aatw7mls31iw' })
  @ApiOkResponse({ description: 'OK' })
  byId(@Param('id') id: string): any {
    return this.svc.byId(id);
  }
}
