import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  try {
    const allSimulations = await prisma.simulation.findMany({
      include: {
        author: true,
        steps: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(allSimulations);
  } catch (error) {
    return NextResponse.json({ error: t.simulationsLoadError }, { status: 500 });
  }
}