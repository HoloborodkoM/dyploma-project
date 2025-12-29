import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest, requireRole } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];
  
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try{
    requireRole(user, ['ROOT']);
  } catch (error) {
    return NextResponse.json({ error: t.notAuthorized }, { status: 403 });
  }

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 404 });

  if (user.id === id) return NextResponse.json({ error: t.cannotChangeYourOwnRole }, { status: 400 });

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role === 'ROOT') {
      return NextResponse.json({ error: t.cannotChangeRoleForThisUser }, { status: 400 });
    }

    const body = await req.json();
    if (!['USER', 'MEDIC'].includes(body.role)) {
      return NextResponse.json({ error: t.invalidRole }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { role: body.role } });
    return NextResponse.json({ message: t.roleChanged });
  } catch (error) {
    return NextResponse.json({ error: t.errorChangingRole }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 404 });

  if (user.id !== id) {
    return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: t.accountDeleted });
  } catch (error) {
    return NextResponse.json({ error: t.errorDeletingAccount }, { status: 500 });
  }
}