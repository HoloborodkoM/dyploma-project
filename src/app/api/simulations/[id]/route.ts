import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getUserFromRequest, requireRole } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';
import { s3 } from '@/utils/s3';
import { slugify } from '@/utils/slugify';

const B2_BUCKET = process.env.B2_BUCKET!;

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];
  
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });
  
  try {
    requireRole(user, ['MEDIC', 'ROOT']);
  } catch {
    return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
  }
  
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 404 });
    
    if (user.role !== 'ROOT') {
      const simulationToDelete = await prisma.simulation.findUnique({
        where: { id },
        select: { authorId: true },
      });
      if (!simulationToDelete) {
        return NextResponse.json({ error: t.simulationNotFound }, { status: 404 });
      }
      if (simulationToDelete.authorId !== user.id) {
        return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
      }
    }
    
    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: { steps: true }
    });
    if (!simulation) return NextResponse.json({ error: t.simulationNotFound }, { status: 404 });
    
    const fileUrls: string[] = [];
    if (simulation.imageUrl) fileUrls.push(simulation.imageUrl);
    for (const step of simulation.steps) {
      if (step.videoUrl) fileUrls.push(step.videoUrl);
    }

    for (const url of fileUrls) {
      try {
        const urlObj = new URL(url);
        let key = urlObj.pathname;
        if (key.startsWith('/')) key = key.slice(1);
        if (key.startsWith(`${B2_BUCKET}/`)) key = key.slice(B2_BUCKET.length + 1);
        if (key) {
          await s3.send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: key }));
        }
      } catch (error: any) {
        console.error('Error deleting file from B2:', url, error);
      }
    }
    
    await prisma.step.deleteMany({ where: { simulationId: id }});
    await prisma.simulation.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: t.simulationDeleted });
  } catch (error: any) {
    console.error('Error deleting simulation:', error);
    return NextResponse.json({ error: t.simulationDeletedError, details: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const lang = data.lang || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try {
    requireRole(user, ['MEDIC', 'ROOT']);
  } catch {
    return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
  }
  
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 404 });
  const slug = data.title ? slugify(data.title) : undefined;
  
  if (slug) {
    const existing = await prisma.simulation.findFirst({ where: { slug, NOT: { id } }});
    if (existing) return NextResponse.json({ error: t.simulationAlreadyExists }, { status: 409 });
  }

  const isOnlySlugCheck = req.headers.get('X-Only-Check-Slug') === 'true';
  if (isOnlySlugCheck) {
    return NextResponse.json({ ok: true, message: 'Slug is available' });
  }
    
  const current = await prisma.simulation.findUnique({ 
    where: { id }, 
    select: { version: true, imageUrl: true } 
  });
  
  if (!current) {
    return NextResponse.json({ error: t.simulationNotFound }, { status: 404 });
  }

  if (user.role !== 'ROOT') {
    const simulationToUpdate = await prisma.simulation.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!simulationToUpdate) {
      return NextResponse.json({ error: t.simulationNotFound }, { status: 404 });
    }
    if (simulationToUpdate.authorId !== user.id) {
      return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
    }
  }
  
  if (current.imageUrl && current.imageUrl !== data.imageUrl) {
    try {
      const urlObj = new URL(current.imageUrl);
      let imageKey = urlObj.pathname;
      if (imageKey.startsWith('/')) imageKey = imageKey.slice(1);
      if (imageKey.startsWith(`${B2_BUCKET}/`)) imageKey = imageKey.slice(B2_BUCKET.length + 1);
      if (imageKey) {
        await s3.send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: imageKey }));
        console.log('Old simulation image deleted from cloud:', imageKey);
      }
    } catch (error: any) {
      console.error('Error deleting old simulation image from cloud:', error);
    }
  }

  let simulation;
  try {
    simulation = await prisma.simulation.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        keywords: data.keywords,
        ...(slug ? { slug } : {}),
        editedAt: new Date(),
        version: (current?.version || 1) + 1,
      }
    });
  } catch (error: any) {
    console.error('Error updating simulation:', error);
    return NextResponse.json({ error: t.simulationUpdatedError, details: error?.message }, { status: 500 });
  }

  try {
    const existingSteps = await prisma.step.findMany({ where: { simulationId: id }, select: { id: true, videoUrl: true } });
    
    const oldFileUrls: string[] = [];
    existingSteps.forEach((step: any) => {
      if (step.videoUrl) oldFileUrls.push(step.videoUrl);
    });

    if (data.steps && data.steps.length > 0) {
      const newFileUrls: string[] = [];
      for (const step of data.steps) {
        if (step.videoUrl) newFileUrls.push(step.videoUrl);
      }

      for (const url of oldFileUrls) {
        if (!newFileUrls.includes(url)) {
          try {
            const urlObj = new URL(url);
            let key = urlObj.pathname;
            if (key.startsWith('/')) key = key.slice(1); 
            if (key.startsWith(`${B2_BUCKET}/`)) key = key.slice(B2_BUCKET.length + 1);
            if (key) {
              await s3.send(new DeleteObjectCommand({ Bucket: B2_BUCKET, Key: key }));
              console.log('Deleted unused step file:', key);
            }
          } catch (error: any) {
            console.error('Error deleting unused file:', url, error);
          }
        }
      }

      await prisma.step.deleteMany({ where: { simulationId: id } });
      
      for (const [stepIndex, step] of data.steps.entries()) {
        await prisma.step.create({
          data: {
            title: step.title,
            content: step.content,
            videoUrl: step.videoUrl,
            videoPreviewUrl: step.videoPreviewUrl,
            order: stepIndex,
            simulationId: id
          }
        });
      }
    }
  } catch (error: any) {
    console.error('Error updating simulation:', error);
    return NextResponse.json({ error: t.simulationUpdatedError, details: error?.message }, { status: 500 });
  }
  return NextResponse.json({ simulation, message: t.simulationUpdated });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 404 });
  
  try {
    const simulation = await prisma.simulation.findUnique({
      where: { id},
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!simulation) {
      return NextResponse.json({ error: t.simulationNotFound }, { status: 404 });
    }
    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Error loading simulation:', error);
    return NextResponse.json({ error: t.simulationsLoadError }, { status: 500 });
  }
}