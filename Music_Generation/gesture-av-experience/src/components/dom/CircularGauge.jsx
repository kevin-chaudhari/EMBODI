import React from 'react';

export const CircularGauge = ({ value, label, color, size = 120 }) => {
    const percentage = value * 100;
    const strokeWidth = size * 0.06; // Scale stroke with size
    const radius = (size / 2) - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const center = size / 2;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="#1a1a2e"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-100"
                    style={{
                        filter: `drop-shadow(0 0 10px ${color})`
                    }}
                />
            </svg>
            {label && (
                <div className="text-center mt-2">
                    <div
                        className="text-2xl font-bold"
                        style={{ color }}
                    >
                        {Math.round(percentage)}%
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                        {label}
                    </div>
                </div>
            )}
        </div>
    );
};
