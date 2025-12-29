'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TranslatedText } from '@/components/TranslatedText';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import { fetchWithAuth } from '@/utils/auth';
import CourseList from '@/components/cards/list/CardList';
import CourseForm from '@/components/form/Form';
import { useRouter } from 'next/navigation';
import Filter from '@/components/search/filter/Filter';
import Notification from '@/components/Notification';

const TABS = [
  { key: 'available', label: <TranslatedText text="Доступні курси" /> },
  { key: 'inProgress', label: <TranslatedText text="У процесі" /> },
  { key: 'completed', label: <TranslatedText text="Завершені" /> },
];

const CoursesPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('coursesActiveTab') || 'available';
    }
    return 'available';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  const [allAvailableCourses, setAllAvailableCourses] = useState<any[]>([]);
  const [allInProgressCourses, setAllInProgressCourses] = useState<any[]>([]);
  const [allCompletedCourses, setAllCompletedCourses] = useState<any[]>([]);
  const [allMyCourses, setAllMyCourses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | number | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [editCourse, setEditCourse] = useState<any | null>(null);

  const handleFiltered = useCallback(
    ({ available, inProgress, completed, my }: any) => {
      setAvailableCourses(available);
      setInProgressCourses(inProgress);
      setCompletedCourses(completed);
      setMyCourses(my);
    },
    []
  );

  const items = useMemo(() => ({
    available: allAvailableCourses,
    inProgress: allInProgressCourses,
    completed: allCompletedCourses,
    my: allMyCourses
  }), [allAvailableCourses, allInProgressCourses, allCompletedCourses, allMyCourses]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
        
        const resAvailable = await fetchWithAuth(`/api/courses/available?lang=${currentLang}`);
        if (resAvailable.ok) {
          const notStartedCourses = await resAvailable.json();
          setAllAvailableCourses(notStartedCourses || []);
        }
        
        const resInProgress = await fetchWithAuth(`/api/courses/progress?lang=${currentLang}`);
        if (resInProgress.ok) {
          const inProgressCourses = await resInProgress.json();
          setAllInProgressCourses(inProgressCourses || []);
        }
        
        const resCompleted = await fetchWithAuth(`/api/courses/completed?lang=${currentLang}`);
        if (resCompleted.ok) {
          const completedCourses = await resCompleted.json();
          setAllCompletedCourses(completedCourses || []);
        }
        
        if (user?.role === 'MEDIC' || user?.role === 'ROOT') {
          const endpoint = user.role === 'ROOT' 
            ? `/api/courses/control?all=1&lang=${currentLang}` 
            : `/api/courses/control?lang=${currentLang}`;
            
          const resMine = await fetchWithAuth(endpoint);
          const myCourseData = resMine.ok ? await resMine.json() : [];
          setAllMyCourses(myCourseData);
        }
      } catch (error: any) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          router.push('/unauthorized');
        } else {
          setNotification({ type: 'error', message: 'Error loading courses' });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [reloadFlag]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coursesActiveTab', tab);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditCourseId(course.id);
    setTitle(course.title);
    setDescription(course.description);
    setSections(course.sections || [{ title: '', lessons: [] }]);
    setEditCourse(course);
    setShowEdit(true);
  };

  const handleDeleteCourseConfirmed = async () => {
    if (!deleteCourseId) return;
    setShowDeleteModal(false);
    try {
      const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
      
      const res = await fetchWithAuth(`/api/courses/${deleteCourseId}?lang=${currentLang}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
      
      const result = await res.json();
      setNotification({ type: 'success', message: result.message });
      setReloadFlag(f => f + 1);
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/unauthorized');
      } else {
        setNotification({ type: 'error', message: error.message });
      }
    }
    setDeleteCourseId(null);
  };

  const handleCourseCardClick = (course: any) => {
    if (course.id === 'create') {
      setShowCreate(true);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  const getActiveCoursesForTab = () => {
    switch (activeTab) {
      case 'available': return availableCourses;
      case 'inProgress': return inProgressCourses;
      case 'completed': return completedCourses;
      case 'my': return myCourses;
      default: return [];
    }
  };

  return (
    <>
      <Navbar />
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      <div className="container-wrapper py-8">
        <h1 className="text-3xl font-bold section-spacing"><TranslatedText text="Курси" /></h1>
        <div className="section-spacing flex gap-2 flex-wrap mb-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.key === 'available' && availableCourses.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{availableCourses.length}</span>
              )}
              {tab.key === 'inProgress' && inProgressCourses.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{inProgressCourses.length}</span>
              )}
              {tab.key === 'completed' && completedCourses.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{completedCourses.length}</span>
              )}
            </button>
          ))}
          {(user?.role === 'MEDIC' || user?.role === 'ROOT') && (
            <button
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={() => handleTabChange('my')}
            >
              <span>
                <TranslatedText text={user?.role === 'ROOT' ? 'Усі курси' : 'Мої курси'} />
              </span>
              {user?.role === 'ROOT' && (
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">ROOT</span>
              )}
              {user?.role === 'MEDIC' && (
                <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">MEDIC</span>
              )}
              {myCourses.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{myCourses.length}</span>
              )}
            </button>
          )}
        </div>
        <Filter
          items={items}
          onFiltered={handleFiltered}
          total={getActiveCoursesForTab().length}
        />
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center section-spacing">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <CourseList
            items={getActiveCoursesForTab()}
            user={user}
            showProgress={activeTab === 'inProgress' || activeTab === 'completed'}
            completed={activeTab === 'completed'}
            isMine={activeTab === 'my'}
            onEdit={handleEditCourse}
            onDelete={(course) => { setDeleteCourseId(course.id); setShowDeleteModal(true); }}
            onStart={handleCourseCardClick}
          />
        )}
      </div>
      <Footer />

      {showCreate && (
        <Modal onClose={() => { setShowCreate(false); }}>
          <div className="p-3 w-full max-w-2xl overflow-y-auto max-h-[80vh] overscroll-contain">
            <h2 className="text-2xl font-bold mb-4"><TranslatedText text="Створити курс" /></h2>
            <CourseForm
              type="course"
              initialTitle=""
              initialDescription=""
              initialSections={[{ title: '', lessons: [] }]}
              onCancel={() => setShowCreate(false)}
              user={user}
              onSuccess={(message: string) => {
                setNotification({ type: 'success', message });
                setShowCreate(false);
                setReloadFlag(f => f + 1);
              }}
            />
          </div>
        </Modal>
      )}
      {showEdit && (
        <Modal onClose={() => { setShowEdit(false); }}>
          <div className="p-3 w-full max-w-2xl overflow-y-auto max-h-[80vh] overscroll-contain">
            <h2 className="text-2xl font-bold mb-4"><TranslatedText text="Редагувати курс" /></h2>
            <CourseForm
              type="course"
              initialTitle={title}
              initialDescription={description}
              initialSections={sections}
              initialImageUrl={editCourse?.imageUrl || ''}
              initialKeywords={editCourse?.keywords || []}
              entityId={editCourseId ?? undefined}
              onCancel={() => setShowEdit(false)}
              submitText="Зберегти"
              user={user}
              onSuccess={(message: string) => {
                setNotification({ type: 'success', message });
                setShowEdit(false);
                setReloadFlag(f => f + 1);
              }}
            />
          </div>
        </Modal>
      )}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              <TranslatedText text="Видалити курс?" />
            </h2>
            <p className="mb-6 text-center">
              <TranslatedText text="Ви впевнені, що хочете видалити цей курс? Цю дію не можна скасувати." />
            </p>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteModal(false)}>
                <TranslatedText text="Скасувати" />
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleDeleteCourseConfirmed}>
                <TranslatedText text="Видалити" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default CoursesPage;