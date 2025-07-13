export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  teamId: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  discussionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface PaginationMeta {
  page: number;
  total: number;
  totalPages: number;
}