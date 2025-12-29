import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { messages, Lang } from '@/utils/messages';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  const { email, password, lang = 'ua' } = await req.json();
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  if (!email || !password) {
    return NextResponse.json({ error: t.required }, { status: 400 });
  }
  if (!/^[\w.+-]+@gmail\.com$/.test(email)) {
    return NextResponse.json({ error: t.onlyGmail }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: t.notFound }, { status: 404 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: t.wrongPassword }, { status: 401 });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET as string, { expiresIn: '7d' });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}