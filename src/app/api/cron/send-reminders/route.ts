import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSMS, formatReminderMessage } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const dayOfMonth = today.getDate();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  // Find clients whose reminder day is today, or whose reminder day exceeds
  // the last day of the month (send on last day instead)
  const clients = await prisma.client.findMany({
    where: {
      isActive: true,
      optedOut: false,
      OR: [
        { reminderDay: dayOfMonth },
        ...(dayOfMonth === lastDayOfMonth
          ? [{ reminderDay: { gt: lastDayOfMonth } }]
          : []),
      ],
    },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const client of clients) {
    if (client.optedOut) {
      skipped++;
      continue;
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

    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({
    date: today.toISOString(),
    dayOfMonth,
    sent,
    failed,
    skipped,
    total: clients.length,
  });
}

// Vercel Cron calls GET
export async function GET(req: NextRequest) {
  return POST(req);
}
