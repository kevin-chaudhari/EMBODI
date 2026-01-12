import { create } from 'zustand';

export const useGestureStore = create((set) => ({
    // Hand tracking data
    leftPinch: 0,
    rightPinch: 0,
    leftTwist: 0,
    rightTwist: 0,
    leftPos: { x: 0.5, y: 0.5 },
    rightPos: { x: 0.5, y: 0.5 },

    // UI state
    isTracking: false,
    showDebug: true, // Enabled by default for user feedback

    // Actions
    setLeftPinch: (value) => set({ leftPinch: value }),
    setRightPinch: (value) => set({ rightPinch: value }),
    setLeftTwist: (value) => set({ leftTwist: value }),
    setRightTwist: (value) => set({ rightTwist: value }),
    setLeftPos: (pos) => set({ leftPos: pos }),
    setRightPos: (pos) => set({ rightPos: pos }),
    setIsTracking: (value) => set({ isTracking: value }),
    toggleDebug: () => set((state) => ({ showDebug: !state.showDebug })),

    // Bulk update for performance
    updateGestureData: (data) => set(data),

    // Selection State
    selectedEmotion: null,
    setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),

    // Head Gesture State
    headTilt: 'center', // 'left', 'right', 'center'
    isNodding: false,
    nosePosition: { x: 0.5, y: 0.5 }, // Normalized 0-1
    setHeadTilt: (tilt) => set({ headTilt: tilt }),
    setIsNodding: (isNodding) => set({ isNodding: isNodding }),
    setNosePosition: (pos) => set({ nosePosition: pos }),
}));
