import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGestureStore } from '../store/gestureStore';

export const VisionController = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const { showDebug } = useGestureStore();
    const [error, setError] = useState(null);

    useHandTracking(webcamRef, canvasRef);

    const handleUserMediaError = useCallback((err) => {
        console.error('Webcam error:', err);
        setError('Camera access denied or not found. Please ensure your webcam is connected and allowed.');
    }, []);

    if (error) {
        return (
            <div className="fixed top-4 right-4 z-50 bg-red-900/80 border border-red-500 text-red-100 px-4 py-3 rounded-lg backdrop-blur-sm shadow-lg shadow-red-900/50">
                <strong className="font-bold block mb-1">Camera Error</strong>
                <span className="text-sm">{error}</span>
            </div>
        );
    }

    // In the new design, the camera feed is central. 
    // We'll position it absolutely in the center, but behind the HUD gauges.
    // The HUD will draw the gauges around it.

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="relative w-[640px] h-[480px] rounded-lg overflow-hidden border-2 border-cyan-500/30 bg-black/50 backdrop-blur-sm">
                <Webcam
                    ref={webcamRef}
                    className="w-full h-full object-fill"
                    mirrored
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "user"
                    }}
                    onUserMediaError={handleUserMediaError}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
                    width={640}
                    height={480}
                />

                {/* Overlay text matching reference */}
                <div className="absolute top-4 left-4 text-xs font-mono text-cyan-500 bg-black/60 p-2 rounded border border-cyan-900/50">
                    <div className="font-bold mb-1 text-cyan-300">CONTROLS</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="text-gray-400">LEFT HAND</div>
                        <div className="text-gray-400">RIGHT HAND</div>

                        <div>Pinch: <span className="text-cyan-400">Reverb</span></div>
                        <div>Pinch: <span className="text-cyan-400">Delay</span></div>

                        <div>Twist: <span className="text-cyan-400">Filter</span></div>
                        <div>Move Y: <span className="text-cyan-400">Speed</span></div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-cyan-900/50 text-[10px] text-gray-500">
                        Debug Mode: {showDebug ? <span className="text-green-400">ON</span> : <span className="text-red-400">OFF</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
