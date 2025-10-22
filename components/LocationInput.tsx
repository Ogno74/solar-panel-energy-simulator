import React, { useState } from 'react';

interface LocationInputProps {
    latitude: number;
    longitude: number;
    onCoordsChange: (latitude: number, longitude: number) => void;
}

const NumberField: React.FC<{ label: string; id: 'latitude' | 'longitude'; value: number; unit: string; min: number; max: number; step: number; onChange: (id: 'latitude' | 'longitude', value: number) => void; }> = ({ label, id, value, unit, min, max, step, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center">
            <input
                type="number"
                id={id}
                name={id}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <span className="ml-2 text-gray-500">{unit}</span>
        </div>
    </div>
);

const CITIES: Record<string, { lat: number, lon: number }> = {
    'cuenca, ecuador': { lat: -2.9, lon: -79.0 },
    'los angeles, usa': { lat: 34.05, lon: -118.25 },
    'new york, usa': { lat: 40.71, lon: -74.00 },
    'london, uk': { lat: 51.50, lon: -0.12 },
    'paris, france': { lat: 48.85, lon: 2.35 },
    'madrid, spain': { lat: 40.41, lon: -3.70 },
    'tokyo, japan': { lat: 35.68, lon: 139.69 },
    'sydney, australia': { lat: -33.86, lon: 151.20 },
    'cairo, egypt': { lat: 30.04, lon: 31.23 },
};


export const LocationInput: React.FC<LocationInputProps> = ({ latitude, longitude, onCoordsChange }) => {
    const [inputType, setInputType] = useState<'city' | 'coords'>('city');
    const [city, setCity] = useState('Cuenca, Ecuador');
    const [error, setError] = useState('');

    const handleLookup = () => {
        const location = CITIES[city.toLowerCase().trim()];
        if (location) {
            onCoordsChange(location.lat, location.lon);
            setError('');
        } else {
            setError('Ciudad no encontrada. Pruebe "Ciudad, País" o coordenadas manuales.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <button
                    type="button"
                    onClick={() => setInputType(p => p === 'city' ? 'coords' : 'city')}
                    className="text-xs text-blue-600 hover:underline"
                >
                    {inputType === 'city' ? 'Usar Lat/Lon' : 'Buscar Ciudad'}
                </button>
            </div>

            {inputType === 'city' ? (
                <div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="e.g., Madrid, Spain"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleLookup}
                            className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-md hover:bg-blue-200"
                        >
                            Buscar
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                </div>

            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                        label="Latitud"
                        id="latitude"
                        value={latitude}
                        unit="°"
                        min={-90}
                        max={90}
                        step={0.01}
                        onChange={(id, val) => onCoordsChange(val, longitude)}
                    />
                    <NumberField
                        label="Longitud"
                        id="longitude"
                        value={longitude}
                        unit="°"
min={-180}
                        max={180}
                        step={0.01}
                        onChange={(id, val) => onCoordsChange(latitude, val)}
                    />
                </div>
            )}
        </div>
    );
};