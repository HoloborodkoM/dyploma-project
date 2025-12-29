import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { messages } from '@/utils/messages';
import { s3 } from '@/utils/s3';

const B2_BUCKET = process.env.B2_BUCKET!;
const B2_ENDPOINT = process.env.B2_ENDPOINT!;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'ua';
  const t = messages[lang];

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: t.fileRequired }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const fileType = String(formData.get('fileType') || 'other');
  const uniqueId = uuidv4().replace(/-/g, '').substring(0, 8);
  const fileName = file.name.replace(/[^\p{L}\d._-]+/gu, '_');

  let key = `${uniqueId}-${fileName}`;
  if (fileType === 'videos' || fileType === 'images' || fileType === 'documents') {
    key = `${fileType}/${uniqueId}-${fileName}`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const putParams = {
      Bucket: B2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read' as const,
    };
    await s3.send(new PutObjectCommand(putParams));
  } catch (e: any) {
    return NextResponse.json({ error: t.uploadError, details: e }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  const url = `https://${B2_ENDPOINT}/${B2_BUCKET}/${key}`;

  return NextResponse.json({ url }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}