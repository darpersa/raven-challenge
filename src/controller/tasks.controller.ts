import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtValidationGuard } from 'src/guards/auth.guards';
import { TaskRequestDto } from 'src/dto/task.dto';
import { TasksService } from 'src/service/tasks.service';

@ApiTags('Raven')
@Controller('calculate')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtValidationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realizar cálculo matemático' })
  calculate(@Body() request: TaskRequestDto) {
    return this.tasksService.calculate(request);
  }
}
