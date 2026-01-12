import React from 'react';

export const LandingPage = ({ onEnter }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 text-center px-8 max-w-4xl">
                <h1 className="text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-pulse-glow tracking-tighter">
                    AURA
                </h1>
                <p className="text-2xl text-gray-300 mb-12 font-light tracking-wide">
                    Gesture-Controlled Audio Visual Experience
                </p>

                <button
                    onClick={onEnter}
                    className="group relative px-12 py-6 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
                >
                    <div className="absolute inset-0 border border-cyan-500/50 rounded-full group-hover:border-cyan-400 transition-colors" />
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                    <span className="relative text-cyan-400 font-mono text-xl tracking-[0.2em] group-hover:text-cyan-300 transition-colors">
                        ENTER EXPERIENCE
                    </span>
                </button>
            </div>
        </div>
    );
};
