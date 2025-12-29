import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { messages, Lang } from '@/utils/messages';

export async function POST(req: NextRequest) {
  const { email, code, newPassword, lang = 'ua' } = await req.json();
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  await prisma.pendingCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const pending = await prisma.pendingCode.findUnique({ where: { email } });
  if (!pending || pending.code !== code || pending.expiresAt < new Date()) {
    return NextResponse.json({ error: t.invalidOrExpiredCode }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });
  await prisma.pendingCode.delete({ where: { email } });
  return NextResponse.json({ message: t.passwordChanged });
}