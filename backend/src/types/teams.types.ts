export enum TeamRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export interface CreateTeamDto {
  name: string;
}

export interface AddMemberDto {
  email: string;
  role?: TeamRole;
}

export interface UpdateMemberRoleDto {
  role: TeamRole;
}
