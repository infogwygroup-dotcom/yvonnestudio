// Fetch a short-lived signed ticket before posting to /api/create-moment.
// The ticket endpoint is IP-rate-limited server-side.
export async function fetchMomentTicket(): Promise<string> {
  const res = await fetch("/api/public/moment-ticket");
  if (!res.ok) {
    throw new Error("Please wait a moment before trying again.");
  }
  const { ticket } = (await res.json()) as { ticket?: string };
  if (!ticket) throw new Error("Please wait a moment before trying again.");
  return ticket;
}

export async function postCreateMoment(fd: FormData): Promise<Response> {
  const ticket = await fetchMomentTicket();
  return fetch("/api/create-moment", {
    method: "POST",
    body: fd,
    headers: { "x-moment-ticket": ticket },
  });
}