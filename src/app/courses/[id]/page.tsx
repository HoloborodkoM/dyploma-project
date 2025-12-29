"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/utils/auth';
import CourseStartHeader from '@/components/course/basic/CourseStartHeader';
import CourseSectionList, { Lesson } from '@/components/course/basic/CourseSectionList';
import LessonModal from '@/components/course/modal/LessonModal';
import Notification from '@/components/Notification';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ErrorBlock from '@/components/page-error/PageErrorBlock';

const CoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params?.id;
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCourse = async () => {
    setError('');
    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const res = await fetchWithAuth(`/api/courses/${courseId}?lang=${lang}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setCourse(data);
      setStarted(!!data.userProgress);

      setCompletedLessons(data.sections
        ? data.sections.flatMap((s: any) => s.lessons.filter((l: any) => l.completed).map((l: any) => l.id))
        : []);
      
        if (data.userProgress && data.totalLessons) {
        const completedCount = data.sections
          ? data.sections.flatMap((s: any) => s.lessons.filter((l: any) => l.completed)).length
          : 0;
        setProgress(Math.round((completedCount / data.totalLessons) * 100));
      } else {
        setProgress(0);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (courseId && !user) {
      router.push('/unauthorized');
    } else if (courseId && user) {
      fetchCourse();
    }
  }, [courseId, user]);

  const handleStart = async () => {
    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const res = await fetchWithAuth(`/api/courses/start?lang=${lang}`, {
        method: 'POST',
        body: JSON.stringify({ courseId: Number(courseId), lang }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStarted(true);
      setNotification({ type: 'success', message: data.message });
      setProgress(data.progress);

      await fetchCourse();
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/unauthorized');
      } else {
        setNotification({ type: 'error', message: error.message });
      }
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!started && !lesson.completed) return;
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const handleCloseLesson = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;
    setLessonLoading(true);
    try {
      const lang = localStorage.getItem('preferredLanguage') || 'ua';
      const res = await fetchWithAuth(`/api/lessons/complete?lang=${lang}`, {
        method: 'POST',
        body: JSON.stringify({ lessonId: selectedLesson.id, lang }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setNotification({ type: 'success', message: data.message });
      setProgress(data.progress);
      
      if (data.isCompleted) {
        setNotification({ type: 'success', message: data.message });
        setTimeout(() => {
          router.push('/courses');
        }, 3000);
      } else {
        await fetchCourse();
      }
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/unauthorized');
      } else {
        setNotification({ type: 'error', message: error.message });
      }
    } finally {
      setLessonLoading(false);
      setShowLessonModal(false);
      setSelectedLesson(null);
    }
  };
  
  if (error) return <ErrorBlock message={error} />;
  if (!course) return null;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-2 md:px-0 py-6">
        {notification && (
          <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
        )}
        <CourseStartHeader
          started={started}
          progress={progress}
          onStart={handleStart}
          title={course.title}
          description={course.description}
          completedCount={completedLessons.length}
          totalCount={course.totalLessons}
        />
        <CourseSectionList
          sections={course.sections}
          onLessonClick={handleLessonClick}
          locked={!started}
        />
        <LessonModal
          open={showLessonModal}
          onClose={handleCloseLesson}
          lesson={selectedLesson}
          onComplete={handleCompleteLesson}
          completed={!!selectedLesson?.completed}
          loading={lessonLoading}
        />
      </div>
      <Footer />
    </>
  );
};

export default CoursePage;