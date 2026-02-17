import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentMessages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const messages = await db.select().from(agentMessages).where(eq(agentMessages.projectId, id)).orderBy(desc(agentMessages.createdAt)).limit(50);
    return NextResponse.json(messages.reverse());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
