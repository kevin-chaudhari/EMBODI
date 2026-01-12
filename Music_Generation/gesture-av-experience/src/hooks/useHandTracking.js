import { useEffect, useRef } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { useGestureStore } from '../store/gestureStore';

// Fallback for some build environments where named exports might fail
const HandsClass = Hands || window.Hands;
const HandConnections = HAND_CONNECTIONS || window.HAND_CONNECTIONS;
const CameraClass = Camera || window.Camera;

// Utility functions
const lerp = (start, end, factor) => start + (end - start) * factor;

const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = (point1.z || 0) - (point2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const calculateAngle = (center, point) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    // Calculate angle in radians, then normalize to 0-1 range roughly
    // Atan2 returns -PI to PI
    let angle = Math.atan2(dy, dx);
    // Normalize? 
    // Let's just return the raw angle for now or map specific range
    return angle;
};

const normalizePinch = (distance) => {
    const minDist = 0.02;
    const maxDist = 0.1; // Reduced from 0.15 for snappier response
    return Math.max(0, Math.min(1, 1 - (distance - minDist) / (maxDist - minDist)));
};

export const useHandTracking = (webcamRef, canvasRef) => {
    const handsRef = useRef(null);
    const cameraRef = useRef(null);

    // Store showDebug in a ref so we can access it in onResults without re-binding
    const showDebugRef = useRef(useGestureStore.getState().showDebug);

    // Subscribe to showDebug changes
    useEffect(() => {
        const unsubscribe = useGestureStore.subscribe(
            (state) => (showDebugRef.current = state.showDebug)
        );
        return unsubscribe;
    }, []);

    const smoothingRef = useRef({
        leftPinch: 0,
        rightPinch: 0,
        leftPos: { x: 0.5, y: 0.5 },
        rightPos: { x: 0.5, y: 0.5 }
    });

    useEffect(() => {
        // Ensure Hands is available
        if (!HandsClass) {
            console.error('MediaPipe Hands not loaded');
            return;
        }

        const hands = new HandsClass({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        hands.onResults(async (results) => {
            // Always clear the canvas first to prevent trails
            if (canvasRef.current) {
                const canvasCtx = canvasRef.current.getContext('2d');
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // Draw debug visualization if enabled
                if (showDebugRef.current) {
                    canvasCtx.save();

                    if (results.multiHandLandmarks && HandConnections) {
                        for (const landmarks of results.multiHandLandmarks) {
                            // Draw connections
                            for (const connection of HandConnections) {
                                const [startIdx, endIdx] = connection;
                                const start = landmarks[startIdx];
                                const end = landmarks[endIdx];

                                canvasCtx.beginPath();
                                canvasCtx.moveTo(start.x * canvasRef.current.width, start.y * canvasRef.current.height);
                                canvasCtx.lineTo(end.x * canvasRef.current.width, end.y * canvasRef.current.height);
                                canvasCtx.strokeStyle = '#00ffff'; // Cyan (Blue-ish)
                                canvasCtx.lineWidth = 3; // Thicker for better visibility
                                canvasCtx.stroke();
                            }

                            // Draw landmarks
                            landmarks.forEach((landmark) => {
                                canvasCtx.beginPath();
                                canvasCtx.arc(
                                    landmark.x * canvasRef.current.width,
                                    landmark.y * canvasRef.current.height,
                                    5, // Slightly larger dots
                                    0,
                                    2 * Math.PI
                                );
                                canvasCtx.fillStyle = '#ff00ff'; // Magenta (Purple)
                                canvasCtx.fill();
                            });
                        }
                    }
                    canvasCtx.restore();
                }
            }

            // Process hand data
            if (results.multiHandLandmarks && results.multiHandedness) {
                let leftData = null;
                let rightData = null;

                for (let i = 0; i < results.multiHandedness.length; i++) {
                    const handedness = results.multiHandedness[i].label;
                    const landmarks = results.multiHandLandmarks[i];

                    const thumb = landmarks[4];
                    const index = landmarks[8];
                    const palm = landmarks[0]; // Wrist
                    const indexMCP = landmarks[5]; // Index finger base

                    const distance = calculateDistance(thumb, index);
                    const pinchStrength = normalizePinch(distance);

                    const pos = {
                        x: palm.x,
                        y: palm.y
                    };

                    // Twist Calculation
                    const angle = calculateAngle(palm, indexMCP);
                    const twist = (angle + Math.PI) / (2 * Math.PI);

                    // Note: MediaPipe labels are mirrored for webcam
                    if (handedness === 'Left') {
                        rightData = { pinch: pinchStrength, pos, twist };
                    } else {
                        leftData = { pinch: pinchStrength, pos, twist };
                    }
                }

                // Apply smoothing and update store
                const smoothing = 0.2; // Faster response (User requested "fast moving")
                const { updateGestureData } = useGestureStore.getState();

                if (rightData) {
                    smoothingRef.current.rightPinch = lerp(smoothingRef.current.rightPinch, rightData.pinch, smoothing);
                    smoothingRef.current.rightPos.x = lerp(smoothingRef.current.rightPos.x, rightData.pos.x, smoothing);
                    smoothingRef.current.rightPos.y = lerp(smoothingRef.current.rightPos.y, rightData.pos.y, smoothing);

                    if (smoothingRef.current.rightTwist === undefined) smoothingRef.current.rightTwist = 0.5;
                    smoothingRef.current.rightTwist = lerp(smoothingRef.current.rightTwist, rightData.twist, smoothing);
                }

                if (leftData) {
                    smoothingRef.current.leftPinch = lerp(smoothingRef.current.leftPinch, leftData.pinch, smoothing);
                    smoothingRef.current.leftPos.x = lerp(smoothingRef.current.leftPos.x, leftData.pos.x, smoothing);
                    smoothingRef.current.leftPos.y = lerp(smoothingRef.current.leftPos.y, leftData.pos.y, smoothing);

                    if (smoothingRef.current.leftTwist === undefined) smoothingRef.current.leftTwist = 0.5;
                    smoothingRef.current.leftTwist = lerp(smoothingRef.current.leftTwist, leftData.twist, smoothing);
                }

                updateGestureData({
                    leftPinch: smoothingRef.current.leftPinch,
                    rightPinch: smoothingRef.current.rightPinch,
                    leftPos: { ...smoothingRef.current.leftPos },
                    rightPos: { ...smoothingRef.current.rightPos },
                    leftTwist: smoothingRef.current.leftTwist || 0.5,
                    rightTwist: smoothingRef.current.rightTwist || 0.5,
                    isTracking: true
                });
            } else {
                useGestureStore.getState().setIsTracking(false);
            }
        });

        handsRef.current = hands;

        return () => {
            if (handsRef.current) {
                handsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (webcamRef.current?.video && handsRef.current) {
            const camera = new CameraClass(webcamRef.current.video, {
                onFrame: async () => {
                    if (handsRef.current && webcamRef.current?.video) {
                        await handsRef.current.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480
            });

            camera.start();
            cameraRef.current = camera;
        }

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
        };
    }, [webcamRef.current?.video]); // Only re-run if video element changes

    return { handsRef, cameraRef };
};
