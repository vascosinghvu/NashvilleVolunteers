export enum UserRole {
  VOLUNTEER = 'volunteer',
  ORGANIZATION = 'organization'
}

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
} 