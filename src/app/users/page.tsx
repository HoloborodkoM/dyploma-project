'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';
import Filter from '@/components/search/filter/Filter';
import UserList from '@/components/user/UserList';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';
import { TranslatedText } from '@/components/TranslatedText';
import { fetchWithAuth } from '@/utils/auth';
import Modal from '@/components/Modal';

const TABS = [
  { key: 'all', label: <TranslatedText text="Усі користувачі" /> },
  { key: 'users', label: <TranslatedText text="Користувачі" /> },
  { key: 'medics', label: <TranslatedText text="Медики" /> },
];

const UsersPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('usersActiveTab') || 'all';
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [users, setUsers] = useState<any[]>([]);
  const [simpleUsers, setSimpleUsers] = useState<any[]>([]);
  const [medics, setMedics] = useState<any[]>([]);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allSimpleUsers, setAllSimpleUsers] = useState<any[]>([]);
  const [allMedics, setAllMedics] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserStatusCard, setShowUserStatusCard] = useState(false);

  const handleFiltered = useCallback(
    ({ users, simpleUsers, medics }: any) => {
      setUsers(users);
      setSimpleUsers(simpleUsers);
      setMedics(medics);
    },
    []
  );

  const items = useMemo(() => ({
    users: allUsers,
    simpleUsers: allSimpleUsers,
    medics: allMedics
  }), [allUsers, allSimpleUsers, allMedics]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
        
        const resUsers = await fetchWithAuth(`/api/users/all?lang=${currentLang}`);
        if (resUsers.ok) {
          const usersData = await resUsers.json();
          setAllUsers(usersData);
        }

        const resSimpleUsers = await fetchWithAuth(`/api/users/simple?lang=${currentLang}`);
        if (resSimpleUsers.ok) {
          const simpleUsersData = await resSimpleUsers.json();
          setAllSimpleUsers(simpleUsersData);
        }

        const resMedics = await fetchWithAuth(`/api/users/medics?lang=${currentLang}`); 
        if (resMedics.ok) {
          const medicsData = await resMedics.json();
          setAllMedics(medicsData);
        }
      } catch (error: any) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          router.push('/unauthorized');
        }
        if (error instanceof Error && error.message === 'Forbidden') {
          router.push('/forbidden');
        }
        setNotification({ type: 'error', message: 'Помилка завантаження користувачів' });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [reloadFlag]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('usersActiveTab', tab);
    }
  };

  const handleCardClick = (user: any) => {
    setSelectedUser(user);
    setShowUserStatusCard(true);
  };

  const handleEditUserRole = async () => {
    setLoading(true);
    
    try {
      const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
      const res = await fetchWithAuth(`/api/users/${selectedUser.id}?lang=${currentLang}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: selectedUser.role === 'USER' ? 'MEDIC' : 'USER'
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
      const result = await res.json();
      setNotification({ type: 'success', message: result.message });
      setShowUserStatusCard(false);
      setReloadFlag(f => f + 1);
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        router.push('/unauthorized');
      }
      if (error instanceof Error && error.message === 'Forbidden') {
        router.push('/forbidden');
      }
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }

  const getActiveUsersForTab = () => {
    switch (activeTab) {
      case 'all': return users;
      case 'users': return simpleUsers;
      case 'medics': return medics;
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
        <h1 className="text-3xl font-bold section-spacing"><TranslatedText text="Користувачі" /></h1>
        <div className="section-spacing flex gap-2 flex-wrap mb-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.key === 'all' && users.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{users.length}</span>
              )}
              {tab.key === 'users' && simpleUsers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{simpleUsers.length}</span>
              )}
              {tab.key === 'medics' && medics.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{medics.length}</span>
              )}
            </button>
          ))}
        </div>
        <Filter
          isUsers={true}
          items={items}
          onFiltered={handleFiltered}
          total={getActiveUsersForTab().length}
        />
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center section-spacing">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <UserList
            users={getActiveUsersForTab()}
            onClick={handleCardClick}
          />
        )}
      </div>
      <Footer />

      {showUserStatusCard && selectedUser && (
        <Modal className="w-full max-w-md" onClose={() => setShowUserStatusCard(false)}>
          <div className="p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              {selectedUser.role === 'USER'
                ? <TranslatedText text="Призначити медиком?" />
                : <TranslatedText text="Прибрати роль медика?" />}
            </h2>
            <p className="mb-6 text-center">
              {selectedUser.email}
            </p>
            <div className="flex justify-center space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowUserStatusCard(false)}>
                <TranslatedText text="Скасувати" />
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleEditUserRole}
              >
                {selectedUser.role === 'USER'
                  ? <TranslatedText text="Призначити" />
                  : <TranslatedText text="Прибрати" />}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default UsersPage;