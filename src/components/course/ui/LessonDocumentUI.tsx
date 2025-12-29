import React, { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import { TranslatedText, t } from '@/components/TranslatedText';

interface LessonDocumentUIProps {
  title: string;
  content?: string;
  fileUrl: string;
  mimeType: string;
  onExit: () => void;
  onComplete: () => void;
  completed: boolean;
}

const LessonDocumentUI: React.FC<LessonDocumentUIProps> = ({ 
  title, 
  content, 
  fileUrl, 
  mimeType, 
  onExit, 
  onComplete, 
  completed 
}) => {
  let format;
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [imagePlaceholder, setImagePlaceholder] = useState('Відкрити на весь екран');
  const [alertMessageMistake, setAlertMessageMistake] = useState('Не вдалося завантажити файл!');
  const [alertMessageSuggestion, setAlertMessageSuggestion] = useState('Спробуйте відкрити у новій вкладці');
  const [closePlaceholder, setClosePlaceholder] = useState('Закрити');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t('Відкрити на весь екран', lang).then(setImagePlaceholder);
    t('Не вдалося завантажити файл!', lang).then(setAlertMessageMistake);
    t('Спробуйте відкрити у новій вкладці', lang).then(setAlertMessageSuggestion);
    t('Закрити', lang).then(setClosePlaceholder);
  }, [lang]);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (mimeType === 'application/pdf') {
    format = <iframe src={fileUrl} className="h-full min-h-0 w-full object-contain rounded border bg-white" title="PDF" onLoad={() => setLoading(false)} />;
  } else if (mimeType.startsWith('image/')) {
    format = (
      <div className="relative h-full w-full flex-1 min-h-0">
        <img src={fileUrl} alt={title} className="h-full min-h-0 w-full object-contain rounded border bg-white" onLoad={() => setLoading(false)} />
        <button
          type="button"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-blue-700 border border-blue-200 rounded-full p-2 shadow transition"
          title={imagePlaceholder}
          onClick={() => setShowImageModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 0 0-2 2v4m14-6h4a2 2 0 0 1 2 2v4M3 15v4a2 2 0 0 0 2 2h4m6 0h4a2 2 0 0 0 2-2v-4"/></svg>
        </button>
      </div>
    );
  } else if (mimeType === 'text/plain') {
    useEffect(() => {
      setLoading(true);
      setTextError(null);
      setTextContent(null);

      fetch(fileUrl)
        .then(res => {
          if (!res.ok) throw new Error('Помилка завантаження тексту');
          return res.text();
        })
        .then(text => {
          setTextContent(text);
          setLoading(false);
        })
        .catch(() => {
          setTextError('Не вдалося завантажити текстовий файл!');
          setLoading(false);
        });
    }, [fileUrl]);

    format = (
      <div className="w-full h-full min-h-0 bg-white rounded border p-2 overflow-auto text-sm font-mono whitespace-pre-wrap">
        {textError ? (
          <div className="text-red-600 text-center py-4">
            <TranslatedText text={textError} />
          </div>
        ) : (
          <div className="text-black-500">
            <TranslatedText text={textContent || ''} />
          </div>
        )}
      </div>
    );
  } else if ([
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(mimeType)) {
    format = (
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        className="h-full min-h-0 w-full object-contain rounded border bg-white overflow-auto overscroll-contain"
        title="Document"
        onLoad={() => setLoading(false)}
      />
    );
  } else {
    format = <div className="text-gray-500">
      <TranslatedText text="Невідомий формат документа" />
    </div>;
  }
  
  const getCleanFileName = (url: string, title: string, mimeType: string): string => {
    try {
      const urlParts = url.split('/');
      let fileName = urlParts[urlParts.length - 1];
      fileName = fileName.replace(/^[^-]+-/, '');

      if (mimeType === 'text/plain') {
        return (title || 'document') + '.txt';
      }
      return fileName;
    } catch {
      return title || 'document';
    }
  }

  const handleDownload = async () => {
    try {
      setDownloadError(false);
      const response = await fetch(fileUrl, { mode: 'cors' });

      if (!response.ok) throw new Error('Error downloading file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = getCleanFileName(fileUrl, title, mimeType);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);
    } catch (e) {
      setDownloadError(true);
      alert(alertMessageMistake + ' ' + alertMessageSuggestion);
    }
  };

  return (
    <>
      {showImageModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80" onClick={() => setShowImageModal(false)}>
          <img src={fileUrl} alt={title} className="max-w-full max-h-full object-contain shadow-2xl rounded" />
          <button
            type="button"
            className="absolute top-4 right-8 text-white text-3xl font-bold bg-black/40 rounded-full px-3 py-1 hover:bg-black/70 transition"
            onClick={e => { e.stopPropagation(); setShowImageModal(false); }}
            title={closePlaceholder}
          >×</button>
        </div>
      )}
      <div className="flex flex-col h-full overflow-auto overscroll-contain">
        <h2 className="text-2xl font-bold mb-2 text-blue-900 break-words">
          <TranslatedText text={title} />
        </h2>
        {content && (
          <div className="mb-3 text-gray-700 text-sm border rounded p-2 bg-gray-50 max-h-[60px] overflow-auto overscroll-contain">
            <TranslatedText text={content} />
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col">
          {loading ? <Spinner /> : format}
        </div>
        <div className="flex flex-col w-full gap-2 mt-2 [@media(min-width:530px)]:flex-row [@media(min-width:530px)]:justify-end [@media(min-width:530px)]:items-center [@media(min-width:530px)]:w-auto [@media(min-width:530px)]:gap-2">
          <button className="w-full [@media(min-width:530px)]:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition" onClick={onExit}>
            <TranslatedText text="Вийти" />
          </button>
          {(mimeType && fileUrl) && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full [@media(min-width:530px)]:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
              >
                <TranslatedText text="Завантажити файл" />
              </button>
              {downloadError && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="w-full [@media(min-width:530px)]:w-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-center"
                  style={{ marginTop: 4 }}
                >
                  <TranslatedText text="Відкрити у новій вкладці" />
                </a>
              )}
            </>
          )}
          {!completed && (
            <button
              className="w-full [@media(min-width:530px)]:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={onComplete}
            >
              <TranslatedText text="Завершити урок" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LessonDocumentUI;