import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface WeatherEqualizerProps {
    points: number[];
    onPointsChange: (newPoints: number[]) => void;
    onFetchForecast: () => void;
    forecastStatus: 'idle' | 'loading' | 'error';
}

const HOURS = [6, 9, 12, 15, 18];
const MIN_FACTOR = 0.2;
const MAX_FACTOR = 1.0;

export const WeatherEqualizer: React.FC<WeatherEqualizerProps> = ({ points, onPointsChange, onFetchForecast, forecastStatus }) => {

    const handlePointChange = (index: number, value: number) => {
        const newPoints = [...points];
        newPoints[index] = value;
        onPointsChange(newPoints);
    };

    const data = HOURS.map((hour, index) => ({
        hour,
        factor: points[index],
        name: `${hour}:00`,
    }));

    const buttonText = {
        idle: 'Obtener Pronóstico',
        loading: 'Cargando...',
        error: 'Reintentar Pronóstico'
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Perfil Climático Avanzado</h4>
                <button
                    type="button"
                    onClick={onFetchForecast}
                    disabled={forecastStatus === 'loading'}
                    className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait"
                >
                    {buttonText[forecastStatus]}
                </button>
            </div>
            {forecastStatus === 'error' && (
                <p className="text-xs text-red-600 mb-2 text-right">Error al obtener el pronóstico.</p>
            )}
            
            <div className="h-48 mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" type="category" domain={['dataMin', 'dataMax']} ticks={data.map(d => d.name)} />
                        <YAxis type="number" domain={[MIN_FACTOR, MAX_FACTOR]} ticks={[0.2, 0.4, 0.6, 0.8, 1.0]} />
                        <Tooltip formatter={(value) => (value as number).toFixed(2)} />
                        <ReferenceLine y={MAX_FACTOR} label={{ value: "Despejado", position: 'insideTopLeft', fill: '#16a34a', fontSize: 12 }} stroke="#16a34a" strokeDasharray="2 2" />
                        <ReferenceLine y={MIN_FACTOR} label={{ value: "Muy Nublado", position: 'insideBottomLeft', fill: '#3b82f6', fontSize: 12 }} stroke="#3b82f6" strokeDasharray="2 2" />
                        <Line type="monotone" dataKey="factor" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3">
                {HOURS.map((hour, index) => (
                    <div key={hour} className="grid grid-cols-4 items-center gap-2">
                        <label htmlFor={`slider-${hour}`} className="text-sm text-gray-600 col-span-1">
                            {hour}:00
                        </label>
                        <input
                            type="range"
                            id={`slider-${hour}`}
                            min={MIN_FACTOR}
                            max={MAX_FACTOR}
                            step={0.05}
                            value={points[index]}
                            onChange={(e) => handlePointChange(index, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500 col-span-2"
                        />
                        <span className="font-mono text-sm text-right text-gray-800 col-span-1">
                            {points[index].toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};