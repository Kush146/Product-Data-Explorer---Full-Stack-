import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('history')
@Controller('history') 
export class HistoryController {
  constructor(private svc: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Save a view history event' })
  @ApiBody({
    schema: {
      example: { sessionId: 'test-sid-123', pathJson: { path: '/about', query: {} } },
    },
  })
  @ApiOkResponse({ description: 'Saved item', schema: { example: { id: '...', sessionId: 'test-sid-123', pathJson: { path: '/about' }, createdAt: '...' } } })
  save(@Body() body: { sessionId: string; pathJson: unknown }) {
    return this.svc.save(body);
  }
  
  

  @Get()
  @ApiOperation({ summary: 'List history entries for a session' })
  @ApiQuery({ name: 'sessionId', example: 'test-sid-123', required: true })
  @ApiOkResponse({ description: 'Array of entries' })
  list(@Query('sessionId') sessionId: string) {
    return this.svc.list(sessionId);
  }
}
