import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store/gestureStore';

export const Tunnel = () => {
    const groupRef = useRef();
    const { leftPinch, rightPinch, rightPos } = useGestureStore();

    useFrame((state) => {
        if (groupRef.current) {
            const totalPinch = (leftPinch + rightPinch) / 2;
            const speed = 0.5 + totalPinch * 3;

            groupRef.current.rotation.z += 0.01 * speed;
            groupRef.current.position.z += 0.05 * speed;

            // Loop the tunnel
            if (groupRef.current.position.z > 10) {
                groupRef.current.position.z = -50;
            }

            // Color based on hand position
            const hue = rightPos.x;
            groupRef.current.children.forEach((ring, i) => {
                if (ring.material) {
                    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                    ring.material.color = color;
                    ring.material.emissive = color;
                    ring.material.emissiveIntensity = totalPinch * 2;
                }
            });
        }
    });

    // Generate tunnel rings
    const rings = [];
    for (let i = 0; i < 30; i++) {
        rings.push(
            <mesh key={i} position={[0, 0, -i * 2]}>
                <torusGeometry args={[2 + i * 0.1, 0.1, 16, 32]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
        );
    }

    return <group ref={groupRef}>{rings}</group>;
};
