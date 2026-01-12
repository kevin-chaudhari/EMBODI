import VRConcert from '../index.js';
import HandTracker from '../core/hand_tracker.js';
import GestureRecognizer from '../core/gesture_recognizer.js';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, AdditiveBlending, SpotLight, FogExp2, Color, SphereGeometry, BoxGeometry, CylinderGeometry, MeshStandardMaterial, Mesh, DirectionalLight, Group, PlaneGeometry, MeshBasicMaterial } from '../core/three.js';

const startConcert = (mode) => {
  document.getElementById('overlay').style.display = 'none';

  let handTracker;
  let gestureRecognizer;
  let lastGestureState = {};
  let lastTrackChangeTime = 0;
  let discoParticles;
  let crowdParticles;
  let spotlights = [];
  let discoBall;
  let fallingCubes = [];
  let bandMembers = [];
  let concertScreen;

  // Reusable Geometries/Materials for Performance
  const cubeGeo = new BoxGeometry(0.5, 0.5, 0.5);
  const cubeMat = new MeshStandardMaterial({ roughness: 0.5, metalness: 0.5 }); // Color will be set per instance if possible, or we clone material

  // Smoothing state
  let smoothedVolume = 0.5;
  let smoothedColor = 0;

  if (mode === 'create') {
    document.getElementById('gesture-guide').style.display = 'block';
    gestureRecognizer = new GestureRecognizer();
    handTracker = new HandTracker({
      onResults: (results) => {
        const gestures = gestureRecognizer.process(results);
        if (gestures) {
          lastGestureState = gestures;
          // Visualize CV Logic
          handTracker.draw(results, gestures.fingerStates, gestures.name);
        } else {
          handTracker.draw(results, null, null);
        }
      }
    });
    handTracker.start();
  }



  VRConcert({
    mount: document.getElementById('mount'),
    performances: {
      chromakey: '#00d800',
      members: 2,
      tracklist: [
        {
          title: 'zapatilla brothers',
          video: 'performances/track_packed.webm',
          theme: {
            spotlights: [0x00ffff, 0xff00ff, 0x0000ff, 0xff0000], // Cyan/Magenta (Neon Cyberpunk)
            fog: 0x111111
          }
        },
        {
          title: 'Christmas',
          video: 'performances/track/christmas-443109.mp3',
          theme: {
            spotlights: [0xFF0000, 0x00FF00, 0xFF0000, 0x00FF00], // Red/Green (Holiday)
            fog: 0x051105 // Dark Greenish Fog
          }
        },
        {
          title: 'Festive Cheer',
          video: 'performances/track/christmas-holiday-festive-cheer-snow-427231.mp3',
          theme: {
            spotlights: [0x00FFFF, 0xFFFFFF, 0x00FFFF, 0xFFFFFF], // Cyan/White (Winter Wonderland)
            fog: 0x001111 // Icy Blue Fog
          }
        },
        {
          title: 'Sweet Life',
          video: 'performances/track/sweet-life-luxury-chill-438146.mp3',
          theme: {
            spotlights: [0xFFD700, 0x800080, 0xFFD700, 0x800080], // Gold/Purple (Luxury Lounge)
            fog: 0x110011 // Deep Purple Fog
          }
        },
      ],
    },
    ambient: {
      sky: 0xffffff,
      ground: 0x444444,
      position: { x: 0, y: 1, z: 0 },
    },
    scenery: `scenery/stage_duo.glb?t=${Date.now()}`,
    skybox: [
      'skybox/right.jpg',
      'skybox/left.jpg',
      'skybox/top.jpg',
      'skybox/bottom.jpg',
      'skybox/front.jpg',
      'skybox/back.jpg',
    ],
    onAnimationTick: ({ room, scenery }) => {
      // 0. Initialize Concert Atmosphere (Fog, Spotlights, Crowd)
      if (spotlights.length === 0) {
        // Fog
        room.fog = new FogExp2(0x111111, 0.02);

        // Spotlights
        const colors = [0x00ffff, 0xff00ff, 0x0000ff, 0xff0000];
        for (let i = 0; i < 4; i++) {
          const spotLight = new SpotLight(colors[i], 2);
          spotLight.position.set((i - 1.5) * 5, 10, 5);
          spotLight.angle = 0.5;
          spotLight.penumbra = 0.5;
          spotLight.decay = 2;
          spotLight.distance = 50;
          spotLight.target.position.set(0, 0, -10);
          room.add(spotLight);
          room.add(spotLight.target);
          spotlights.push(spotLight);
        }

        // Crowd Particles (Sea of lights)
        const crowdGeo = new BufferGeometry();
        const crowdVerts = [];
        for (let i = 0; i < 200; i++) { // Reduced to 200
          const x = (Math.random() - 0.5) * 40;
          const y = Math.random() * 5;
          const z = 10 + Math.random() * 20; // Behind camera
          crowdVerts.push(x, y, z);
        }
        crowdGeo.setAttribute('position', new Float32BufferAttribute(crowdVerts, 3));
        const crowdMat = new PointsMaterial({
          size: 0.2,
          color: 0xffffaa,
          transparent: true,
          opacity: 0.6,
          blending: AdditiveBlending
        });
        crowdParticles = new Points(crowdGeo, crowdMat);
        room.add(crowdParticles);
      }

      // Animate Spotlights
      const time = Date.now() * 0.001;
      spotlights.forEach((light, i) => {
        light.target.position.x = Math.sin(time + i) * 10;
        light.target.position.z = -10 + Math.cos(time * 0.5 + i) * 5;
      });

      // Animate Crowd
      if (crowdParticles) {
        crowdParticles.position.y = Math.sin(time * 2) * 0.2; // Bobbing
      }

      // Initialize Disco Particles if needed
      if (!discoParticles) {
        const geometry = new BufferGeometry();
        const vertices = [];
        const colors = [];
        for (let i = 0; i < 200; i++) { // Reduced to 200
          vertices.push((Math.random() - 0.5) * 10);
          vertices.push((Math.random() - 0.5) * 10);
          vertices.push((Math.random() - 0.5) * 10);

          // Random neon colors
          colors.push(Math.random(), Math.random(), Math.random());
        }
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

        const material = new PointsMaterial({
          size: 0.05,
          vertexColors: true, // Enable per-particle color
          blending: AdditiveBlending,
          transparent: true
        });
        discoParticles = new Points(geometry, material);
        discoParticles.visible = false;
        room.add(discoParticles);
      }

      // Initialize Band Visuals (Enhanced)
      if (bandMembers.length === 0) {
        const bodyGeo = new CylinderGeometry(0.3, 0.3, 1.5, 8);
        const headGeo = new SphereGeometry(0.25, 16, 16);
        const skinMat = new MeshStandardMaterial({ color: 0xffccaa, roughness: 0.5 });
        const clothesMat = new MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

        // Create 4 band members
        for (let i = 0; i < 4; i++) {
          const group = new Group();

          // Body
          // Clone material for individual color control
          const memberClothesMat = clothesMat.clone();
          const body = new Mesh(bodyGeo, memberClothesMat);
          body.position.y = 0.75;
          body.castShadow = true;
          body.receiveShadow = true;
          group.add(body);

          // Store reference to material for dynamic updates
          group.userData.clothesMat = memberClothesMat;

          // Head
          const head = new Mesh(headGeo, skinMat);
          head.position.y = 1.6;
          head.castShadow = true;
          head.receiveShadow = true;
          group.add(head);

          group.position.set((i - 1.5) * 2, 0, -5);
          room.add(group);
          bandMembers.push(group);
        }

        // Add a directional light for shadows (Optimized)
        const dirLight = new DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 256; // Reduced to 256 for extreme performance
        dirLight.shadow.mapSize.height = 256;
        room.add(dirLight);

        // Concert Screen
        const screenGeo = new PlaneGeometry(10, 6);
        const screenMat = new MeshBasicMaterial({ color: 0x000000 });
        concertScreen = new Mesh(screenGeo, screenMat);
        concertScreen.position.set(0, 4, -8);
        room.add(concertScreen);
      }

      // Initialize Disco Ball (Enhanced)
      if (!discoBall) {
        discoBall = new Group();

        // Main Ball
        const ballGeo = new SphereGeometry(1, 32, 32);
        const ballMat = new MeshStandardMaterial({ color: 0x888888, roughness: 0.1, metalness: 1.0 });
        const mainBall = new Mesh(ballGeo, ballMat);
        discoBall.add(mainBall);

        // Satellite Balls (More Globes!)
        for (let i = 0; i < 3; i++) {
          const smallBall = new Mesh(new SphereGeometry(0.4, 16, 16), ballMat);
          const angle = (i / 3) * Math.PI * 2;
          smallBall.position.set(Math.cos(angle) * 2, 0.5, Math.sin(angle) * 2);
          discoBall.add(smallBall);
        }

        discoBall.position.set(0, 20, 0); // Start high up
        discoBall.visible = false;
        room.add(discoBall);
      }

      if (mode === 'create' && lastGestureState) {
        const { volume, rotate, rotateDirection, clap, color, wave, pinch, yo, nextTrack } = lastGestureState;

        // Define isGestureActive for Volume Lock
        const isGestureActive = pinch || yo || nextTrack || clap;

        // 0. Next Track (Thumb Up)
        if (nextTrack && (Date.now() - lastTrackChangeTime > 2000)) {
          if (scenery.player) {
            scenery.player.nextTrack();
            lastTrackChangeTime = Date.now();
            console.log("Track Changed via Gesture!");

            // Show Notification
            const notification = document.createElement('div');
            notification.style.position = 'absolute';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.color = '#fff';
            notification.style.fontSize = '48px';
            notification.style.fontFamily = 'monospace';
            notification.style.fontWeight = 'bold';
            notification.style.textShadow = '0 0 10px #00ffff';
            notification.style.pointerEvents = 'none';
            notification.innerText = "NEXT TRACK >>";
            document.body.appendChild(notification);

            setTimeout(() => {
              notification.remove();
            }, 1000);
          }
        }

        // 1. Volume (Height Control)
        if (!isGestureActive && volume !== undefined && scenery.player && scenery.player.video) {
          // Fine-tuned sensitivity: Power curve for better control at low volumes
          const tunedVolume = Math.pow(volume, 1.5);
          scenery.player.video.volume = tunedVolume;

          // Update Screen Brightness based on volume
          if (concertScreen && concertScreen.material) {
            const brightness = 0.2 + (tunedVolume * 0.8);
            concertScreen.material.color.setHSL(0, 0, brightness);
          }
        }

        // 2. Rotate (Pinch/Circle)
        if (rotate) {
          room.rotateY(0.02 * rotateDirection);
        }

        // 3. Disco Ball (Clap or Yo)
        // Toggle mode based on current gesture state
        if (clap || yo) {
          if (!discoBall.visible) {
            discoBall.visible = true;
            discoBall.position.y = 20; // Reset to top
          }
          scenery.isDiscoMode = true;
        } else {
          scenery.isDiscoMode = false;
        }

        if (discoBall.visible && discoBall.position.y > 5) {
          discoBall.position.y -= 0.2; // Fall down
          discoBall.rotation.y += 0.05; // Spin
        } else if (discoBall.visible) {
          discoBall.rotation.y += 0.02; // Just spin when stopped
        }

        // 4. Falling Cubes (Pinch)
        if (pinch && fallingCubes.length < 20) { // Limit max cubes to 20
          // Clone material to allow individual colors, but reuse geometry
          const mat = cubeMat.clone();
          mat.color.setHSL(color || Math.random(), 1, 0.5);

          const cube = new Mesh(cubeGeo, mat);
          cube.position.set((Math.random() - 0.5) * 10, 15, (Math.random() - 0.5) * 10);
          cube.castShadow = false; // Disable shadows for performance
          cube.userData = { velocity: 0 };
          room.add(cube);
          fallingCubes.push(cube);
        }

        // Disco Ball Animation
        if (discoBall.visible && discoBall.position.y > 5) {
          discoBall.position.y -= 0.2; // Fall down
          discoBall.rotation.y += 0.05; // Spin
        } else if (discoBall.visible) {
          discoBall.rotation.y += 0.02; // Just spin when stopped
        }

        // Animate Cubes
        for (let i = fallingCubes.length - 1; i >= 0; i--) {
          const cube = fallingCubes[i];
          cube.userData.velocity -= 0.01; // Gravity
          cube.position.y += cube.userData.velocity;
          cube.rotation.x += 0.05;
          cube.rotation.z += 0.05;

          if (cube.position.y < 0) {
            room.remove(cube);
            // Dispose material to prevent memory leak
            cube.material.dispose();
            fallingCubes.splice(i, 1);
          }
        }

        if (scenery.isDiscoMode) {
          // Dark Mode: "Lighten up everything is dark and just disco ball"

          // Dim Ambient Light
          if (!scenery.ambientLight) {
            // scenery.scene is undefined, use room.parent (the scene)
            if (room.parent) {
              scenery.ambientLight = room.parent.children.find(c => c.isAmbientLight);
            }
          }
          if (scenery.ambientLight) {
            scenery.ambientLight.intensity = 0.1;
          }

          if (scenery.parent && scenery.parent.background) {
            // Store original background if not stored yet
            if (!scenery.originalBackground) {
              scenery.originalBackground = scenery.parent.background;
            }

            // Set to black for dark mode
            // Check if it's already a Color and black to avoid churn
            if (!scenery.parent.background.isColor || scenery.parent.background.getHex() !== 0x000000) {
              scenery.parent.background = new Color(0x000000);
            }
          }

          // Spotlights focus on ball?
          spotlights.forEach((light, i) => {
            // Neon Colors: Cyan, Magenta, Lime, Electric Blue
            const neonColors = [0x00FFFF, 0xFF00FF, 0x39FF14, 0x7DF9FF];
            light.color.setHex(neonColors[i % neonColors.length]);
            light.intensity = 10; // Brighter

            // Dynamic Movement in Disco Mode
            light.target.position.x = Math.sin(Date.now() * 0.002 + i) * 15;
            light.target.position.z = Math.cos(Date.now() * 0.002 + i) * 15;
          });

          // room.rotateY(0.05); // Auto-rotate removed per user request

          // Activate particles with Vortex movement
          discoParticles.visible = true;
          discoParticles.rotation.y += 0.02; // Spin faster
          discoParticles.rotation.z += 0.01; // Tumble

          // Pulse size
          const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
          discoParticles.scale.set(scale, scale, scale);

          // Darken Fog
          if (room.fog) {
            room.fog.color.setHex(0x000000);
          }

          // Ensure Disco Ball has reflections (Skybox) even in dark mode
          if (discoBall && scenery.originalBackground && !discoBall.children[0].material.envMap) {
            discoBall.children.forEach(child => {
              if (child.material) child.material.envMap = scenery.originalBackground;
            });
          }
        } else {
          discoParticles.visible = false;
          // Restore Ambient Light
          if (scenery.ambientLight) {
            scenery.ambientLight.intensity = 0.5;
          }

          // Restore Background
          if (scenery.originalBackground && scenery.parent) {
            scenery.parent.background = scenery.originalBackground;
          }

          // Restore Fog
          if (room.fog) {
            room.fog.color.setHex(0x111111);
          }

          // Hide Disco Ball when not in mode
          if (discoBall.visible) {
            discoBall.visible = false;
          }
        }
      }

      // Attach Audio to Screen (Spatial Audio)
      if (scenery.player && scenery.player.audio && scenery.player.audio.source && concertScreen && !concertScreen.userData.hasAudio) {
        concertScreen.add(scenery.player.audio.source);
        concertScreen.userData.hasAudio = true;
        console.log("Spatial Audio Attached to Screen");
      }

      // Apply Track Theme (Dynamic Visuals)
      if (scenery.player && scenery.player.performances && scenery.player.performances.tracklist) {
        const currentTrack = scenery.player.performances.tracklist[scenery.player.track];
        if (currentTrack && currentTrack.theme) {
          // Apply Spotlight Colors (Lerp for smooth transition)
          if (!scenery.isDiscoMode) { // Only override if NOT in disco mode (Disco mode has its own neon colors)
            spotlights.forEach((light, i) => {
              const targetColor = new Color(currentTrack.theme.spotlights[i % currentTrack.theme.spotlights.length]);
              light.color.lerp(targetColor, 0.05);
            });

            // Apply Fog Color
            if (room.fog) {
              const targetFog = new Color(currentTrack.theme.fog);
              room.fog.color.lerp(targetFog, 0.05);
            }

            // Apply Band Member Colors
            bandMembers.forEach((group, i) => {
              if (group.userData.clothesMat) {
                const targetColor = new Color(currentTrack.theme.spotlights[i % currentTrack.theme.spotlights.length]);
                group.userData.clothesMat.color.lerp(targetColor, 0.05);
              }
            });
          }
        }
      }
    }
  });
};

// document.getElementById('btn-listen').addEventListener('click', () => startConcert('listen'));
document.getElementById('btn-listen-local').addEventListener('click', () => startConcert('create'));
