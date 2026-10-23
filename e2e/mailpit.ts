import type { APIRequestContext } from '@playwright/test'

const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://127.0.0.1:55324'
const CODE_PATTERN = /\b(\d{6})\b/
const POLL_INTERVAL_MS = 250
const TIMEOUT_MS = 15_000

interface MailpitSearch {
  messages: { ID: string }[]
}

interface MailpitMessage {
  Text: string
  HTML: string
}

export async function readSignInCode(request: APIRequestContext, email: string) {
  const deadline = Date.now() + TIMEOUT_MS
  while (Date.now() < deadline) {
    const search = await request.get(`${MAILPIT_URL}/api/v1/search`, {
      params: { query: `to:"${email}"`, limit: 1 },
    })
    const { messages } = (await search.json()) as MailpitSearch
    const [latest] = messages
    if (latest) {
      const message = (await (
        await request.get(`${MAILPIT_URL}/api/v1/message/${latest.ID}`)
      ).json()) as MailpitMessage
      const code = CODE_PATTERN.exec(message.Text || message.HTML)?.[1]
      if (code) {
        return code
      }
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
  throw new Error(`No llegó el código para ${email}`)
}
