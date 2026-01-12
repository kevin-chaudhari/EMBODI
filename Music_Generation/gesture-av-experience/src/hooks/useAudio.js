import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useGestureStore } from '../store/gestureStore';

export const useAudio = (isActive) => {
    const playerRef = useRef(null);
    const filterRef = useRef(null);
    const reverbRef = useRef(null);
    const delayRef = useRef(null);
    const isPlayingRef = useRef(false);

    // Only get selectedEmotion for the initial setup, don't subscribe to high-frequency data
    const selectedEmotion = useGestureStore(state => state.selectedEmotion);

    useEffect(() => {
        // Map Emotion to MP3 File
        let trackUrl = '/music/sweet-life-luxury-chill-438146.mp3'; // Default Calm

        switch (selectedEmotion) {
            case 'energetic':
                trackUrl = '/music/christmas-holiday-festive-cheer-snow-427231.mp3';
                break;
            case 'calm':
                trackUrl = '/music/sweet-life-luxury-chill-438146.mp3';
                break;
            case 'melancholic':
                trackUrl = '/music/christmas-443109.mp3';
                break;
            case 'happy':
                trackUrl = '/music/christmas-holiday-festive-cheer-snow-427231.mp3'; // Reuse for now or find another
                break;
            default:
                trackUrl = '/music/sweet-life-luxury-chill-438146.mp3';
        }

        // Initialize audio chain
        // Player -> Delay -> Reverb -> Filter -> Destination

        filterRef.current = new Tone.Filter({
            type: 'lowpass',
            frequency: 20000, // Open by default
            Q: 1
        }).toDestination();

        reverbRef.current = new Tone.Reverb({
            decay: 4,
            wet: 0.1
        }).connect(filterRef.current);

        delayRef.current = new Tone.FeedbackDelay({
            delayTime: "8n",
            feedback: 0.4,
            wet: 0
        }).connect(reverbRef.current);

        playerRef.current = new Tone.Player({
            url: trackUrl,
            loop: true,
            autostart: true,
            onload: () => {
                console.log(`Loaded track: ${trackUrl}`);
            }
        }).connect(delayRef.current);

        return () => {
            playerRef.current?.dispose();
            filterRef.current?.dispose();
            reverbRef.current?.dispose();
            delayRef.current?.dispose();
        };
    }, [selectedEmotion]);

    useEffect(() => {
        if (!isActive || !playerRef.current) return;

        const updateAudio = () => {
            // Get latest gesture data directly from store without subscribing
            const { leftPinch, rightPinch, leftTwist, rightTwist, rightPos } = useGestureStore.getState();

            // Debug log (throttle this in real usage)
            // console.log('Audio Loop:', { isActive, loaded: playerRef.current?.loaded, rightPinch, rightPosY: rightPos?.y });

            if (!playerRef.current.loaded) return;

            // --- LEFT HAND (Atmosphere) ---

            // Twist: Filter Cutoff (Muffled -> Bright)
            // 200Hz to 20kHz
            const cutoff = 200 + (leftTwist * 19800);
            filterRef.current.frequency.rampTo(cutoff, 0.2);

            // Pinch: Speed (Playback Rate)
            // 0 -> 1.0 (Mapped to 0.5x - 1.5x)
            const speed = 0.5 + (leftPinch * 1.0);
            const safeSpeed = Math.max(0.1, Math.min(2.0, speed));
            playerRef.current.playbackRate = safeSpeed;


            // --- RIGHT HAND (Lead/Rhythm) ---

            // Twist: Reverb Wetness (Dry -> Spacious)
            const reverbWet = rightTwist * 0.8;
            reverbRef.current.wet.rampTo(reverbWet, 0.2);

            // Pinch: Delay Wetness (Dub Echo)
            // 0 -> 0.6 (Don't go full wet or volume drops)
            const delayWet = rightPinch * 0.6;
            delayRef.current.wet.rampTo(delayWet, 0.2);
        };

        const interval = setInterval(updateAudio, 50);
        return () => clearInterval(interval);
    }, [isActive]); // Removed gesture dependencies to prevent re-renders

    return { playerRef, filterRef, reverbRef, delayRef };
};
