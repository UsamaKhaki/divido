import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { groupsApi } from '@/features/groups/services/groupsApi'

describe('groupsApi', () => {
  it('list returns GroupSummary array', async () => {
    const groups = [factory.groupSummary(), factory.groupSummary({ name: 'Lahore Trip' })]
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({
          data: groups,
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
        }),
      ),
    )

    const result = await groupsApi.list()
    expect(result).toEqual(groups)
  })

  it('get returns Group with members', async () => {
    const group = factory.group()
    server.use(http.get(apiUrl(`/groups/${group.id}`), () => HttpResponse.json({ data: group })))

    const result = await groupsApi.get(group.id)
    expect(result).toEqual(group)
  })

  it('create posts payload and returns Group', async () => {
    const group = factory.group({ name: 'New Group' })
    server.use(http.post(apiUrl('/groups'), () => HttpResponse.json({ data: group })))

    const result = await groupsApi.create({ name: 'New Group' })
    expect(result.name).toBe('New Group')
  })

  it('deleteGroup sends DELETE request', async () => {
    server.use(http.delete(apiUrl('/groups/1'), () => new HttpResponse(null, { status: 204 })))

    await expect(groupsApi.deleteGroup(1)).resolves.toBeUndefined()
  })

  it('addMember posts email and returns GroupMember', async () => {
    const member = factory.groupMember()
    server.use(http.post(apiUrl('/groups/1/members'), () => HttpResponse.json({ data: member })))

    const result = await groupsApi.addMember(1, { email: member.email })
    expect(result).toEqual(member)
  })

  it('removeMember sends DELETE request', async () => {
    server.use(
      http.delete(apiUrl('/groups/1/members/2'), () => new HttpResponse(null, { status: 204 })),
    )

    await expect(groupsApi.removeMember(1, 2)).resolves.toBeUndefined()
  })
})
