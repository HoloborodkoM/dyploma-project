import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/utils/prisma';
import { messages, Lang } from '@/utils/messages';
import bcrypt from 'bcryptjs';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, name, password, lang = 'ua' } = await req.json();
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  if (!email || !name || !password) {
    return NextResponse.json({ error: t.required }, { status: 400 });
  }
  if (!/^[\w.+-]+@gmail\.com$/.test(email)) {
    return NextResponse.json({ error: t.onlyGmail }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: t.exists }, { status: 400 });
  }

  const code = generateCode();
  const hashedPassword = await bcrypt.hash(password, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.pendingCode.upsert({
    where: { email },
    update: { code, expiresAt, name, password: hashedPassword },
    create: { email, code, expiresAt, name, password: hashedPassword },
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = t.registrationSubject(name);
  const text = t.registrationText(code);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e && e.message && (e.message.includes('Invalid recipient') || e.message.includes('No recipients defined') || e.message.includes('Invalid email'))) {
      return NextResponse.json({ error: t.invalidEmail }, { status: 400 });
    }
    return NextResponse.json({ error: t.emailSend }, { status: 500 });
  }
}