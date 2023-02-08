import { Env } from '../types'
import { respond, respondError } from '../utils'

// Dao implements a Durable Object that coordinates webhooks for a single DAO's
// events. Page viewers connect to this using WebSockets, and it broadcasts
// update events to them, such as when a vote is cast or a proposal is created.
export class Dao implements DurableObject {
  // K/V storage for this Durable Object.
  storage: DurableObjectStorage
  // Environment bindings.
  env: Env
  // WebSockets for each connected client.
  webSockets: WebSocket[]

  constructor(state: DurableObjectState, env: Env) {
    this.storage = state.storage
    this.env = env
    this.webSockets = []
  }

  async fetch(request: Request) {
    const url = new URL(request.url)

    switch (url.pathname) {
      case '/connect': {
        // Only allow WebSocket connections.
        if (request.headers.get('Upgrade') !== 'websocket') {
          return respondError(400, 'Expected websocket')
        }

        // Create a new WebSocket pair. One end is returned to the client, and
        // the other end is stored here for future use.
        const { 0: client, 1: server } = new WebSocketPair()

        await this.setupWebsocket(server)

        return new Response(null, {
          status: 101,
          webSocket: client,
        })
      }

      case '/broadcast': {
        // Broadcast the request body to all connected clients.
        const body: Record<string, unknown> = await request.json()
        await this.broadcast(body)

        return respond(200, {
          success: true,
        })
      }

      default:
        return new Response('Not found', { status: 404 })
    }
  }

  async setupWebsocket(webSocket: WebSocket) {
    // Accept our side of the WebSocket connection.
    webSocket.accept()

    // Add the WebSocket to our list of connected clients.
    this.webSockets.push(webSocket)

    // Remove the WebSocket from connected list when closed or errored.
    const closeOrErrorHandler = () => {
      this.webSockets = this.webSockets.filter((ws) => ws !== webSocket)
    }
    webSocket.addEventListener('close', closeOrErrorHandler)
    webSocket.addEventListener('error', closeOrErrorHandler)
  }

  // Broadcast message to all connected clients.
  broadcast(message: Record<string, unknown>) {
    const msg = typeof message === 'string' ? message : JSON.stringify(message)

    // Filter out errored clients.
    this.webSockets = this.webSockets.filter((webSocket) => {
      try {
        webSocket.send(msg)
        return true
      } catch (err) {
        // If errored, close the socket and remove it from the list.
        webSocket.close()
        return false
      }
    })
  }
}
