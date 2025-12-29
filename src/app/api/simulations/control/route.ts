import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest, requireRole } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';
import { slugify } from '@/utils/slugify';

export async function GET(req: NextRequest) {
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

  const allSimulations = req.nextUrl.searchParams.get('all') === '1';

  try {
    if (user.role === 'ROOT' && allSimulations) {
      const simulations = await prisma.simulation.findMany({
        include: { 
          steps:  true,
          author: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(simulations);
    }

    const simulations = await prisma.simulation.findMany({
      where: { authorId: user.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        steps: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error('Error loading simulations:', error);
    return NextResponse.json({ error: t.simulationsLoadError }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const lang = data.lang || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try {
    requireRole(user, ['MEDIC', 'ROOT']);
  } catch {
    return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
  }

  try {
    const slug = slugify(data.title);
    const existing = await prisma.simulation.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: t.simulationAlreadyExists }, { status: 409 });
    }

    const isOnlySlugCheck = request.headers.get('X-Only-Check-Slug') === 'true';
    if (isOnlySlugCheck) {
      return NextResponse.json({ ok: true, message: 'Slug is available' });
    }

    const simulation = await prisma.simulation.create({
      data: {
        title: data.title,
        slug,
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        authorId: user.id,
        keywords: data.keywords || [],
        version: 1,
        steps: {
          create: (data.steps || []).map((step: any, sIdx: number) => ({
            title: step.title,
            order: sIdx,
            content: step.content || '',
            videoUrl: step.videoUrl || null,
            videoPreviewUrl: step.videoPreviewUrl || null
          }))
        },
      },
      include: {
        steps: { orderBy: { order: 'asc' } }
      }
    });

    return NextResponse.json({ simulation, message: t.simulationCreated });
  } catch (error) {
    console.error('Error creating simulation:', error);
    return NextResponse.json({ error: t.simulationCreatedError }, { status: 500 });
  }
}