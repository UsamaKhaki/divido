import { api } from '@/services/api'
import type {
  AddMemberRequest,
  ApiResponse,
  CreateGroupRequest,
  Group,
  GroupMember,
  GroupSummary,
  PaginatedResponse,
} from '@/types/api.types'

export const groupsApi = {
  list: (): Promise<GroupSummary[]> =>
    api.get<PaginatedResponse<GroupSummary>>('/groups').then((r) => r.data.data),

  get: (groupId: number): Promise<Group> =>
    api.get<ApiResponse<Group>>(`/groups/${groupId}`).then((r) => r.data.data),

  create: (payload: CreateGroupRequest): Promise<Group> =>
    api.post<ApiResponse<Group>>('/groups', payload).then((r) => r.data.data),

  deleteGroup: (groupId: number): Promise<void> =>
    api.delete(`/groups/${groupId}`).then(() => undefined),

  addMember: (groupId: number, payload: AddMemberRequest): Promise<GroupMember> =>
    api
      .post<ApiResponse<GroupMember>>(`/groups/${groupId}/members`, payload)
      .then((r) => r.data.data),

  removeMember: (groupId: number, userId: number): Promise<void> =>
    api.delete(`/groups/${groupId}/members/${userId}`).then(() => undefined),
}
