import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSMS, formatReminderMessage } from "@/lib/twilio";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const message = formatReminderMessage(client.name);
    const result = await sendSMS(client.phone, message);

    await prisma.smsLog.create({
      data: {
        clientId: client.id,
        message,
        status: result.status,
        twilioSid: result.sid || null,
      },
    });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.success
        ? `Test SMS ${result.status} to ${client.name}`
        : `Failed: ${result.error}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
