export interface TaskResponse {
  id: number;
  operation: string;
  operandA: number;
  operandB: number;
  result: number;
  timestampt: Date;
  user_id: string;
}

export interface TaskRequest {
  operation: string;
  operandA: number;
  operandB: number;
  user_id: string;
}
