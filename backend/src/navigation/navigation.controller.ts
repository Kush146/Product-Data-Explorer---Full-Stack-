import { Controller, Get, Query } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('navigation')
@Controller('navigation') 
export class NavigationController {
  constructor(private svc: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'List top-level navigation headings' })
  @ApiOkResponse({
    description: 'Navigation headings',
    schema: {
      example: [{ id: '...', title: 'Books', slug: 'books' }],
    },
  })
  list() {
    return this.svc.list();
  }

  @Get('children')
  @ApiOperation({ summary: 'Get categories/subcategories for a path' })
  @ApiQuery({ name: 'categoryPath', example: 'books/fiction', required: true })
  @ApiQuery({ name: 'refresh', required: false, type: Boolean, description: 'Enqueue a scrape if data is stale' })
  @ApiOkResponse({
    description: 'Breadcrumb + children for the path',
    schema: {
      example: {
        breadcrumb: [{ id: '...', title: 'Books', slug: 'books', isNav: true }],
        children: [{ id: '...', title: 'Fiction', slug: 'fiction', sourceUrl: null }],
        meta: { isStale: true, enqueued: true, candidateUrl: 'https://www.worldofbooks.com/books/fiction', ttlHours: 12, lastScrapedAt: null }
      },
    },
  })
  children(@Query('categoryPath') categoryPath?: string, @Query('refresh') refresh?: string) {
    return this.svc.childrenByPath(categoryPath, refresh === 'true');
  }
}
