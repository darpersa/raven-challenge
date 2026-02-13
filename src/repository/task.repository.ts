import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'dto/task.dto';
import { Repository } from 'typeorm';
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
}
