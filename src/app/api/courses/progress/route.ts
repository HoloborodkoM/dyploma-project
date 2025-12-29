import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });

  try {
    const inProgressRecords = await prisma.userCourseProgress.findMany({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS'
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: true
              }
            },
            author: true
          }
        }
      },
      orderBy: {
        lastAccessAt: 'desc'
      }
    });

    if (inProgressRecords.length === 0) {
      return NextResponse.json([]);
    }

    const inProgressCourses = inProgressRecords.map((record: any) => {
      const totalLessons = record.course.totalLessons || 0;
      const progress = totalLessons > 0
        ? Math.round((record.completedLessonsCount / totalLessons) * 100)
        : 0;
        
      return {
        ...record.course,
        progress,
        lastAccessAt: record.lastAccessAt,
        completedLessonsCount: record.completedLessonsCount,
        totalLessons
      };
    });

    return NextResponse.json(inProgressCourses);
  } catch (error) {
    return NextResponse.json({ error: t.inProgressCoursesLoadError }, { status: 500 });
  }
}