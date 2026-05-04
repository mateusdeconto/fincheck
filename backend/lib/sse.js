/**
 * Helpers para Server-Sent Events resilientes.
 *  - Heartbeat a cada 15s evita que proxies (Cloudflare/Railway) matem a conexão.
 *  - X-Accel-Buffering: no impede buffering em Nginx-likes.
 */

export function openSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(': keep-alive\n\n');
  }, 15000);

  res.on('close', () => clearInterval(heartbeat));
  res.on('finish', () => clearInterval(heartbeat));

  return {
    sendText: (text) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    },
    sendMeta: (payload) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
    },
    sendError: (message) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    },
    end: () => {
      if (!res.writableEnded) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
      clearInterval(heartbeat);
    },
  };
}
