class GestureRecognizer {
    constructor() {
        this.state = {
            volume: 0.5,
            rotation: 0,
            disco: false,
            color: 0
        };

        // History for gesture detection
        this.history = {
            wristX: [], // For wave
            lastClapTime: 0
        };

        this.maxHistory = 30; // Store last 30 frames
    }

    process(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return null;
        }

        const gestures = {};
        const now = Date.now();

        results.multiHandLandmarks.forEach((landmarks, index) => {
            // 1. Volume (Height Control) - Always calculated but can be overridden
            const wristY = landmarks[0].y;
            gestures.volume = Math.max(0, Math.min(1, (1.0 - wristY - 0.2) * 1.6));

            // Finger States
            const isThumbExtended = this.isFingerExtended(landmarks, 0);
            const isIndexExtended = this.isFingerExtended(landmarks, 1);
            const isMiddleExtended = this.isFingerExtended(landmarks, 2);
            const isRingExtended = this.isFingerExtended(landmarks, 3);
            const isPinkyExtended = this.isFingerExtended(landmarks, 4);

            const isIndexCurled = this.isFingerCurled(landmarks, 1);
            const isMiddleCurled = this.isFingerCurled(landmarks, 2);
            const isRingCurled = this.isFingerCurled(landmarks, 3);
            const isPinkyCurled = this.isFingerCurled(landmarks, 4);

            gestures.fingerStates = [isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended];

            // --- STRICT PRIORITY SYSTEM ---

            // 1. YO (Highest Priority - Mode Switch)
            const isYo = isIndexExtended && isPinkyExtended && isMiddleCurled && isRingCurled;

            if (isYo) {
                gestures.yo = true;
                gestures.name = "YO (DISCO)";
                return; // Stop processing other gestures for this hand
            }

            // 2. NEXT TRACK (Thumb Up)
            const isThumbUp = isThumbExtended && isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled;
            const thumbTip = landmarks[4];
            const thumbIP = landmarks[3];
            const indexMCP = landmarks[5]; // Index knuckle

            // Stricter Checks:
            // A. Thumb must be pointing UP (Tip above IP)
            const isUpright = thumbTip.y < thumbIP.y;

            // B. Thumb Tip must be significantly above Index Knuckle (MCP) to ensure it's raised
            const isAboveFist = thumbTip.y < (indexMCP.y - 0.05);

            if (isThumbUp && isUpright && isAboveFist) {
                gestures.nextTrack = true;
                gestures.name = "NEXT TRACK >>";
                return; // Stop processing
            }

            // 3. PINCH (Interaction)
            const indexTip = landmarks[8];
            const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

            if (pinchDist < 0.08) {
                gestures.pinch = true;
                gestures.color = landmarks[0].x; // Use wrist X for color
                gestures.name = "PINCH (CUBES)";
                return; // Stop processing
            }

            // 4. WAVE (Rotation) - Lowest Priority
            const wristX = landmarks[0].x;
            this.history.wristX.push({ x: wristX, time: now });
            if (this.history.wristX.length > this.maxHistory) this.history.wristX.shift();

            if (this.detectWave(this.history.wristX)) {
                gestures.rotate = true;
                gestures.rotateDirection = 1;
                gestures.name = "WAVE (ROTATE)";
            }
        });

        // 6. Clap (Backup)
        if (results.multiHandLandmarks.length === 2) {
            const hand1 = results.multiHandLandmarks[0][0];
            const hand2 = results.multiHandLandmarks[1][0];
            const dist = Math.hypot(hand1.x - hand2.x, hand1.y - hand2.y);

            if (dist < 0.1 && (now - this.history.lastClapTime > 500)) {
                gestures.clap = true;
                this.history.lastClapTime = now;
                gestures.name = "CLAP";
            }
        }

        return gestures;
    }

    // Vector-based finger state detection (Rotation Invariant)
    isFingerExtended(landmarks, fingerIndex) {
        const wrist = landmarks[0];
        let tip, pip;

        if (fingerIndex === 0) {
            tip = landmarks[4];
            pip = landmarks[2];
        } else {
            const offset = fingerIndex * 4;
            tip = landmarks[offset + 4];
            pip = landmarks[offset + 2];
        }

        const distWristTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const distWristPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);

        return distWristTip > distWristPip;
    }

    isFingerCurled(landmarks, fingerIndex) {
        const wrist = landmarks[0];
        let tip, pip;

        if (fingerIndex === 0) {
            tip = landmarks[4];
            pip = landmarks[2];
        } else {
            const offset = fingerIndex * 4;
            tip = landmarks[offset + 4];
            pip = landmarks[offset + 2];
        }

        const distWristTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const distWristPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);

        // If Tip is closer to wrist than PIP, it's curled
        return distWristTip < distWristPip;
    }

    detectWave(history) {
        if (history.length < 10) return false;
        let directionChanges = 0;
        let lastDir = 0;

        for (let i = 1; i < history.length; i++) {
            const diff = history[i].x - history[i - 1].x;
            const dir = diff > 0 ? 1 : -1;
            if (Math.abs(diff) > 0.01) {
                if (lastDir !== 0 && dir !== lastDir) {
                    directionChanges++;
                }
                lastDir = dir;
            }
        }
        return directionChanges >= 2;
    }
}

export default GestureRecognizer;
