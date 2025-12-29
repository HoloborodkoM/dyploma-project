import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try {
    const availableCourses = await prisma.course.findMany({
      where: {
        NOT: {
          userProgress: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        sections: {
          include: {
            lessons: true
          }
        },
        author: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(availableCourses);
  } catch (error) {
    return NextResponse.json({ error: t.availableCoursesLoadError }, { status: 500 });
  }
}