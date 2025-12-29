import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function POST(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];
  
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });
  
  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: t.courseIdRequired }, { status: 400 });

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: t.courseNotFound }, { status: 404 });
    }

    const existingProgress = await prisma.userCourseProgress.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId }
      }
    });

    if (existingProgress) {
      await prisma.userCourseProgress.update({
        where: { id: existingProgress.id },
        data: { 
          lastAccessAt: new Date(),
          status: existingProgress.status === 'COMPLETED' ? 'IN_PROGRESS' : existingProgress.status
        }
      });
      
      return NextResponse.json({ 
        ok: true, 
        message: t.courseProgressUpdated, 
        status: existingProgress.status === 'COMPLETED' ? 'IN_PROGRESS' : existingProgress.status
      });
    }

    let totalLessons = 0;
    course.sections.forEach((section: any) => {
      totalLessons += section.lessons.length;
    });

    await prisma.userCourseProgress.create({
      data: {
        userId: user.id,
        courseId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        lastAccessAt: new Date(),
        completedLessonsCount: 0
      }
    });

    if (course.totalLessons !== totalLessons) {
      await prisma.course.update({
        where: { id: courseId },
        data: { totalLessons }
      });
    }

    return NextResponse.json({
      ok: true,
      message: t.courseStarted,
      progress: 0,
      status: 'IN_PROGRESS'
    });

  } catch (error) {
    console.error('Error starting course:', error);
    return NextResponse.json({ error: t.courseProgressError }, { status: 500 });
  }
}