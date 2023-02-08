import { Env } from '../types'
import { respondError } from '../utils'

import { Request as IttyRequest } from 'itty-router'

export const broadcast = async (
  request: IttyRequest & Request,
  { DAOS, WEBHOOK_SECRET }: Env
): Promise<Response> => {
  const dao = request.params?.dao
  if (!dao) {
    return respondError(400, 'Missing DAO.')
  }

  if (request.headers.get('x-api-key') !== WEBHOOK_SECRET) {
    return respondError(401, 'Invalid API key.')
  }

  const daoDurableObject = DAOS.get(DAOS.idFromName(dao))
  // Tell DAO durable object to broadcast to its WebSockets.
  return daoDurableObject.fetch('https://dao/broadcast', request)
}
