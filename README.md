# websockets-cf-worker

A [Cloudflare Worker](https://workers.cloudflare.com/) that uses [Durable
Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects/)
to serve WebSockets that forward indexer webhook data to connected clients.

This is used to refresh the UI when data changes.

## Configuration

1. Copy `wrangler.toml.example` to `wrangler.toml`.

2. Configure secrets:

```sh
echo <VALUE> | npx wrangler secret put WEBHOOK_SECRET
```

## Development

```sh
wrangler dev
# OR
npm run start
```

## Deploy

```sh
wrangler publish
# OR
npm run deploy
```
