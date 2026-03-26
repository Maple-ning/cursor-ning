export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    username: string;
  };
}
