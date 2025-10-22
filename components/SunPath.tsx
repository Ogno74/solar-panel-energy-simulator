
import React from 'react';
import type { WeatherCondition } from '../types';

interface SunPathProps {
    weather: WeatherCondition;
    weatherPoints: number[];
}

// --- Mini SVG Weather Icons ---
const SunnyIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g transform={`translate(${x - 17.5}, ${y - 17.5}) scale(0.35)`} fill="#f59e0b">
        <circle cx="50" cy="50" r="15" />
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round">
            <line x1="50" y1="25" x2="50" y2="15" />
            <line x1="50" y1="75" x2="50" y2="85" />
            <line x1="25" y1="50" x2="15" y2="50" />
            <line x1="75" y1="50" x2="85" y2="50" />
            <line x1="32" y1="32" x2="25" y2="25" />
            <line x1="68" y1="32" x2="75" y2="25" />
            <line x1="32" y1="68" x2="25" y2="75" />
            <line x1="68" y1="68" x2="75" y2="75" />
        </g>
    </g>
);

const PartlyCloudyIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g transform={`translate(${x - 17.5}, ${y - 17.5}) scale(0.35)`}>
        <path d="M67.5,57.5 A20,20 0 0,1 67.5,17.5 L52.5,17.5 A30,30 0 0,0 22.5,47.5 L62.5,47.5 A15,15 0 0,0 67.5,57.5Z" fill="#a0aec0" />
        <g transform="translate(-10, 5)">
            <circle cx="50" cy="50" r="15" fill="#f59e0b" />
            <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round">
                <line x1="50" y1="25" x2="50" y2="15" /> <line x1="75" y1="50" x2="85" y2="50" />
                <line x1="32" y1="32" x2="25" y2="25" /> <line x1="68" y1="32" x2="75" y2="25" />
            </g>
        </g>
    </g>
);

const CloudyIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
     <g transform={`translate(${x - 17.5}, ${y - 17.5}) scale(0.35)`}>
        <path d="M67.5,57.5 A20,20 0 0,1 67.5,17.5 L52.5,17.5 A30,30 0 0,0 22.5,47.5 L62.5,47.5 A15,15 0 0,0 67.5,57.5Z" fill="#a0aec0" />
    </g>
);

const WEATHER_FACTORS_MAP: Record<Exclude<WeatherCondition, 'Avanzado'>, number> = {
    'Soleado': 1.0,
    'Parcialmente Nublado': 0.6,
    'Nublado': 0.2,
};

export const SunPath: React.FC<SunPathProps> = ({ weather, weatherPoints }) => {
    
    const forecastHours = [6, 9, 12, 15, 18];
    
    const iconPositions = forecastHours.map(hour => {
        // Distribute icons on a horizontal line corresponding to the hours on the x-axis
        const progress = (hour - 6) / 12; // 0 for 6 AM, 1 for 6 PM
        const startX = 20; // Corresponds to ~6 AM
        const endX = 200;  // Corresponds to ~6 PM
        const x = startX + progress * (endX - startX);
        const y = 75;      // A constant Y for a horizontal line
        return { x, y };
    });

    const getWeatherIcon = (factor: number, x: number, y: number, key: number) => {
        if (factor > 0.8) return <SunnyIcon key={key} x={x} y={y} />;
        if (factor >= 0.5) return <PartlyCloudyIcon key={key} x={x} y={y} />;
        return <CloudyIcon key={key} x={x} y={y} />;
    };

    return (
        <div className="w-full max-w-md mx-auto aspect-[2/1] flex items-center justify-center">
            <svg viewBox="0 0 220 120" className="w-full h-full">
                {/* Horizon */}
                <line x1="0" y1="110" x2="220" y2="110" stroke="#4b5563" strokeWidth="2" />

                {/* Sun path arc */}
                <path
                    d="M 10 110 A 100 100 0 0 1 210 110"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                />

                {/* Sun at noon */}
                <circle cx="110" cy="10" r="10" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
                <g transform="translate(110, 10)" stroke="#f59e0b" strokeWidth="1.5">
                    <line x1="0" y1="-12" x2="0" y2="-16" /><line x1="0" y1="12" x2="0" y2="16" />
                    <line x1="-12" y1="0" x2="-16" y2="0" /><line x1="12" y1="0" x2="16" y2="0" />
                    <line x1="-9" y1="-9" x2="-12" y2="-12" /><line x1="9" y1="-9" x2="12" y2="-12" />
                    <line x1="-9" y1="9" x2="-12" y2="12" /><line x1="9" y1="9" x2="12" y2="12" />
                </g>

                {/* Weather Icons */}
                {weather === 'Avanzado' 
                    ? weatherPoints.map((point, index) => {
                        const { x, y } = iconPositions[index];
                        return getWeatherIcon(point, x, y, index);
                      })
                    : getWeatherIcon(WEATHER_FACTORS_MAP[weather], 110, 75, 0)
                }
                
                {/* Labels */}
                <text x="15" y="100" textAnchor="middle" fontSize="10" fill="#6b7280" className="font-sans">6 AM</text>
                <text x="110" y="5" textAnchor="middle" fontSize="10" fill="#6b7280" className="font-sans font-semibold">Mediodía</text>
                <text x="205" y="100" textAnchor="middle" fontSize="10" fill="#6b7280" className="font-sans">6 PM</text>
            </svg>
        </div>
    );
};
