import React from 'react';
import { CircularGauge } from './CircularGauge';
import { useGestureStore } from '../../store/gestureStore';

export const HUD = () => {
    const { leftPinch, rightPinch, leftTwist, rightTwist, rightPos, isTracking, showDebug, toggleDebug } = useGestureStore();

    return (
        <div className="fixed inset-0 pointer-events-none z-20 p-8 flex flex-col justify-between">

            {/* Top Row */}
            <div className="flex justify-between items-start">
                {/* Top Left: Right Pinch (Blue in reference, but let's stick to consistent coloring or match ref) */}
                {/* Reference: Top Left = "RIGHT PINCH" (Blue) */}
                <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-900/50 backdrop-blur-md w-64">
                    <h3 className="text-cyan-500 font-mono text-xs mb-2 uppercase tracking-wider">RIGHT PINCH</h3>
                    <div className="flex justify-center py-2">
                        <CircularGauge value={rightPinch} label="" color="#00ffff" size={120} />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-4xl font-mono text-cyan-400">{Math.round(rightPinch * 100)}</span>
                        <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${rightPinch * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Top Right: Left Pinch */}
                <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-900/50 backdrop-blur-md w-64">
                    <h3 className="text-cyan-500 font-mono text-xs mb-2 uppercase tracking-wider">LEFT PINCH</h3>
                    <div className="flex justify-center py-2">
                        <CircularGauge value={leftPinch} label="" color="#00ffff" size={120} />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-4xl font-mono text-cyan-400">{Math.round(leftPinch * 100)}</span>
                        <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${leftPinch * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-end">
                {/* Bottom Left: Right Twist */}
                <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-900/50 backdrop-blur-md w-64 relative">
                    <div className="absolute -top-12 left-0 bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded border border-yellow-500/50 animate-pulse">
                        ROTATE WRIST LIKE A DIAL ⟳
                    </div>
                    <h3 className="text-cyan-500 font-mono text-xs mb-2 uppercase tracking-wider">RIGHT TWIST</h3>
                    <div className="flex justify-center py-2">
                        <CircularGauge value={rightTwist} label="" color="#fbbf24" size={120} />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-4xl font-mono text-cyan-400">{Math.round(rightTwist * 100)}</span>
                        <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${rightTwist * 100}%` }} />
                        </div>
                    </div>
                </div>

                {/* Bottom Right: Left Twist */}
                <div className="bg-gray-900/80 p-4 rounded-lg border border-cyan-900/50 backdrop-blur-md w-64 relative">
                    <div className="absolute -top-12 right-0 bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded border border-yellow-500/50 animate-pulse">
                        ⟲ ROTATE WRIST LIKE A DIAL
                    </div>
                    <h3 className="text-cyan-500 font-mono text-xs mb-2 uppercase tracking-wider">LEFT TWIST</h3>
                    <div className="flex justify-center py-2">
                        <CircularGauge value={leftTwist} label="" color="#fbbf24" size={120} />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-4xl font-mono text-cyan-400">{Math.round(leftTwist * 100)}</span>
                        <div className="h-1 w-24 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${leftTwist * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Bottom: Mixer Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 items-end">
                <MixerChannel label="DELAY" value={rightPinch} color="#00ffff" displayValue={`${Math.round(rightPinch * 100)}%`} />
                <MixerChannel label="SPEED" value={rightPos.y} color="#00ffff" displayValue={`${(0.5 + rightPos.y).toFixed(1)}x`} />
                <MixerChannel label="FILTER" value={leftTwist} color="#ff00ff" displayValue={`${Math.round(200 + (leftTwist * 19800))}Hz`} />
                <MixerChannel label="REVERB" value={leftPinch} color="#ff00ff" displayValue={`${Math.round(leftPinch * 100)}%`} />
            </div>

            {/* Debug Toggle */}
            <button
                onClick={toggleDebug}
                className="pointer-events-auto absolute top-8 right-8 px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-cyan-500 rounded text-cyan-400 text-sm font-mono hover:bg-cyan-500/20 transition-colors"
            >
                {showDebug ? 'Hide' : 'Show'} Debug
            </button>
        </div>
    );
};

const MixerChannel = ({ label, value, color, displayValue }) => (
    <div className="flex flex-col items-center gap-2 bg-gray-900/80 p-3 rounded-lg border border-gray-700 backdrop-blur-sm w-20">
        <div className="h-32 w-2 bg-gray-800 rounded-full relative overflow-hidden">
            <div
                className="absolute bottom-0 left-0 w-full transition-all duration-100"
                style={{ height: `${value * 100}%`, backgroundColor: color }}
            />
        </div>
        <span className="text-[10px] font-mono text-gray-400">{label}</span>
        <span className="text-[10px] font-bold font-mono" style={{ color }}>{displayValue || Math.round(value * 100)}</span>
    </div>
);
