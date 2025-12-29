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

  try {
    if (user.role === 'ROOT') {
      const courses = await prisma.course.findMany({
        include: { 
          sections: { include: { lessons: true } },
          author: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(courses);
    } 
    
    const courses = await prisma.course.findMany({
      where: { authorId: user.id },
      include: { 
        sections: { include: { lessons: true } },
        author: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error loading courses:', error);
    return NextResponse.json({ error: t.coursesLoadError }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  
  try {
    const slug = slugify(data.title);
    const existing = await prisma.course.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: t.courseAlreadyExists }, { status: 409 });
    }

    const isOnlySlugCheck = req.headers.get('X-Only-Check-Slug') === 'true';
    if (isOnlySlugCheck) {
      return NextResponse.json({ ok: true, message: 'Slug is available' });
    }
    
    const totalLessons = (data.sections || []).reduce(
      (sum: number, section: any) => sum + (section.lessons?.length || 0),
      0
    );
    
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        authorId: user.id,
        keywords: data.keywords || [],
        version: 1,
        totalLessons,
        sections: {
          create: (data.sections || []).map((section: any, sIdx: number) => ({
            title: section.title,
            order: sIdx,
            lessons: {
              create: (section.lessons || []).map((lesson: any, lIdx: number) => ({
                title: lesson.title,
                type: lesson.type ? lesson.type.toUpperCase() : 'TEXT',
                content: lesson.content || '',
                test: lesson.test || null,
                videoUrl: lesson.videoUrl || null,
                documentUrl: lesson.documentUrl || null,
                order: lIdx,
              }))
            }
          }))
        },
      },
      include: { 
        sections: { 
          include: { lessons: true },
          orderBy: { order: 'asc' }
        }
      },
    });
    
    return NextResponse.json({ course, message: t.courseCreated });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: t.courseCreatedError }, { status: 500 });
  }
}