import React, { useState, useMemo } from 'react';
import type { UserAppliance } from '../types';
import { APPLIANCE_LIST } from '../data/appliances';
import { ApplianceScheduler } from './ApplianceScheduler';
import { LoadProfileChart } from './LoadProfileChart';

interface LoadCharacterizationProps {
    userAppliances: UserAppliance[];
    setUserAppliances: React.Dispatch<React.SetStateAction<UserAppliance[]>>;
}

export const LoadCharacterization: React.FC<LoadCharacterizationProps> = ({ userAppliances, setUserAppliances }) => {
    const [selectedAppliance, setSelectedAppliance] = useState<string>(APPLIANCE_LIST[0].name);

    const handleAddAppliance = () => {
        const applianceToAdd = APPLIANCE_LIST.find(app => app.name === selectedAppliance);
        if (applianceToAdd) {
            const newAppliance: UserAppliance = {
                id: Date.now(),
                name: applianceToAdd.name,
                power: applianceToAdd.power,
                minPower: applianceToAdd.minPower,
                maxPower: applianceToAdd.maxPower,
                usage: Array(24).fill(false),
                dutyCycle: 100,
                isCustom: applianceToAdd.name === 'Otro',
            };

            if (applianceToAdd.name === 'Refrigerador' || applianceToAdd.name === 'Router Wi-Fi') {
                newAppliance.usage = Array(24).fill(true);
            }

            setUserAppliances(prev => [...prev, newAppliance]);
        }
    };

    const handleUpdateAppliance = (id: number, updatedProperties: Partial<UserAppliance>) => {
        setUserAppliances(prev => 
            prev.map(app => (app.id === id ? { ...app, ...updatedProperties } : app))
        );
    };

    const handleRemoveAppliance = (id: number) => {
        setUserAppliances(prev => prev.filter(app => app.id !== id));
    };

    const totalKWh = useMemo(() => {
        const totalWattHours = userAppliances.reduce((total, app) => {
            const hoursOn = app.usage.filter(Boolean).length;
            // Energy = Power * Time. Time is hoursOn * (dutyCycle / 100)
            return total + (app.power * hoursOn * (app.dutyCycle / 100));
        }, 0);
        return totalWattHours / 1000;
    }, [userAppliances]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Añadir Electrodoméstico</h2>
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedAppliance}
                            onChange={(e) => setSelectedAppliance(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {APPLIANCE_LIST.map(app => <option key={app.name}>{app.name}</option>)}
                        </select>
                        <button
                            onClick={handleAddAppliance}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                            Añadir
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                     <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg text-center flex flex-col justify-center">
                        <p className="text-lg text-blue-800">Consumo Total Diario</p>
                        <p className="text-5xl font-extrabold text-blue-600 my-2">
                            {totalKWh.toFixed(2)}
                            <span className="text-3xl font-semibold ml-2">kWh</span>
                        </p>
                    </div>
                </div>

            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Perfil de Consumo Diario (Potencia Apilada)</h2>
                    {userAppliances.length > 0 ? (
                        <LoadProfileChart appliances={userAppliances} />
                    ) : (
                         <div className="h-96 flex items-center justify-center text-gray-500">
                            Añada electrodomésticos para ver el perfil de consumo.
                        </div>
                    )}
                </div>
                 <div className="space-y-4">
                    {userAppliances.map(app => (
                        <ApplianceScheduler
                            key={app.id}
                            appliance={app}
                            onUpdate={handleUpdateAppliance}
                            onRemove={handleRemoveAppliance}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};