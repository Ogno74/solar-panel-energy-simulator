import React, { useState, useRef, useCallback } from 'react';

interface CompassProps {
    azimuth: number;
    onAzimuthChange: (azimuth: number) => void;
}

const getCardinalDirection = (angle: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(angle / 45) % 8];
};

export const Compass: React.FC<CompassProps> = ({ azimuth, onAzimuthChange }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return;
        
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        angle = (angle + 90 + 360) % 360; // Offset by 90 degrees to make 0 North

        onAzimuthChange(Math.round(angle));

    }, [onAzimuthChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            handleInteraction(e);
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            handleInteraction(e);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Azimut del Panel (Orientación)</label>
            <div 
                className="w-full max-w-[200px] mx-auto cursor-pointer"
                onMouseLeave={handleMouseUp}
            >
                <svg
                    ref={svgRef}
                    viewBox="0 0 100 100"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Compass base */}
                    <circle cx="50" cy="50" r="48" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
                    
                    {/* Cardinal points */}
                    <text x="50" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4b5563">N</text>
                    <text x="50" y="92" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4b5563">S</text>
                    <text x="8" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4b5563">W</text>
                    <text x="92" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4b5563">E</text>

                    {/* Tick marks */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line
                            key={i}
                            x1="50"
                            y1="2"
                            x2="50"
                            y2="8"
                            stroke="#9ca3af"
                            strokeWidth="1"
                            transform={`rotate(${i * 30}, 50, 50)`}
                        />
                    ))}

                    {/* Azimuth needle */}
                    <g transform={`rotate(${azimuth}, 50, 50)`}>
                        <polygon points="50,10 55,20 45,20" fill="#ef4444" />
                        <line x1="50" y1="10" x2="50" y2="50" stroke="#ef4444" strokeWidth="2" />
                    </g>

                    {/* Center circle */}
                    <circle cx="50" cy="50" r="5" fill="#fff" stroke="#4b5563" strokeWidth="1" />

                </svg>
            </div>
            <div className="text-center mt-2 font-mono text-lg text-gray-800">
                {azimuth}°
                <span className="ml-2 font-sans text-base font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {getCardinalDirection(azimuth)}
                </span>
            </div>
        </div>
    );
};