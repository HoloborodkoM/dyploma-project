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
    const users = await prisma.user.findMany({
      where: { role: { not: 'ROOT' } },
      select: { id: true, email: true, name: true, role: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: t.usersLoadError }, { status: 500 });
  }
}