import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'dto/task.dto';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { TaskRequest } from 'src/models/task.model';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
    private userRepository: UserRepository,
  ) {}

  async save(req: TaskRequest, result: number): Promise<Task> {
    const userId = await this.userRepository.findByUserId(
      req.user_id.toString(),
    );
    if (!userId) {
      throw new Error('User not found');
    }
    const task: Partial<Task> = {
      user_id: userId.id,
      operation: req.operation,
      operanda: req.operandA,
      operandb: req.operandB,
      result: result,
    };
    return this.repository.save(task);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    order: string = 'ASC',
    operation?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const skip = (page - 1) * limit;

    const where: any = { user_id: user.id };

    // Filtro por operación
    if (operation) {
      where.operation = operation;
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.created_at = Between(start, end);
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.created_at = MoreThanOrEqual(start);
    }

    const [tasks, total] = await this.repository.findAndCount({
      where,
      skip: skip,
      take: limit,
      order: { created_at: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
    });

    return {
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Task | null> {
    return this.repository.findOne({ where: { id } });
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
