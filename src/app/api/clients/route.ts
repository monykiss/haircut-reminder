import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+1\d{10}$/, "Phone must be in E.164 format: +1XXXXXXXXXX"),
  reminderDay: z.number().int().min(1).max(31),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { smsLogs: true } } },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = clientSchema.parse(body);

    const client = await prisma.client.create({ data });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A client with this phone number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
