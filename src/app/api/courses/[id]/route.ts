import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getUserFromRequest, requireRole } from '@/utils/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
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
      const courseToDelete = await prisma.course.findUnique({
        where: { id },
        select: { authorId: true },
      });
      if (!courseToDelete) {
        return NextResponse.json({ error: t.courseNotFound }, { status: 404 });
      }
      if (courseToDelete.authorId !== user.id) {
        return NextResponse.json({ error: t.notEnoughRights }, { status: 403 });
      }
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: { sections: { include: { lessons: true } } },
    });
    if (!course) return NextResponse.json({ error: t.courseNotFound }, { status: 404 });

    const fileUrls: string[] = [];
    if (course.imageUrl) fileUrls.push(course.imageUrl);
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.videoUrl) fileUrls.push(lesson.videoUrl);
        if (lesson.documentUrl) fileUrls.push(lesson.documentUrl);
      }
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

    const sectionIds = course.sections.map((s: any) => s.id);
    await prisma.userCourseProgress.deleteMany({ where: { courseId: id } });
    await prisma.completedLesson.deleteMany({ where: { courseId: id } });

    if (sectionIds.length > 0) {
      await prisma.lesson.deleteMany({ where: { sectionId: { in: sectionIds } } });
    }

    await prisma.section.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: t.courseDeleted });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: t.courseDeletedError, details: error?.message }, { status: 500 });
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
    const existing = await prisma.course.findFirst({ where: { slug, NOT: { id } } });
    if (existing) return NextResponse.json({ error: t.courseAlreadyExists }, { status: 409 });
  }
  
  const isOnlySlugCheck = req.headers.get('X-Only-Check-Slug') === 'true';
  if (isOnlySlugCheck) {
    return NextResponse.json({ ok: true, message: 'Slug is available' });
  }
  
  const current = await prisma.course.findUnique({ 
    where: { id }, 
    select: { version: true, imageUrl: true } 
  });
  
  if (!current) {
    return NextResponse.json({ error: t.courseNotFound }, { status: 404 });
  }
  
  if (user.role !== 'ROOT') {
    const courseToUpdate = await prisma.course.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!courseToUpdate) {
      return NextResponse.json({ error: t.courseNotFound }, { status: 404 });
    }
    if (courseToUpdate.authorId !== user.id) {
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
        console.log('Old course image deleted from cloud:', imageKey);
      }
    } catch (error: any) {
      console.error('Error deleting old course image from cloud:', error);
    }
  }

  const totalLessons = (data.sections || []).reduce(
    (sum: number, section: any) => sum + (section.lessons?.length || 0),
    0
  );

  let course;
  try {
    course = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        keywords: data.keywords,
        ...(slug ? { slug } : {}),
        editedAt: new Date(),
        version: (current?.version || 1) + 1,
        totalLessons
      }
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: t.courseUpdatedError, details: error?.message }, { status: 500 });
  }

  try {
    const sections = await prisma.section.findMany({ where: { courseId: id }, select: { id: true } });
    const sectionIds = sections.map((s: any) => s.id);
    const existingLessons = await prisma.lesson.findMany({ 
      where: { sectionId: { in: sectionIds } }, 
      select: { id: true, videoUrl: true, documentUrl: true, type: true } 
    });

    const oldFileUrls: string[] = [];
    existingLessons.forEach((lesson: any) => {
      if (lesson.videoUrl) oldFileUrls.push(lesson.videoUrl);
      if (lesson.documentUrl) oldFileUrls.push(lesson.documentUrl);
    });

    await prisma.userCourseProgress.deleteMany({ where: { courseId: id } });
    await prisma.completedLesson.deleteMany({ where: { courseId: id } });

    if (data.sections && data.sections.length > 0) {
      const newFileUrls: string[] = [];
      for (const section of data.sections) {
        if (section.lessons) {
          for (const lesson of section.lessons) {
            if (lesson.videoUrl) newFileUrls.push(lesson.videoUrl);
            if (lesson.documentUrl) newFileUrls.push(lesson.documentUrl);
          }
        }
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
              console.log('Deleted unused lesson file:', key);
            }
          } catch (error: any) {
            console.error('Error deleting unused file:', url, error);
          }
        }
      }

      if (sectionIds.length > 0) {
        await prisma.lesson.deleteMany({ where: { sectionId: { in: sectionIds } } });
      }
      await prisma.section.deleteMany({ where: { courseId: id } });
      
      for (const [sectionIndex, section] of data.sections.entries()) {
        const newSection = await prisma.section.create({
          data: {
            title: section.title,
            order: sectionIndex,
            courseId: id
          }
        });

        if (section.lessons && section.lessons.length > 0) {
          for (const [lessonIndex, lesson] of section.lessons.entries()) {
            await prisma.lesson.create({
              data: {
                title: lesson.title,
                type: lesson.type || 'TEXT',
                content: lesson.content || '',
                test: lesson.test || null,
                videoUrl: lesson.videoUrl || null,
                documentUrl: lesson.documentUrl || null,
                order: lessonIndex,
                sectionId: newSection.id
              }
            });
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error updating course sections/lessons:', error);
    return NextResponse.json({ error: t.courseUpdatedError, details: error?.message }, { status: 500 });
  }
  return NextResponse.json({ course, message: t.courseUpdated });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = req.nextUrl.searchParams.get('lang') || 'ua';
  const key: Lang = lang === 'en' ? 'en' : 'ua';
  const t = messages[key];
  
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: t.notFoundId }, { status: 400 });
  
  const user = getUserFromRequest(req);

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: t.courseNotFound }, { status: 404 });
    }

    if (user) {
      const userProgress = await prisma.userCourseProgress.findUnique({
        where: {
          userId_courseId: { userId: user.id, courseId: id }
        }
      });

      const completedLessons = await prisma.completedLesson.findMany({
        where: {
          userId: user.id,
          courseId: id
        },
        select: {
          lessonId: true
        }
      });

      const completedLessonIds = completedLessons.map((cl: any) => cl.lessonId);

      const sectionsWithCompletedInfo = course.sections.map((section: any) => ({
        ...section,
        lessons: section.lessons.map((lesson: any) => ({
          ...lesson,
          completed: completedLessonIds.includes(lesson.id)
        }))
      }));

      return NextResponse.json({
        ...course,
        sections: sectionsWithCompletedInfo,
        userProgress: userProgress || null
      });
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Error loading course:', error);
    return NextResponse.json({ error: t.coursesLoadError }, { status: 500 });
  }
}