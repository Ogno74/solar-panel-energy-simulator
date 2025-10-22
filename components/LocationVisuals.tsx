
import React from 'react';
import { SunPath } from './SunPath';
import { WorldMap } from './WorldMap';
import type { WeatherCondition } from '../types';

interface LocationVisualsProps {
    latitude: number;
    longitude: number;
    weather: WeatherCondition;
    weatherPoints: number[];
    onCoordsChange: (latitude: number, longitude: number) => void;
}

export const LocationVisuals: React.FC<LocationVisualsProps> = ({ latitude, longitude, weather, weatherPoints, onCoordsChange }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Ubicación en el Globo</h3>
                    <WorldMap latitude={latitude} longitude={longitude} onCoordsChange={onCoordsChange} />
                </div>
                <div>
                     <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Trayectoria Solar Simplificada</h3>
                    <SunPath weather={weather} weatherPoints={weatherPoints} />
                </div>
            </div>
        </div>
    );
};
