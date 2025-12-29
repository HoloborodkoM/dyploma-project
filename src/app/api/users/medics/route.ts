import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest, requireRole } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try {
    requireRole(user, ['ROOT']);
  } catch {
    return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
  }

  try {
    const medics = await prisma.user.findMany({
      where: { role: 'MEDIC' },
      select: { id: true, email: true, name: true, role: true }
    });
    return NextResponse.json(medics);
  } catch (error) {
    return NextResponse.json({ error: t.medicsLoadError }, { status: 500 });
  }
}