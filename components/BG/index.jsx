import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './style.css';

export default function BGanm({ children }) {
  const videoRef = useRef();
  const location = useLocation();
  const [fadeContent, setFadeContent] = useState(false);

  useEffect(() => {
    setFadeContent(false);

    // fade do conteúdo
    const fadeTimeout = setTimeout(() => setFadeContent(true), 20);

    // delay pra começar o vídeo depois do fade
    const videoTimeout = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 1020);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(videoTimeout);
    };
  }, [location.pathname]);

  return (
    <>
      {/* vídeo fora do key pra não reiniciar */}
      <video
        ref={videoRef}
        muted
        className="bg-video"
      >
        <source src="/assets/videos/BG.mp4" type="video/mp4" />
      </video>

      {/* conteúdo com key pra forçar fade em todas as telas */}
      <div key={location.pathname} className={`bg-content ${fadeContent ? 'fade-in' : ''}`}>
        {children}
      </div>
    </>
  );
}
