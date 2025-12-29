import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest } from '@/utils/auth';
import { messages, Lang } from '@/utils/messages';

export async function POST(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];
  
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: t.notAuthorized }, { status: 401 });
  
  const { lessonId, timeSpent } = await req.json();
  if (!lessonId) return NextResponse.json({ error: t.lessonIdRequired }, { status: 400 });

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: {
            courseId: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: t.lessonNotFound }, { status: 404 });
    }

    const courseId = lesson.section.courseId;
    const existingCompletion = await prisma.completedLesson.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } }
    });

    if (existingCompletion) {
      return NextResponse.json({ 
        ok: true, 
        message: t.lessonCompleted,
        alreadyCompleted: true 
      });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.completedLesson.create({
        data: { 
          userId: user.id, 
          lessonId,
          courseId,
          timeSpent: timeSpent || 0,
          completedAt: new Date()
        }
      });

      let courseProgress = await tx.userCourseProgress.findUnique({
        where: {
          userId_courseId: { userId: user.id, courseId }
        }
      });

      if (!courseProgress) {
        courseProgress = await tx.userCourseProgress.create({
          data: {
            userId: user.id,
            courseId,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            lastAccessAt: new Date(),
            completedLessonsCount: 1
          }
        });
      } else {
        courseProgress = await tx.userCourseProgress.update({
          where: { id: courseProgress.id },
          data: {
            completedLessonsCount: {
              increment: 1
            },
            lastAccessAt: new Date()
          }
        });
      }

      const course = await tx.course.findUnique({
        where: { id: courseId },
        select: { totalLessons: true }
      });

      let totalLessons = course?.totalLessons || 0;
      if (totalLessons === 0) {
        const lessonsCount = await tx.lesson.count({
          where: {
            section: {
              courseId
            }
          }
        });
        
        totalLessons = lessonsCount;
        
        await tx.course.update({
          where: { id: courseId },
          data: { totalLessons: lessonsCount }
        });
      }

      const isCompleted = courseProgress.completedLessonsCount === totalLessons && totalLessons > 0;
      if (isCompleted) {
        await tx.userCourseProgress.update({
          where: { id: courseProgress.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }

      const progress = totalLessons > 0 
        ? Math.round((courseProgress.completedLessonsCount / totalLessons) * 100) 
        : 0;

      return {
        completedLessonsCount: courseProgress.completedLessonsCount,
        totalLessons,
        progress,
        isCompleted
      };
    });

    return NextResponse.json({ 
      ok: true,
      message: result.isCompleted ? t.courseCompleted : t.lessonCompleted,
      progress: result.progress,
      completedLessonsCount: result.completedLessonsCount,
      totalLessons: result.totalLessons,
      isCompleted: result.isCompleted,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json({ error: t.courseProgressError }, { status: 500 });
  }
}