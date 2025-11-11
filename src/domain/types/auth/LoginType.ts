export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

