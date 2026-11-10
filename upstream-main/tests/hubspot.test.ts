import { describe, it, expect } from 'vitest'
import { syncLead } from '../server/hubspot'

describe('hubspot', () => {
  it('syncs without token', async () => {
    const lead = { customer_name: 'a', customer_phone: 'b', legal_category: 'c' }
    await expect(syncLead(lead)).resolves.toBeUndefined()
  })
})
