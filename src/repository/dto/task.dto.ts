import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id?: number;

  @Column()
  user_id: number;

  @Column()
  operation: string;

  @Column()
  operanda: number;

  @Column()
  operandb: number;

  @Column()
  result: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;
}
