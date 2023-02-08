export const respond = (status: number, response: Record<string, unknown>) =>
  new Response(JSON.stringify(response), {
    status,
  })

export const respondError = (status: number, error: string) =>
  respond(status, { error })
