import React from 'react';
import type { UserAppliance } from '../types';

interface ApplianceSchedulerProps {
    appliance: UserAppliance;
    onUpdate: (id: number, updatedProperties: Partial<UserAppliance>) => void;
    onRemove: (id: number) => void;
}

export const ApplianceScheduler: React.FC<ApplianceSchedulerProps> = ({ appliance, onUpdate, onRemove }) => {

    const handleHourClick = (hourIndex: number) => {
        const newUsage = [...appliance.usage];
        newUsage[hourIndex] = !newUsage[hourIndex];
        onUpdate(appliance.id, { usage: newUsage });
    };

    const PowerControl = () => (
        <div className="space-y-2 text-center md:text-left">
            <label htmlFor={`power-${appliance.id}`} className="block text-sm font-medium text-gray-700">Potencia</label>
            {appliance.isCustom ? (
                <input
                    type="number"
                    id={`power-${appliance.id}`}
                    value={appliance.power}
                    onChange={(e) => onUpdate(appliance.id, { power: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            ) : (
                <>
                    <input
                        type="range"
                        id={`power-${appliance.id}`}
                        min={appliance.minPower}
                        max={appliance.maxPower}
                        step={1}
                        value={appliance.power}
                        onChange={(e) => onUpdate(appliance.id, { power: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="font-mono text-sm text-gray-800">{appliance.power} W</span>
                </>
            )}
        </div>
    );

    const DutyCycleControl = () => (
        <div className="space-y-2 text-center md:text-left">
             <label htmlFor={`duty-${appliance.id}`} className="block text-sm font-medium text-gray-700">Uso / Hora</label>
             <input
                type="range"
                id={`duty-${appliance.id}`}
                min={1}
                max={100}
                step={1}
                value={appliance.dutyCycle}
                onChange={(e) => onUpdate(appliance.id, { dutyCycle: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <span className="font-mono text-sm text-gray-800">{appliance.dutyCycle}%</span>
        </div>
    );


    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                {appliance.isCustom ? (
                    <input
                        type="text"
                        value={appliance.name}
                        onChange={(e) => onUpdate(appliance.id, { name: e.target.value })}
                        className="font-semibold text-gray-800 text-lg border-b-2 border-gray-200 focus:border-blue-500 outline-none"
                    />
                ) : (
                    <h3 className="font-semibold text-lg text-gray-800">{appliance.name}</h3>
                )}
                <button
                    onClick={() => onRemove(appliance.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-semibold"
                >
                    Eliminar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[25%_1fr_25%] gap-4 items-center">
                {/* Left: Power Control */}
                <PowerControl />

                {/* Center: Hour Grid */}
                <div className="w-full">
                    <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
                        {appliance.usage.map((isOn, index) => (
                            <button
                                key={index}
                                onClick={() => handleHourClick(index)}
                                className={`h-10 w-full rounded text-xs transition-colors ${
                                    isOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                                title={`${index}:00 - ${index + 1}:00`}
                                aria-label={`Toggle usage for ${appliance.name} at ${index}:00`}
                            >
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                        <span>0h</span>
                        <span>6h</span>
                        <span>12h</span>
                        <span>18h</span>
                        <span>23h</span>
                    </div>
                </div>

                {/* Right: Duty Cycle Control */}
                <DutyCycleControl />
            </div>
        </div>
    );
};