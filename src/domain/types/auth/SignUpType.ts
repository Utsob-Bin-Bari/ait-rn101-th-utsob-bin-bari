export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

