import { Body, Controller, Post } from '@nestjs/common';
import { TaskRequest } from 'src/models/task.model';
import { TasksService } from 'src/service/tasks.service';

@Controller('calculate')
export class TasksController {
  private tasksService: TasksService;

  constructor(tasksService: TasksService) {
    this.tasksService = tasksService;
  }

  @Post()
  calculate(@Body() request: TaskRequest) {
    return this.tasksService.calculate(request);
  }
}
