import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useGestureStore } from '../store/gestureStore';

export const useHeadTracking = (videoRef, isActive) => {
    const { setHeadTilt, setIsNodding } = useGestureStore();
    const faceLandmarkerRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    const requestRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadModel = async () => {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                setIsLoaded(true);
            } catch (error) {
                console.error("Error loading FaceLandmarker:", error);
            }
        };

        if (isActive) {
            loadModel();
        }

        return () => {
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
            }
        };
    }, [isActive]);

    const detect = () => {
        if (!faceLandmarkerRef.current || !videoRef.current || !videoRef.current.videoWidth) {
            requestRef.current = requestAnimationFrame(detect);
            return;
        }

        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = videoRef.current.currentTime;

            const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                // We can use blendshapes or landmarks. 
                // For simple tilt/nod, landmarks might be easier to visualize, 
                // but blendshapes give us semantic meaning directly if available.
                // Actually, let's use landmarks for orientation (Pose) estimation logic simplified.

                // Or simpler: use blendshapes for "Look Left/Right" if available?
                // FaceLandmarker provides transformation matrix too, but let's calculate from landmarks.

                // Landmarks: 
                // 4: Nose tip
                // 454: Left ear tragus
                // 234: Right ear tragus
                // 10: Top of head
                // 152: Chin

                const landmarks = results.faceLandmarks[0];
                if (landmarks) {
                    const nose = landmarks[4];
                    const leftEar = landmarks[454];
                    const rightEar = landmarks[234];
                    const top = landmarks[10];
                    const chin = landmarks[152];

                    // Calculate Roll (Head Tilt) - Angle between ears
                    const dx = rightEar.x - leftEar.x;
                    const dy = rightEar.y - leftEar.y;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                    // Debug Log
                    // console.log('Head Tracking:', { angle: angle });

                    let tilt = 'center';
                    // Threshold: 15 degrees
                    // Positive Angle -> Right Ear Lower -> Tilt Right
                    // Negative Angle -> Left Ear Lower -> Tilt Left

                    if (angle > 15) tilt = 'right';
                    if (angle < -15) tilt = 'left';

                    setHeadTilt(tilt);

                    // Calculate Pitch (Nod)
                    // Compare nose vertical position relative to ears center?
                    // Or just use blendshapes if available?
                    // Let's use simple aspect ratio of face height? No.
                    // Let's use nose y position relative to ear center y.

                    const earCenterY = (leftEar.y + rightEar.y) / 2;
                    const noseY = nose.y;

                    // If nose is significantly below ears -> Looking down (Nod)
                    // If nose is above -> Looking up

                    // Thresholds need tuning.
                    const nodThreshold = 0.05; // Relative to face size?
                    const faceHeight = chin.y - top.y;

                    const relativeNoseY = (noseY - earCenterY) / faceHeight;

                    // Tuned threshold: 0.15 seems better for distinct nod
                    const isNoddingNow = relativeNoseY > 0.15; // Looking down
                    setIsNodding(isNoddingNow);
                }
            }
        }

        requestRef.current = requestAnimationFrame(detect);
    };

    useEffect(() => {
        if (isLoaded && isActive) {
            requestRef.current = requestAnimationFrame(detect);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isLoaded, isActive]);

    return { isLoaded };
};
