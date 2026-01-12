import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as Tone from 'tone';
import { Scene } from './components/canvas/Scene';
import { VisionController } from './components/VisionController';
import { AudioController } from './components/AudioController';
import { HUD } from './components/dom/HUD';
import { LandingPage } from './components/LandingPage';
import { MusicSelectionPage } from './components/MusicSelectionPage';
import { useGestureStore } from './store/gestureStore';

const App = () => {
  const [view, setView] = useState('landing'); // 'landing' | 'selection' | 'experience'
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedEmotion } = useGestureStore();

  const handleEnter = useCallback(() => {
    setView('selection');
  }, []);

  const handleSelection = useCallback(async (emotion) => {
    setIsLoading(true);
    setSelectedEmotion(emotion);
    try {
      await Tone.start();
      // await Tone.loaded(); // Removed to prevent blocking if audio takes time
      setView('experience');
    } catch (error) {
      console.error('Failed to start audio:', error);
      alert('Failed to start audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setSelectedEmotion]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {view === 'landing' && <LandingPage onEnter={handleEnter} />}

      {view === 'selection' && (
        <>
          {isLoading && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="text-cyan-500 font-mono animate-pulse">Initializing Experience...</div>
            </div>
          )}
          <MusicSelectionPage onSelect={handleSelection} />
        </>
      )}

      {view === 'experience' && (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Scene />
          </Canvas>

          <VisionController />
          <AudioController isActive={true} />
          <HUD />
        </>
      )}
    </div>
  );
};

export default App;
