import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/utils/prisma';
import { messages, Lang } from '@/utils/messages';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, lang = 'ua' } = await req.json();
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.pendingCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  await prisma.pendingCode.upsert({
    where: { email },
    update: { code, expiresAt },
    create: { email, code, expiresAt, name: '', password: '' },
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = t.passwordResetSubject;
  const text = t.passwordResetText(code);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text,
    });
    return NextResponse.json({ ok: true, message: t.instructionsSent });
  } catch (e: any) {
    return NextResponse.json({ error: t.emailSend }, { status: 500 });
  }
}