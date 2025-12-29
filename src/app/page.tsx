'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TranslatedText } from '@/components/TranslatedText';
import SearchBar from '@/components/search/bar/Bar';
import Carousel from '@/components/cards/carousel/Carousel';
import Notification from '@/components/Notification';
import SimulationModal from '@/components/simulation/SimulationModal';
import Register from '@/components/register/register_modal/Register';
import ConfirmCode from '@/components/register/confirm_code_modal/ConfirmCode';
import RegisterSuccess from '@/components/register/register_success_modal/RegisterSuccess';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<any | null>(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerStep, setRegisterStep] = useState<'register' | 'registerCode' | 'registerSuccess'>('register');
  const [lang, setLang] = useState<'ua' | 'en'>('ua');

  useEffect(() => {
    const fetchSimulations = async () => {
      setLoading(true);
      try {
        const currentLang = localStorage.getItem('preferredLanguage') || 'ua';

        const res = await fetch(`/api/simulations/available?lang=${currentLang}`);
        if (res.ok) {
          const all = await res.json();
          setSimulations(all || []);
        } else {
          setSimulations([]);
        }
      } catch {
        setNotification({ type: 'error', message: 'Error loading simulations' });
      } finally {
        setLoading(false);
      }
    }
    fetchSimulations();
  }, []);

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
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container-wrapper">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <TranslatedText text="Платформа для навчання навичкам екстреної медичної допомоги" />
            </h1>
            <p className="text-xl mb-10 w-full">
              <TranslatedText text="Опишіть екстрену ситуацію, і ми надамо покрокові інструкції для надання медичної допомоги" />
            </p>
            <SearchBar
              simulations={simulations}
              onFilteredResults={(results) => {
                setSearchResults(results);
                setShowResults(true);
              }}
              withVoice={true}
            />
          </div>
        </div>
      </div>

      {showResults && (
        <div className="w-full mt-6 bg-white rounded-lg shadow-lg overflow-hidden text-left">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">
              {searchResults.length > 0 
                ? <TranslatedText text={`Знайдено результатів: ${searchResults.length}`} /> 
                : <TranslatedText text="Результатів не знайдено" />}
            </h3>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {searchResults.map(result => (
                <button
                  key={result.id}
                  className="block w-full text-left p-4 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedSimulation(result);
                    setShowSimulationModal(true);
                  }}
                >
                  <h4 className="font-medium text-blue-700 overflow-hidden">
                    <TranslatedText text={result.title} />
                  </h4>
                  <p className="text-gray-600 mt-1 overflow-hidden">
                    <TranslatedText text={result.description} />
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p><TranslatedText text="Спробуйте інший пошуковий запит або перегляньте можливі випадки нижче" /></p>
            </div>
          )}
        </div>
      )}

      <div className="py-12 bg-gray-50">
        <div className="container-wrapper=">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <TranslatedText text="Доступні симуляції випадків" />
          </h2>
          <div>
            <Carousel 
              items={simulations} 
              loading={loading} 
              emptyText="Немає симуляцій для відображення"
              onCardClick={(simulation) => {
                setSelectedSimulation(simulation);
                setShowSimulationModal(true);
              }}
            />
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container-wrapper">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <TranslatedText text="Особливості платформи" />
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <TranslatedText text="Швидкий пошук" />
              </h3>
              <p className="text-gray-600">
                <TranslatedText text="Знайдіть інструкції з надання екстренної медичної допомоги за ключовими словами або голосовим запитом" />
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <TranslatedText text="Інтерактивні симуляції" />
              </h3>
              <p className="text-gray-600">
                <TranslatedText text="Покрокові інструкції симуляцій для відпрацювання навичок надання екстренної медичної допомоги" />
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <TranslatedText text="Навчальні курси" />
              </h3>
              <p className="text-gray-600">
                <TranslatedText text="Поглиблені курси з медицини для тих, хто хоче розвинути свої навички. Доступні після реєстрації" />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-900 text-white py-12">
        <div className="container-wrapper text-center">
          <h2 className="text-3xl font-bold mb-6">
            <TranslatedText text="Готові вивчати медичні навички глибше?" />
          </h2>
          <p className="text-xl mb-8 w-full mx-auto">
            <TranslatedText text="Зареєструйтеся, щоб отримати доступ до повних курсів та відстежувати свій прогрес навчання" />
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              className="btn-secondary px-8 py-3"
              onClick={() => {
                setShowRegisterModal(true);
                setRegisterStep('register');
              }}
            >
              <TranslatedText text="Зареєструватися" />
            </button>
            <Link href="/courses" className="btn-outline-white px-8 py-3">
              <TranslatedText text="Переглянути курси" />
            </Link>
          </div>
        </div>
      </div>

      <Register
        open={showRegisterModal && registerStep === 'register'}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(email, name, password) => {
          setRegisterEmail(email);
          setRegisterName(name);
          setRegisterPassword(password);
          setRegisterStep('registerCode');
        }}
      />
      <ConfirmCode
        open={showRegisterModal && registerStep === 'registerCode'}
        email={registerEmail}
        name={registerName}
        password={registerPassword}
        lang={lang}
        onClose={() => setShowRegisterModal(false)}
        onBack={() => setRegisterStep('register')}
        onSuccess={() => setRegisterStep('registerSuccess')}
      />
      <RegisterSuccess
        open={showRegisterModal && registerStep === 'registerSuccess'}
        onLogin={() => setShowRegisterModal(false)}
      />

      {showSimulationModal && selectedSimulation && (
        <SimulationModal
          steps={selectedSimulation.steps}
          title={selectedSimulation.title}
          description={selectedSimulation.description}
          onClose={() => { setShowSimulationModal(false); setSelectedSimulation(null); }}
        />
      )}
      <Footer />
    </>
  );
}

export default Home;