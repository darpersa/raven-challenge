export interface HistoryRequest {
  userId: string;
  operation: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
  order: string;
}
