import { db } from "@/lib/db";

const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

// ---------------------------------------------------------------------------
// Phone detection & normalisation
// ---------------------------------------------------------------------------

export function isPhoneNumber(phoneOrEmail: string): boolean {
  return !phoneOrEmail.includes("@");
}

/** Normalise a Zambian number to E.164 (+260XXXXXXXXX) */
export function toE164Zambia(raw: string): string {
  const digits = raw.replace(/[\s\-\(\)]/g, "");
  if (digits.startsWith("+")) return digits;           // already E.164
  if (digits.startsWith("260")) return `+${digits}`;  // 260XXXXXXXXX
  if (digits.startsWith("0")) return `+260${digits.slice(1)}`; // 09XXXXXXXX
  return `+260${digits}`;                              // bare digits
}

// ---------------------------------------------------------------------------
// Raw Meta Cloud API call
// ---------------------------------------------------------------------------

type TemplateComponent = {
  type: "body";
  parameters: Array<{ type: "text"; text: string }>;
};

type SendTemplateOptions = {
  to: string;
  templateName: string;
  languageCode: string;
  components?: TemplateComponent[];
};

type WhatsAppSendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

async function sendTemplate(opts: SendTemplateOptions): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN — message not sent");
    return { ok: false, error: "Missing WhatsApp credentials" };
  }

  // In non-production, redirect all messages to the test number if set
  const recipient =
    process.env.NODE_ENV !== "production" && process.env.WHATSAPP_TEST_NUMBER
      ? process.env.WHATSAPP_TEST_NUMBER
      : opts.to;

  const body = {
    messaging_product: "whatsapp",
    to: recipient,
    type: "template",
    template: {
      name: opts.templateName,
      language: { code: opts.languageCode },
      ...(opts.components?.length ? { components: opts.components } : {}),
    },
  };

  try {
    const res = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message: string };
    };

    if (!res.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }

    return { ok: true, messageId: json.messages?.[0]?.id ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ---------------------------------------------------------------------------
// Notification event types
// ---------------------------------------------------------------------------

export type NotificationEvent =
  | "OTP_SENT"
  | "INVITE_CREATED"
  | "PAYMENT_LOGGED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_DISPUTED"
  | "DISPUTE_FILED"
  | "DISPUTE_RESOLVED";

// ---------------------------------------------------------------------------
// Fire-and-forget dispatcher — never throws, never blocks caller
// ---------------------------------------------------------------------------

type SendWhatsAppOptions = {
  recipientId: string;
  phoneOrEmail: string;
  event: NotificationEvent;
  templateName: string;
  params: string[];
};

export async function sendWhatsApp(opts: SendWhatsAppOptions): Promise<void> {
  // Skip users with email addresses — WhatsApp requires a phone number
  if (!isPhoneNumber(opts.phoneOrEmail)) {
    await db.notification.create({
      data: {
        recipientId: opts.recipientId,
        event: opts.event,
        status: "SKIPPED",
        error: "Recipient uses email, not a phone number",
        metadata: JSON.stringify({ template: opts.templateName, params: opts.params }),
      },
    });
    return;
  }

  const phone = toE164Zambia(opts.phoneOrEmail);

  // Log as PENDING before attempting send
  const record = await db.notification.create({
    data: {
      recipientId: opts.recipientId,
      event: opts.event,
      status: "PENDING",
      metadata: JSON.stringify({ template: opts.templateName, params: opts.params }),
    },
  });

  const result = await sendTemplate({
    to: phone,
    templateName: opts.templateName,
    languageCode: "en",
    components:
      opts.params.length > 0
        ? [
            {
              type: "body",
              parameters: opts.params.map((text) => ({ type: "text" as const, text })),
            },
          ]
        : [],
  });

  // Update log with outcome
  await db.notification.update({
    where: { id: record.id },
    data: {
      status: result.ok ? "SENT" : "FAILED",
      messageId: result.ok ? result.messageId : undefined,
      error: result.ok ? undefined : result.error,
    },
  });
}
