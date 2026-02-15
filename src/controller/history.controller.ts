import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtValidationGuard } from 'src/guards/auth.guards';
import { HistoryQueryDto } from 'src/dto/history.dto';
import { HistoryService } from 'src/service/history.service';

@ApiTags('Raven')
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  @UseGuards(JwtValidationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener historial de operaciones' })
  getHistory(
    @Headers('user_id') userId: string,
    @Query() query: HistoryQueryDto,
  ) {
    const request = {
      userId,
      operation: query.operation,
      startDate: query.start_date,
      endDate: query.end_date,
      page: query.page || 1,
      limit: query.limit || 10,
      order: query.order || 'ASC',
    };
    return this.historyService.getHistory(request);
  }

  @Get('/:id')
  @UseGuards(JwtValidationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  getTaskById(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.getTaskById(id);
  }

  @Delete('/:id')
  @UseGuards(JwtValidationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar tarea por ID' })
  deleteTaskById(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.deleteTaskById(id);
  }
}
