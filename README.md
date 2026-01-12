# EMBODI  
### Embodied Interaction for Generative Audio-Visual and Virtual Reality Experiences

EMBODI is a Human–Computer Interaction (HCI) project portfolio that explores **embodied interaction**, **natural user interfaces (NUI)**, and **immersive virtual environments** through two complementary systems:

- **AURA** – A gesture-controlled, real-time audio-visual experience  
- **VR Concert Platform** – A browser-based virtual reality concert environment  

Both systems investigate how **human body movement** can function as the primary input modality for expressive, low-latency, immersive digital interaction.

---

## Repository Structure

```
Embodi/
|
+-- Music_Generation/
|   |
|   +-- gesture-av-experience/     # AURA: Gesture-Controlled Audio-Visual System
|
+-- Music_concert/
|   |
|   +-- Music_concert/             # VR Concert Platform
|
+-- README.md

```



---

## Project 1: AURA  
### Gesture-Controlled Audio-Visual Experience

AURA is a real-time, browser-based system that transforms **free-hand gestures** into expressive **audio synthesis** and **procedural visual output**. The user’s body becomes the controller, enabling a fully touchless Natural User Interface.

---

### System Architecture (Conceptual Overview)

AURA follows a **perception–action loop**, consistent with established models of human information processing in HCI.

#### Input Layer
- Live webcam video stream

#### Perception Layer (Computer Vision)
- MediaPipe extracts **21 three-dimensional landmarks per hand**
- Gesture features computed:
  - **Pinch**: Euclidean distance between thumb and index finger
  - **Twist**: Wrist rotation derived from landmark orientation

#### Application State
- Gesture values normalized to a **0–1 continuous range**
- Centralized state management using Zustand

#### Feedback Layer
- **Audio Engine (Tone.js)**  
  Real-time modulation of oscillators, filters, delay, and reverb
- **Visual Engine (Three.js)**  
  Dynamic particle systems and shader-based visuals

This architecture ensures **low-latency**, **synchronized**, and **expressive** audio-visual feedback.

---

### AURA – Technology Stack

- **Frontend:** React 18, Vite  
- **Computer Vision:** Google MediaPipe Tasks-Vision  
- **3D Graphics:** Three.js, React Three Fiber, Drei  
- **Audio:** Tone.js (Web Audio API)  
- **Styling:** Tailwind CSS  

---

## Project 2: VR Concert Platform  
### Web-Based Virtual Reality Performance Environment

The VR Concert Platform enables users to experience virtual concerts directly within the browser. The system emphasizes **presence**, **telepresence**, and **immersion**, avoiding traditional 2D UI paradigms.

Chroma-keyed video performances are embedded into 3D environments, allowing users to attend concerts as spatial experiences rather than passive media.

---

### HCI Principles Applied

#### 1. Diegetic User Interfaces
All interface elements (menus, labels, controls) exist **within the 3D scene** as world objects rather than screen overlays. This preserves immersion and supports suspension of disbelief.

#### 2. Locomotion and User Comfort
To address VR motion sickness caused by sensory conflict, the system employs **teleportation-based locomotion**:
- Users select a destination
- Instant spatial relocation without artificial acceleration
- Reduced nausea and improved usability

---

### VR Concert – Technology Stack

- **Core:** Vanilla JavaScript (ES6 Modules)  
- **Rendering:** WebGL via Three.js  
- **VR Compatibility:** WebVR Polyfill  
- **Server:** Node.js http-server  

---

## Getting Started

### Prerequisites
- Node.js v16 or later  
- Git  

---

### Installation

```bash
# Clone the repository
git clone https://github.com/1216-dev/HCI_116651954_Code.git
cd HCI_116651954_Code

---

### Run Project 1: AURA

cd Music_Generation/gesture-av-experience
npm install
npm run dev

---
