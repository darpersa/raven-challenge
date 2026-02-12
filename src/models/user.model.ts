export interface UserRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  user_id: string;
  password: string;
  created_at: Date;
}
