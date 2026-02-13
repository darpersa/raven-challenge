import { Injectable } from '@nestjs/common';
import { HistoryRequest } from 'src/models/history.model';
import { TaskRepository } from 'src/repository/task.repository';

@Injectable()
export class HistoryService {
  constructor(private taskRepository: TaskRepository) {}

  getHistory(request: HistoryRequest) {
    const page = Number(request.page) || 1;
    const limit = Number(request.limit) || 10;
    const order = request.order || 'ASC';

    return this.taskRepository.findByUserId(
      request.userId,
      page,
      limit,
      order,
      request.operation,
      request.startDate,
      request.endDate,
    );
  }

  async getTaskById(id: number) {
    return await this.taskRepository.findById(id);
  }

  async deleteTaskById(id: number) {
    return await this.taskRepository.deleteById(id);
  }
}
