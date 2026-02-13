export interface TaskResponse {
  id: number;
  operation: string;
  operandA: number;
  operandB: number;
  result: number;
  timestamp: Date;
  user_id: string;
}

export interface TaskRequest {
  operation: string;
  operandA: number;
  operandB: number;
  user_id: string;
}
