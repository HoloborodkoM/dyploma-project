import React, { useRef, useEffect, useState } from 'react';
import { t } from '../TranslatedText';

interface SimulationVideoUIProps {
  videoUrl: string;
  stepIndex: number;
  playbackRate: number;
}

const SimulationVideoUI: React.FC<SimulationVideoUIProps> = ({ 
  videoUrl, 
  stepIndex,
  playbackRate 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'ua' | 'en'>('ua');
  const [downloadTitle, setDownloadTitle] = useState('Завантажити відео');

  useEffect(() => {
    const currentLang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'ua';
    setLang(currentLang === 'en' ? 'en' : 'ua');
  }, []);

  useEffect(() => {
    t('Завантажити відео', lang).then(setDownloadTitle);
  }, [lang]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [videoUrl, playbackRate]);

  useEffect(() => {
    setLoading(true);
  }, [videoUrl]);

  const handleLoadedData = () => {
    setLoading(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `step-${stepIndex + 1}-video.mp4`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain bg-black object-contain"
        loop
        muted
        playsInline
        onLoadedData={handleLoadedData}
        controls={false}
        style={{ pointerEvents: 'none', maxHeight: '100%', maxWidth: '100%' }}
      />
      <button
        className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow"
        onClick={handleDownload}
        style={{ pointerEvents: 'auto' }}
        title={downloadTitle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
        </svg>
      </button>
      {loading && (
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full p-1">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SimulationVideoUI;