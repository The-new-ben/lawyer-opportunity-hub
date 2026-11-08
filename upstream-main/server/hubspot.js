const hubspot = require('@hubspot/api-client')
const client = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN || '' })
async function syncLead(lead) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) return
  const props = {
    email: lead.customer_email || '',
    firstname: lead.customer_name,
    phone: lead.customer_phone,
    legal_category: lead.legal_category,
  }
  try {
    await client.crm.contacts.basicApi.create({ properties: props })
  } catch (e) {
    console.error('HubSpot sync failed', e.message)
  }
}
module.exports = { syncLead }
