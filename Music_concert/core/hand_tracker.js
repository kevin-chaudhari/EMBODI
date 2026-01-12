class HandTracker {
    constructor({ onResults }) {
        this.onResults = onResults;

        // Video element (hidden)
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);

        // Canvas for visual feedback (Video only, no skeleton)
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.style.position = 'absolute';
        this.canvasElement.style.bottom = '10px';
        this.canvasElement.style.left = '10px';
        this.canvasElement.style.width = '320px';
        this.canvasElement.style.height = '240px';
        this.canvasElement.style.zIndex = '95';
        this.canvasElement.style.borderRadius = '10px';
        this.canvasElement.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        this.canvasElement.style.transform = 'scaleX(-1)'; // Mirror effect
        document.body.appendChild(this.canvasElement);
        this.canvasCtx = this.canvasElement.getContext('2d');

        // Use global Hands from CDN script
        this.hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0, // Lite model for performance
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.handleResults.bind(this));
        this.lastFrameTime = 0;
    }

    start() {
        // Use global Camera from CDN script
        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                const now = Date.now();
                // Throttle to ~20 FPS (50ms) for performance
                if (now - this.lastFrameTime < 50) {
                    return;
                }
                this.lastFrameTime = now;
                await this.hands.send({ image: this.videoElement });
            },
            width: 640,
            height: 480
        });
        this.camera.start();
    }

    handleResults(results) {
        // Draw visual feedback (Video only)
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;

        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        // Skeleton drawing enabled for video overlay
        // Note: We don't draw here anymore, we let the script call draw() with extra data

        this.canvasCtx.restore();

        if (this.onResults) {
            this.onResults(results);
        }
    }

    draw(results, fingerStates, gestureName) {
        if (!results.multiHandLandmarks) {
            // Clear canvas if no hands detected
            this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            return;
        }

        this.canvasCtx.save();
        // Mirror effect is already on canvas style, but text needs to be un-mirrored?
        // Actually, canvas context drawing is not mirrored by CSS transform.

        for (const landmarks of results.multiHandLandmarks) {
            // Draw Connections
            window.drawConnectors(this.canvasCtx, landmarks, window.HAND_CONNECTIONS,
                { color: '#FFFFFF', lineWidth: 2 });

            // Draw Finger States (Color Coded)
            // 0: Thumb, 1: Index, 2: Middle, 3: Ring, 4: Pinky
            // Landmarks: 0-4, 5-8, 9-12, 13-16, 17-20

            if (fingerStates) {
                const colors = fingerStates.map(extended => extended ? '#00FF00' : '#FF0000');

                // Thumb
                this.drawFinger(landmarks, [1, 2, 3, 4], colors[0]);
                // Index
                this.drawFinger(landmarks, [5, 6, 7, 8], colors[1]);
                // Middle
                this.drawFinger(landmarks, [9, 10, 11, 12], colors[2]);
                // Ring
                this.drawFinger(landmarks, [13, 14, 15, 16], colors[3]);
                // Pinky
                this.drawFinger(landmarks, [17, 18, 19, 20], colors[4]);
            } else {
                window.drawLandmarks(this.canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });
            }
        }

        // Draw Gesture Name
        // Draw Gesture Name (HUD Style)
        if (gestureName) {
            const text = gestureName;
            this.canvasCtx.font = 'bold 24px monospace';
            const textMetrics = this.canvasCtx.measureText(text);
            const textWidth = textMetrics.width;
            const padding = 10;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 40;
            const x = (this.canvasElement.width - boxWidth) / 2;
            const y = this.canvasElement.height - 50;

            // Semi-transparent background box
            this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.canvasCtx.fillRect(x, y, boxWidth, boxHeight);

            // Border
            this.canvasCtx.strokeStyle = '#00ffff';
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeRect(x, y, boxWidth, boxHeight);

            // Text
            this.canvasCtx.fillStyle = '#00ffff';
            this.canvasCtx.textBaseline = 'middle';
            this.canvasCtx.fillText(text, x + padding, y + boxHeight / 2);
        }

        this.canvasCtx.restore();
    }

    drawFinger(landmarks, indices, color) {
        this.canvasCtx.fillStyle = color;
        this.canvasCtx.strokeStyle = color;
        this.canvasCtx.lineWidth = 3;

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(landmarks[indices[0]].x * this.canvasElement.width, landmarks[indices[0]].y * this.canvasElement.height);
        for (let i = 1; i < indices.length; i++) {
            const pt = landmarks[indices[i]];
            this.canvasCtx.lineTo(pt.x * this.canvasElement.width, pt.y * this.canvasElement.height);
            // Draw joint
            this.canvasCtx.arc(pt.x * this.canvasElement.width, pt.y * this.canvasElement.height, 3, 0, 2 * Math.PI);
        }
        this.canvasCtx.stroke();
    }
}

export default HandTracker;
