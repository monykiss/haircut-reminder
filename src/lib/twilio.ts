import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const isDemoMode =
  !accountSid || !authToken || !accountSid.startsWith("AC");

let twilioClient: twilio.Twilio | null = null;

if (!isDemoMode) {
  twilioClient = twilio(accountSid, authToken);
}

export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; status: string; error?: string }> {
  if (isDemoMode) {
    console.log(`[DEMO SMS] To: ${to} | Body: ${body}`);
    return { success: true, sid: `DEMO_${Date.now()}`, status: "demo" };
  }

  try {
    const message = await twilioClient!.messages.create({
      to,
      messagingServiceSid,
      body,
    });
    return { success: true, sid: message.sid, status: "sent" };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[SMS ERROR] To: ${to} | Error: ${errMsg}`);
    return { success: false, status: "failed", error: errMsg };
  }
}

export function formatReminderMessage(
  clientName: string,
  template?: string
): string {
  const tmpl =
    template ||
    process.env.SMS_TEMPLATE ||
    "Hey {name}! 💈 Time for your monthly cut. Give us a call or book online. Reply STOP to opt out.";
  return tmpl.replace(/{name}/g, clientName);
}
