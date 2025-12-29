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
    const completedRecords = await prisma.userCourseProgress.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED'
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
        completedAt: 'desc'
      }
    });

    if (completedRecords.length === 0) {
      return NextResponse.json([]);
    }

    const completedCourses = completedRecords.map((record: any) => ({
      ...record.course,
      progress: 100,
      completedAt: record.completedAt,
      completedLessonsCount: record.completedLessonsCount,
      totalLessons: record.course.totalLessons || 0
    }));

    return NextResponse.json(completedCourses);
  } catch (error) {
    console.error('Error loading completed courses:', error);
    return NextResponse.json({ error: t.completedCoursesLoadError }, { status: 500 });
  }
}