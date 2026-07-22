// ── ZeptoMail thin client ─────────────────────────────────────────────────
//
// Docs: https://www.zoho.com/zeptomail/help/api/email-sending.html
//
// We only send transactional order emails right now, so we skip the official
// Java SDK and hit the HTTPS endpoint directly with fetch. This keeps the
// dependency graph minimal (no new NPM install) and works identically in
// Node.js runtime + Vercel edge.
//
// Env vars consumed (see .env.example):
//   ZEPTOMAIL_TOKEN     — full Authorization header value including the
//                         "Zoho-enczapikey " prefix
//   ZEPTOMAIL_API_BASE  — regional endpoint, e.g. https://api.zeptomail.in
//   ZEPTOMAIL_FROM_EMAIL, ZEPTOMAIL_FROM_NAME — sender identity
//   ZEPTOMAIL_REPLY_TO  — optional reply-to address

export interface ZeptoAddress {
  email: string;
  name?: string;
}

export interface ZeptoMailParams {
  to: ZeptoAddress | ZeptoAddress[];
  subject: string;
  htmlBody: string;
  /** Plain-text fallback — Gmail/Outlook use this when HTML is stripped. */
  textBody?: string;
  /** Overrides ZEPTOMAIL_REPLY_TO for this specific send. */
  replyTo?: string;
}

export interface ZeptoSendResult {
  ok: boolean;
  /** ZeptoMail's request id; useful for cross-referencing in their dashboard. */
  request_id?: string;
  /** Populated only on failure. */
  error?: string;
  /** Raw response body from ZeptoMail (parsed if JSON) — for debugging. */
  raw?: unknown;
}

export function isZeptoMailConfigured(): boolean {
  return !!(process.env.ZEPTOMAIL_TOKEN && process.env.ZEPTOMAIL_FROM_EMAIL);
}

/**
 * Send a single transactional email through ZeptoMail.
 *
 * Never throws — errors are returned in the result object so callers can
 * choose their own log/retry strategy. Order-confirmation emails MUST NOT
 * block the payment success response.
 */
export async function sendZeptoMail(params: ZeptoMailParams): Promise<ZeptoSendResult> {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "World of Mysore Pak";
  const apiBase = process.env.ZEPTOMAIL_API_BASE ?? "https://api.zeptomail.in";
  const replyTo = params.replyTo ?? process.env.ZEPTOMAIL_REPLY_TO;

  if (!token || !fromEmail) {
    return { ok: false, error: "ZeptoMail not configured — set ZEPTOMAIL_TOKEN and ZEPTOMAIL_FROM_EMAIL" };
  }

  const toList = Array.isArray(params.to) ? params.to : [params.to];

  // ZeptoMail's payload shape mirrors their /v1.1/email spec verbatim.
  const payload = {
    from: { address: fromEmail, name: fromName },
    to: toList.map((r) => ({
      email_address: { address: r.email, name: r.name ?? "" },
    })),
    subject: params.subject,
    htmlbody: params.htmlBody,
    ...(params.textBody ? { textbody: params.textBody } : {}),
    ...(replyTo ? { reply_to: [{ address: replyTo }] } : {}),
  };

  try {
    const res = await fetch(`${apiBase}/v1.1/email`, {
      method: "POST",
      headers: {
        // Token already includes the "Zoho-enczapikey " scheme prefix
        Authorization: token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    // ZeptoMail returns JSON for both success and error responses
    let json: Record<string, unknown> | null = null;
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      // Non-JSON body (rare — usually a 5xx from a load-balancer)
    }

    if (!res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errBody = json as any;
      const message =
        errBody?.error?.message ??
        errBody?.message ??
        `ZeptoMail ${res.status} ${res.statusText}`;
      return { ok: false, error: String(message).slice(0, 500), raw: json };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successBody = json as any;
    return {
      ok: true,
      request_id: successBody?.request_id ?? successBody?.data?.[0]?.additional_info?.[0]?.request_id,
      raw: json,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "ZeptoMail request failed",
    };
  }
}
