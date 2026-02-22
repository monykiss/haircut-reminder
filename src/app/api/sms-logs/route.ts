import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const logs = await prisma.smsLog.findMany({
    take: limit,
    orderBy: { sentAt: "desc" },
    include: { client: { select: { name: true, phone: true } } },
  });

  return NextResponse.json(logs);
}
