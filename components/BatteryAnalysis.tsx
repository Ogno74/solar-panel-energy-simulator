import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Line } from 'recharts';
import type { BatterySettings, BatteryAnalysisResult, BatteryType, CapacityInputMode } from '../types';

interface BatteryAnalysisProps {
    settings: BatterySettings;
    setSettings: React.Dispatch<React.SetStateAction<BatterySettings>>;
    results: BatteryAnalysisResult | null;
    onRunSimulation: () => void;
    isSolarSimulated: boolean;
    isLoadCharacterized: boolean;
}

const InfoMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg text-center">
        {children}
    </div>
);

export const BatteryAnalysis: React.FC<BatteryAnalysisProps> = ({
    settings,
    setSettings,
    results,
    onRunSimulation,
    isSolarSimulated,
    isLoadCharacterized
}) => {
    const handleSettingChange = (field: keyof BatterySettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const totalCapacityKWh = (settings.capacityInputMode === 'wh'
        ? settings.capacityWh * settings.count
        : settings.capacityAh * settings.voltage * settings.count) / 1000;

    const canRunSimulation = isSolarSimulated && isLoadCharacterized;
    
    const renderResults = () => {
        if (!results) return null;

        const { energyBalance } = results;
        const isNegative = energyBalance < 0;
        
        let balanceText = 'Excedente energético al final del día';
        if (isNegative) {
            balanceText = 'Déficit respecto al estado inicial';
        } else if (energyBalance === 0) {
            balanceText = 'El sistema se mantuvo en equilibrio';
        }

        return (
             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className={`p-6 rounded-lg text-center flex flex-col justify-center ${isNegative ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                    <p className={`text-lg ${isNegative ? 'text-red-800' : 'text-green-800'}`}>Balance Energético del Sistema</p>
                    <p className={`text-5xl font-extrabold my-2 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                        {energyBalance > 0 ? '+' : ''}{energyBalance.toFixed(2)}
                        <span className="text-3xl font-semibold ml-2">kWh</span>
                    </p>
                     <p className={`text-sm ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
                        {balanceText}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Configuration & Results */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Configuración del Banco de Baterías</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="battery-type" className="block text-sm font-medium text-gray-700">Tipo de Batería</label>
                            <select
                                id="battery-type"
                                value={settings.type}
                                onChange={e => handleSettingChange('type', e.target.value as BatteryType)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option>Litio-ion</option>
                                <option>Plomo-ácido</option>
                                <option>Níquel-cadmio</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="battery-count" className="block text-sm font-medium text-gray-700">Cantidad de Baterías</label>
                            <input
                                type="number"
                                id="battery-count"
                                value={settings.count}
                                min="1"
                                onChange={e => handleSettingChange('count', parseInt(e.target.value, 10) || 1)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="initial-charge" className="block text-sm font-medium text-gray-700">Carga Inicial de Baterías</label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    id="initial-charge"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={settings.initialChargePercent}
                                    onChange={e => handleSettingChange('initialChargePercent', parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                />
                                <span className="ml-4 text-right w-16 font-mono text-gray-800">{settings.initialChargePercent}%</span>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad por Batería</label>
                            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-md">
                                <button onClick={() => handleSettingChange('capacityInputMode', 'ahv')} className={`w-full py-1 rounded text-sm ${settings.capacityInputMode === 'ahv' ? 'bg-white shadow' : ''}`}>Ah & V</button>
                                <button onClick={() => handleSettingChange('capacityInputMode', 'wh')} className={`w-full py-1 rounded text-sm ${settings.capacityInputMode === 'wh' ? 'bg-white shadow' : ''}`}>Wh</button>
                            </div>
                        </div>

                        {settings.capacityInputMode === 'ahv' ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="capacity-ah" className="block text-xs text-gray-600">Capacidad (Ah)</label>
                                    <input type="number" id="capacity-ah" value={settings.capacityAh} min="1" onChange={e => handleSettingChange('capacityAh', parseInt(e.target.value) || 0)} className="mt-1 block w-full px-2 py-1 border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="voltage" className="block text-xs text-gray-600">Voltaje (V)</label>
                                    <input type="number" id="voltage" value={settings.voltage} min="1" onChange={e => handleSettingChange('voltage', parseInt(e.target.value) || 0)} className="mt-1 block w-full px-2 py-1 border-gray-300 rounded-md"/>
                                </div>
                            </div>
                        ) : (
                             <div>
                                <label htmlFor="capacity-wh" className="block text-xs text-gray-600">Capacidad (Wh)</label>
                                <input type="number" id="capacity-wh" value={settings.capacityWh} min="1" onChange={e => handleSettingChange('capacityWh', parseInt(e.target.value) || 0)} className="mt-1 block w-full px-2 py-1 border-gray-300 rounded-md"/>
                            </div>
                        )}
                         <button
                            onClick={onRunSimulation}
                            disabled={!canRunSimulation}
                            className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Simular Batería
                        </button>
                    </div>
                </div>
                 
                 {renderResults()}
            </div>

            {/* Column 2: Chart & Messages */}
            <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Flujo de Energía del Sistema (24h)</h2>
                     {!canRunSimulation ? (
                        <div className="h-[28rem] flex items-center justify-center">
                            <InfoMessage>
                                Por favor, primero <span className="font-semibold">ejecute una Simulación Solar</span> y <span className="font-semibold">añada electrodomésticos</span> en la pestaña de Carga.
                            </InfoMessage>
                        </div>
                    ) : !results ? (
                        <div className="h-[28rem] flex items-center justify-center text-gray-500">
                            Configure su banco de baterías y presione "Simular Batería" para ver los resultados.
                        </div>
                    ) : (
                        <div className="w-full h-[28rem]">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={results.chartData}
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeLabel" />
                                    <YAxis yAxisId="left" unit=" kWh" domain={[0, 'dataMax']} />
                                    <YAxis yAxisId="right" orientation="right" unit=" W" />
                                    <Tooltip formatter={(value: number, name: string) => {
                                        if (name === 'Energía Almacenada') return [`${value.toFixed(2)} kWh`, name];
                                        return [`${value.toFixed(0)} W`, name];
                                    }} />
                                    <Legend />
                                    <ReferenceLine y={totalCapacityKWh} yAxisId="left" label={{ value: `Capacidad Máx (${totalCapacityKWh.toFixed(2)} kWh)`, position: 'insideTop' }} stroke="red" strokeDasharray="3 3" />
                                    <Area yAxisId="left" type="monotone" dataKey="storedEnergy" stroke="#8884d8" fill="#8884d8" name="Energía Almacenada" />
                                    <Line yAxisId="right" type="monotone" dataKey="solarGeneration" stroke="#f59e0b" name="Generación Solar" dot={false} strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="loadConsumption" stroke="#ef4444" name="Consumo Carga" dot={false} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};