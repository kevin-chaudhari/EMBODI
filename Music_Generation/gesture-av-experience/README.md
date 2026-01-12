# AURA: Gesture-Controlled Audio-Visual Experience

**AURA** is an immersive web application that transforms your hand and head movements into real-time audio-visual art. By leveraging computer vision, it creates a touchless interface where your body becomes the controller for a generative music and light show.

## 🚀 Live Demo
[Launch AURA](https://gesture-av-experience-tau.vercel.app/)

## ✨ Key Features

### 👋 Hand Gestures
Control the audio engine with precise hand movements:
*   **Pinch (Left/Right):** Modulate **Reverb** and **Delay** intensity.
*   **Twist:** Adjust the audio **Filter** cutoff.
*   **Vertical Movement (Y-axis):** Control playback **Speed**.
*   **Visual Feedback:** A Cyan/Magenta skeleton overlay tracks your hands in real-time.

### 👤 Head Tracking
*   **Nodding:** Trigger interactions and confirm selections.
*   **Tilting:** Spatial audio control.

### 🎨 Immersive Visuals
*   **Reactive Particles:** 3D particle systems that pulse and shift with the music.
*   **Futuristic HUD:** Circular gauges and real-time metrics display your gesture data.
*   **Dynamic Lighting:** The environment responds to the mood of the track.

## 🛠️ Tech Stack
*   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **3D Graphics:** [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
*   **Computer Vision:** [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
*   **Audio Engine:** [Tone.js](https://tonejs.github.io/)
*   **Styling:** [TailwindCSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gesture-av-experience
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run locally:**
    ```bash
    npm run dev
    ```

## 🚀 Deployment
This project is optimized for deployment on **Vercel**.
```bash
npx vercel --prod
```
