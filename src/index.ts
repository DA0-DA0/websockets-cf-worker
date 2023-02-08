import { createCors } from '@noahsaso/itty-cors'
import { Router } from 'itty-router'

import { broadcast } from './routes/broadcast'
import { connect } from './routes/connect'
import { Env } from './types'
import { respondError } from './utils'

export * from './durable_objects/Dao'

// Create CORS handlers.
const { preflight, corsify } = createCors({
  methods: ['GET', 'POST'],
  origins: ['*'],
  maxAge: 3600,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
})

const router = Router()

// Handle CORS preflight OPTIONS request.
router.options('*', preflight)

router.get('/:dao/connect', connect)

router.post('/:dao/broadcast', broadcast)

// 404
router.all('*', () => respondError(404, 'Not found'))

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router
      .handle(request, env)
      .catch((err) => {
        console.error('Error handling request', request.url, err)
        return respondError(
          500,
          `Internal server error. ${
            err instanceof Error ? err.message : `${err}`
          }`
        )
      })
      .then(corsify)
  },
}
