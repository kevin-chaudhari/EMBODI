import React from 'react';
import { Tunnel } from './Tunnel';

export const Scene = () => {
    return (
        <>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 10, 50]} />

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, 5]} intensity={0.5} color="#ff00ff" />

            <Tunnel />
        </>
    );
};
