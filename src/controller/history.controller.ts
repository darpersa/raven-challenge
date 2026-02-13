import { Controller, Delete, Get, Headers, Param } from '@nestjs/common';
import { HistoryRequest } from 'src/models/history.model';
import { HistoryService } from 'src/service/history.service';

@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}
  @Get()
  getHistory(
    @Headers('user_id') userId: string,
    @Headers('operation') operation: string,
    @Headers('start_date') startDate: string,
    @Headers('end_date') endDate: string,
    @Headers('page') page: number,
    @Headers('limit') limit: number,
    @Headers('order') order: string,
  ) {
    const request: HistoryRequest = {
      userId,
      operation,
      startDate,
      endDate,
      page,
      limit,
      order,
    };
    return this.historyService.getHistory(request);
  }
  @Get('/:id')
  getTaskById(@Param('id') id: number) {
    return this.historyService.getTaskById(id);
  }

  @Delete('/:id')
  deleteTaskById(@Param('id') id: number) {
    return this.historyService.deleteTaskById(id);
  }
}
