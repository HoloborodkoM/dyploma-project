import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { messages, Lang } from '@/utils/messages';

export async function POST(req: NextRequest) {
  const { email, code, lang = 'ua' } = await req.json();
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  await prisma.pendingCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const pending = await prisma.pendingCode.findUnique({ where: { email } });
  if (!pending || pending.code !== code || pending.expiresAt < new Date()) {
    return NextResponse.json({ error: t.invalidOrExpiredCode }, { status: 400 });
  }

  await prisma.user.create({ data: { email, password: pending.password, name: pending.name } });
  await prisma.pendingCode.delete({ where: { email } });
  return NextResponse.json({ ok: true });
}