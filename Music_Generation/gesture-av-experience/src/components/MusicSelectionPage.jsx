import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useGestureStore } from '../store/gestureStore';

const emotions = [
    { id: 'energetic', label: 'ENERGETIC', color: 'from-orange-500 to-red-600', desc: 'High BPM, intense visuals' },
    { id: 'calm', label: 'CALM', color: 'from-teal-400 to-blue-500', desc: 'Ambient textures, slow flow' },
    { id: 'melancholic', label: 'MELANCHOLIC', color: 'from-purple-500 to-indigo-600', desc: 'Deep bass, moody atmosphere' },
    { id: 'happy', label: 'HAPPY', color: 'from-yellow-400 to-orange-500', desc: 'Bright chords, colorful particles' },
];

export const MusicSelectionPage = ({ onSelect }) => {
    const { selectedEmotion, setSelectedEmotion } = useGestureStore();
    const webcamRef = useRef(null);

    // Hand Tracking Refs
    const lastHandXRef = useRef(null);
    const lastSwipeTimeRef = useRef(0);

    // Hand Gesture Logic
    useEffect(() => {
        // Initialize default selection if none
        if (!selectedEmotion) {
            setSelectedEmotion(emotions[0].id);
        }

        const checkGestures = () => {
            const { rightPos, rightPinch } = useGestureStore.getState();

            // 1. Swipe Logic (Right Hand X Movement)
            if (rightPos && rightPos.x !== 0) {
                const currentX = rightPos.x;
                const now = Date.now();

                if (lastHandXRef.current !== null) {
                    const deltaX = currentX - lastHandXRef.current;

                    // Threshold for swipe speed/distance
                    // Positive delta -> Moving Right (since mirrored? No, let's check coordinate system)
                    // X: 0 (Left) -> 1 (Right)
                    // If mirrored, moving hand Right physically -> X increases? 
                    // Let's assume standard normalized coords first.

                    if (now - lastSwipeTimeRef.current > 500) { // Debounce 500ms
                        if (deltaX > 0.05) { // Swiped Right
                            // Next Option
                            const currentIndex = emotions.findIndex(e => e.id === selectedEmotion);
                            const nextIndex = (currentIndex + 1) % emotions.length;
                            setSelectedEmotion(emotions[nextIndex].id);
                            lastSwipeTimeRef.current = now;
                        } else if (deltaX < -0.05) { // Swiped Left
                            // Prev Option
                            const currentIndex = emotions.findIndex(e => e.id === selectedEmotion);
                            const prevIndex = (currentIndex - 1 + emotions.length) % emotions.length;
                            setSelectedEmotion(emotions[prevIndex].id);
                            lastSwipeTimeRef.current = now;
                        }
                    }
                }
                lastHandXRef.current = currentX;
            }

            // 2. Pinch Logic (Confirm)
            // Threshold > 0.8 for firm pinch
            if (rightPinch > 0.8 && selectedEmotion) {
                onSelect(selectedEmotion);
            }
        };

        const interval = setInterval(checkGestures, 50); // Check every 50ms
        return () => clearInterval(interval);

    }, [selectedEmotion, setSelectedEmotion, onSelect]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />

            <h2 className="relative z-10 text-4xl font-bold text-white mb-12 tracking-wider">
                SELECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">VIBE</span>
            </h2>

            <div className="relative z-10 grid grid-cols-2 gap-8 max-w-4xl w-full">
                {emotions.map((emotion) => (
                    <div
                        key={emotion.id}
                        className={`
                            relative group p-8 rounded-2xl border backdrop-blur-sm
                            transition-all duration-300 cursor-pointer
                            ${selectedEmotion === emotion.id
                                ? 'border-cyan-500 bg-white/10 scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105'}
                        `}
                        onClick={() => onSelect(emotion.id)}
                    >
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${emotion.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <h3 className="text-2xl font-bold text-white mb-2">{emotion.label}</h3>
                        <p className="text-gray-400 text-sm">{emotion.desc}</p>
                    </div>
                ))}
            </div>

            {/* Camera Feed Overlay (Visuals Only, Logic is in useEffect) */}
            <div className="relative z-10 mt-12 w-48 h-36 rounded-xl overflow-hidden border-2 border-cyan-500/30 bg-black">
                <Webcam
                    ref={webcamRef}
                    className="w-full h-full object-cover opacity-50 mirror"
                    mirrored
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-xs text-cyan-500 font-mono bg-black/50 px-2 py-1 rounded mb-1 z-10 text-center">
                        Swipe Hand to Change<br />Pinch to Select
                    </div>
                </div>
            </div>
        </div>
    );
};
