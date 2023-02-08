import { respondError } from '../utils'

import { Request as IttyRequest } from 'itty-router'
import { Env } from '../types'

export const connect = async (
  request: IttyRequest,
  { DAOS }: Env
): Promise<Response> => {
  const dao = request.params?.dao
  if (!dao) {
    return respondError(400, 'Missing DAO.')
  }

  const daoDurableObject = DAOS.get(DAOS.idFromName(dao))
  // Get WebSocket from durable object and return it to the client.
  return daoDurableObject.fetch('https://dao/connect', request)
}
