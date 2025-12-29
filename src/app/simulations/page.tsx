'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import SimulationForm from '@/components/form/Form';
import { fetchWithAuth } from '@/utils/auth';
import SimulationList from '@/components/cards/list/CardList';
import Filter from '@/components/search/filter/Filter';
import { TranslatedText } from '@/components/TranslatedText';
import Notification from '@/components/Notification';
import { useRouter } from 'next/navigation';
import SimulationModal from '@/components/simulation/SimulationModal';

const TABS = [
  { key: 'available', label: <TranslatedText text="Доступні симуляції" /> },
  { key: 'my', label: <TranslatedText text="Мої симуляції" /> },
  { key: 'all', label: <TranslatedText text="Усі симуляції" /> },
];

const SimulationsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simulationsActiveTab') || 'available';
    }
    return 'available';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const [availableSimulations, setAvailableSimulations] = useState<any[]>([]);
  const [mySimulations, setMySimulations] = useState<any[]>([]);

  const [allAvailableSimulations, setAllAvailableSimulations] = useState<any[]>([]);
  const [allMySimulations, setAllMySimulations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editSimulationId, setEditSimulationId] = useState<string | number | null>(null);
  const [deleteSimulationId, setDeleteSimulationId] = useState<string | number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [editSimulation, setEditSimulation] = useState<any | null>(null);

  const [selectedSimulation, setSelectedSimulation] = useState<any | null>(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  const handleFiltered = useCallback(
    ({ available, my }: any) => {
      setAvailableSimulations(available);
      setMySimulations(my);
    },
    []
  );
  
  const items = useMemo(() => ({
    available: allAvailableSimulations,
    my: allMySimulations
  }), [allAvailableSimulations, allMySimulations]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
        
        const resAvailable = await fetchWithAuth(`/api/simulations/available?lang=${currentLang}`);
        if (resAvailable.ok) {
          const availableSimulations = await resAvailable.json();
          setAllAvailableSimulations(availableSimulations || []);
        }

        if (user?.role === 'MEDIC' || user?.role === 'ROOT') {
          const endpoint = user.role === 'ROOT' 
            ? `/api/simulations/control?all=1&lang=${currentLang}` 
            : `/api/simulations/control?lang=${currentLang}`;
            
          const resMine = await fetchWithAuth(endpoint);
          const mySimulationsData = resMine.ok ? await resMine.json() : [];
          setAllMySimulations(mySimulationsData);
        }
      } catch (error: any) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          router.push('/unauthorized');
        } else {
          setNotification({ type: 'error', message: 'Error loading simulations' });
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
      localStorage.setItem('simulationsActiveTab', tab);
    }
  };

  const handleEditSimulation = (simulation: any) => {
    setEditSimulationId(simulation.id);
    setTitle(simulation.title);
    setDescription(simulation.description);
    setSteps(simulation.steps || []);
    setEditSimulation(simulation);
    setShowEdit(true);
  };

  const handleDeleteSimulationConfirmed = async () => {
    if (!deleteSimulationId) return;
    setShowDeleteModal(false);
    try {
      const currentLang = localStorage.getItem('preferredLanguage') || 'ua';
      
      const res = await fetchWithAuth(`/api/simulations/${deleteSimulationId}?lang=${currentLang}`, { method: 'DELETE' });
      
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
    setDeleteSimulationId(null);
  };

  const handleSimulationCardClick = (simulation: any) => {
    if (simulation.id === 'create') {
      setShowCreate(true);
    } else {
      setSelectedSimulation(simulation);
      setShowSimulationModal(true);
    }
  };

  const getActiveSimulationsForTab = () => {
    switch (activeTab) {
      case 'available': return availableSimulations;
      case 'my': return mySimulations;
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
        <h1 className="text-3xl font-bold section-spacing"><TranslatedText text="Симуляції" /></h1>
        <div className={`section-spacing flex gap-2 flex-wrap mb-2 ${user?.role === 'USER' ? 'hidden' : ''}`}>
          <button
            className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === TABS[0].key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            onClick={() => handleTabChange(TABS[0].key)}
          >
            <span>{TABS[0].label}</span>
            {availableSimulations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{availableSimulations.length}</span>
            )}
          </button>
          {user?.role === 'MEDIC' && (
            <button
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === TABS[1].key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={() => handleTabChange(TABS[1].key)}
            >
              <span>{TABS[1].label}</span>
              <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">MEDIC</span>
              {mySimulations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{mySimulations.length}</span>
              )}
            </button>
          )}
          {user?.role === 'ROOT' && (
            <button
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${activeTab === TABS[1].key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={() => handleTabChange(TABS[1].key)}
            >
              <span>{TABS[2].label}</span>
              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">ROOT</span>
              {mySimulations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900 text-white text-xs rounded-full min-w-[1.5rem] text-center">{mySimulations.length}</span>
              )}
            </button>
          )}
        </div>
        <Filter
          items={items}
          onFiltered={handleFiltered}
          total={getActiveSimulationsForTab().length}
        />
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center section-spacing">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <SimulationList
            items={getActiveSimulationsForTab()}
            user={user}
            showProgress={false}
            completed={false}
            isMine={activeTab === 'my'}
            onEdit={handleEditSimulation}
            onDelete={(simulation) => { setDeleteSimulationId(simulation.id); setShowDeleteModal(true); }}
            onStart={handleSimulationCardClick}
          />
        )}
      </div>
      <Footer />

      {showCreate && (
        <Modal onClose={() => { setShowCreate(false); }}>
          <div className="p-3 w-full max-w-2xl overflow-y-auto max-h-[80vh] overscroll-contain">
            <h2 className="text-2xl font-bold mb-4"><TranslatedText text="Створити симуляцію" /></h2>
            <SimulationForm
              type="simulation"
              initialTitle=""
              initialDescription=""
              initialSteps={[{ title: '', content: '', videoUrl: ''}]}
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
            <h2 className="text-2xl font-bold mb-4"><TranslatedText text="Редагувати симуляцію" /></h2>
            <SimulationForm
              type="simulation"
              initialTitle={title}
              initialDescription={description}
              initialSteps={steps}
              initialImageUrl={editSimulation?.imageUrl || ''}
              initialKeywords={editSimulation?.keywords || []}
              entityId={editSimulationId ?? undefined}
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
      {showSimulationModal && selectedSimulation && (
        <SimulationModal
          steps={selectedSimulation.steps}
          title={selectedSimulation.title}
          description={selectedSimulation.description}
          onClose={() => { setShowSimulationModal(false); setSelectedSimulation(null); }}
        />
      )}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              <TranslatedText text="Видалити симуляцію?" />
            </h2>
            <p className="mb-6 text-center">
              <TranslatedText text="Ви впевнені, що хочете видалити цю симуляцію? Цю дію не можна скасувати." />
            </p>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteModal(false)}>
                <TranslatedText text="Скасувати" />
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleDeleteSimulationConfirmed}>
                <TranslatedText text="Видалити" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SimulationsPage;