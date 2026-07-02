import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";

// Best-effort per-IP rate limit within a single Worker isolate.
// Serverless isolates may reset, but this raises the bar for abuse.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const ipHits = new Map<string, number[]>();

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    ipHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  ipHits.set(ip, arr);
  return false;
}

export function signTicket(secret: string, payload: { ip: string; exp: number }): string {
  const body = `${payload.ip}.${payload.exp}`;
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  return `${payload.exp}.${sig}`;
}

export const Route = createFileRoute("/api/public/moment-ticket")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.MOMENT_TICKET_SECRET;
        if (!secret) {
          console.error("[moment-ticket] Missing MOMENT_TICKET_SECRET");
          return Response.json({ error: "Service unavailable" }, { status: 503 });
        }
        const ip = clientIp(request);
        if (rateLimited(ip)) {
          return Response.json({ error: "Too many requests" }, { status: 429 });
        }
        const exp = Date.now() + 5 * 60_000; // 5 minutes
        const ticket = signTicket(secret, { ip, exp });
        return Response.json({ ticket });
      },
    },
  },
});