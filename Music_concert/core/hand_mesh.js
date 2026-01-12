import {
    Object3D,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
    CylinderGeometry,
    DoubleSide
} from './three.js';

class HandMesh extends Object3D {
    constructor() {
        super();

        this.joints = [];
        this.bones = [];

        // Neon Cyberpunk Style
        // Joints: Cyan emissive
        const jointGeometry = new SphereGeometry(0.01, 16, 16); // Smaller joints
        const jointMaterial = new MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });

        // Bones: Magenta emissive
        const boneGeometry = new CylinderGeometry(0.008, 0.008, 1, 8); // Thinner bones
        const boneMaterial = new MeshStandardMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.8
        });

        // Create 21 joints
        for (let i = 0; i < 21; i++) {
            const joint = new Mesh(jointGeometry, jointMaterial);
            joint.visible = false;
            this.add(joint);
            this.joints.push(joint);
        }

        // Create bones (connections)
        // MediaPipe Hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
        ];

        connections.forEach(([start, end]) => {
            const bone = new Mesh(boneGeometry, boneMaterial);
            bone.visible = false;
            this.add(bone);
            this.bones.push({ mesh: bone, start, end });
        });
    }

    update(landmarks) {
        if (!landmarks) {
            this.visible = false;
            return;
        }
        this.visible = true;

        // Update joints
        landmarks.forEach((landmark, i) => {
            const joint = this.joints[i];
            if (joint) {
                // Map 2D (0-1) to 3D world coordinates
                // Assuming camera is at roughly (0, 1.6, 0) looking at (0, 1.6, -1)
                // We project hands onto a plane in front of the camera
                // X: -1 to 1 (inverted)
                // Y: 0 to 2 (inverted)
                // Z: -0.5 (fixed depth for now, or use Z from landmarks if available/reliable)

                const x = (0.5 - landmark.x) * 2; // Center 0, range -1 to 1
                const y = (1.0 - landmark.y) * 1.5 + 1.0; // Map 0-1 to 1.0-2.5 height
                const z = -0.5 - (landmark.z || 0); // Depth relative to camera

                joint.position.set(x, y, z);
                joint.visible = true;
            }
        });

        // Update bones
        this.bones.forEach(({ mesh, start, end }) => {
            const startJoint = this.joints[start];
            const endJoint = this.joints[end];

            if (startJoint.visible && endJoint.visible) {
                // Position at midpoint
                mesh.position.copy(startJoint.position).add(endJoint.position).multiplyScalar(0.5);

                // Orient to point from start to end
                mesh.lookAt(endJoint.position);
                mesh.rotateX(Math.PI / 2); // Cylinder aligns with Y axis by default

                // Scale length
                const distance = startJoint.position.distanceTo(endJoint.position);
                mesh.scale.set(1, distance, 1);

                mesh.visible = true;
            }
        });
    }
}

export default HandMesh;
