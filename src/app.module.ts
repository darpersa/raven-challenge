import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksController } from './controller/tasks.controller';
import { TasksService } from './service/tasks.service';
import { UsersController } from './controller/users.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'dto/user.dto';
import { UserRepository } from 'src/repository/user.repository';
import { Task } from 'dto/task.dto';
import { TaskRepository } from 'src/repository/task.repository';
import { HistoryController } from './controller/history.controller';
import { HistoryService } from './service/history.service';
import { MailboxService } from './external/mailbox.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'raven_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Task]),
  ],
  controllers: [TasksController, UsersController, HistoryController],
  providers: [
    TasksService,
    UserService,
    HistoryService,
    MailboxService,
    UserRepository,
    TaskRepository,
  ],
})
export class AppModule {}
