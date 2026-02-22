import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString().trim().toUpperCase();
    const from = formData.get("From")?.toString();

    if (body === "STOP" && from) {
      await prisma.client.updateMany({
        where: { phone: from },
        data: { optedOut: true, isActive: false },
      });
    }

    // Return TwiML empty response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
