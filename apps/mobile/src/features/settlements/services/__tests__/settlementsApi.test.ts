import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { settlementsApi } from '@/features/settlements/services/settlementsApi'

describe('settlementsApi', () => {
  it('getByGroup returns GroupSettlementsResponse', async () => {
    const response = factory.groupSettlementsResponse()
    server.use(
      http.get(apiUrl('/groups/1/settlements'), () => HttpResponse.json({ data: response })),
    )

    const result = await settlementsApi.getByGroup(1)
    expect(result.settlements).toHaveLength(1)
    expect(result.total_unsettled).toBe(600)
  })

  it('settle posts to /settlements/:id/settle and returns Settlement', async () => {
    const settled = factory.settlement({ id: 42, status: 'settled' })
    server.use(
      http.post(apiUrl('/settlements/42/settle'), () => HttpResponse.json({ data: settled })),
    )

    const result = await settlementsApi.settle(42)
    expect(result.status).toBe('settled')
    expect(result.id).toBe(42)
  })
})
