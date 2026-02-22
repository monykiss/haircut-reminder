import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, activeClients, sentThisMonth, nextReminders] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { isActive: true, optedOut: false } }),
      prisma.smsLog.count({
        where: { sentAt: { gte: startOfMonth }, status: { in: ["sent", "demo"] } },
      }),
      prisma.client.findMany({
        where: { isActive: true, optedOut: false },
        orderBy: { reminderDay: "asc" },
        take: 5,
        select: { name: true, reminderDay: true },
      }),
    ]);

  // Find next upcoming reminder day
  const today = now.getDate();
  const nextClient = nextReminders.find((c) => c.reminderDay >= today) || nextReminders[0];

  return NextResponse.json({
    totalClients,
    activeClients,
    sentThisMonth,
    nextReminderDay: nextClient?.reminderDay || null,
    nextReminderName: nextClient?.name || null,
  });
}
