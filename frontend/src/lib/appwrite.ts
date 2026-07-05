import { Client, Account, Databases } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID

let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null

if (endpoint && projectId) {
  client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)

  account = new Account(client)
  databases = new Databases(client)
}

export async function verifyAppwriteSetup(): Promise<boolean> {
  if (!client) return false
  try {
    await client.ping()
    console.log('[Appwrite] Connection verified successfully')
    return true
  } catch (err) {
    console.warn('[Appwrite] Ping failed:', err)
    return false
  }
}

export { client, account, databases }
export const isAppwriteConfigured = !!(endpoint && projectId)
