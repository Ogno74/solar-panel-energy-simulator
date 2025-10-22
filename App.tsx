
import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { PowerChart } from './components/PowerChart';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LocationVisuals } from './components/LocationVisuals';
import { LoadCharacterization } from './components/LoadCharacterization';
import { BatteryAnalysis } from './components/BatteryAnalysis';
import { FinancialAnalysis } from './components/FinancialAnalysis';
import { calculateSolarData } from './services/solarCalculator';
import { runBatterySimulation } from './services/batterySimulator';
import type { SimulationInput, SimulationResult, UserAppliance, BatterySettings, BatteryAnalysisResult } from './types';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.225 4.225a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM15.06 15.06a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM17 10a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.636 15.06a1 1 0 011.414 0l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.94 5.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" />
    </svg>
);

type Tab = 'simulation' | 'load' | 'battery' | 'financial';

function App() {
    const [inputs, setInputs] = useState<SimulationInput>({
        angleA: 30,
        angleB: 30,
        panelPower: 400,
        latitude: -2.9, // Default to Cuenca, Ecuador
        longitude: -79.0,
        date: new Date().toISOString().split('T')[0], // Default to today
        weather: 'Soleado',
        azimuth: 180, // Default to South-facing
        numPanelsA: 1,
        numPanelsB: 1,
        weatherPoints: [0.8, 0.7, 0.9, 1.0, 0.6], // Default points for Advanced weather
    });
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('simulation');
    const [userAppliances, setUserAppliances] = useState<UserAppliance[]>([]);
    const [batterySettings, setBatterySettings] = useState<BatterySettings>({
        type: 'Litio-ion',
        count: 1,
        capacityInputMode: 'ahv',
        capacityAh: 100,
        voltage: 48,
        capacityWh: 5000,
        initialChargePercent: 30,
    });
    const [batteryAnalysisResult, setBatteryAnalysisResult] = useState<BatteryAnalysisResult | null>(null);


    const handleSolarSimulation = useCallback(() => {
        const simulationResults = calculateSolarData(inputs);
        setResults(simulationResults);
    }, [inputs]);

    const handleBatterySimulation = useCallback(() => {
        if (results) {
            const analysis = runBatterySimulation(results, userAppliances, batterySettings);
            setBatteryAnalysisResult(analysis);
        } else {
            // Optionally, alert the user or handle this case
            alert("Por favor, ejecute primero una simulación solar.");
        }
    }, [results, userAppliances, batterySettings]);
    
    const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tabName
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4">
                        <SunIcon />
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
                            Simulador de Energía Solar
                        </h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                       Herramienta integral para analizar la generación solar y el consumo energético.
                    </p>
                </header>

                <div className="mb-6 flex justify-center space-x-2 p-1 bg-gray-100 rounded-lg">
                    <TabButton tabName="simulation" label="Simulación Solar" />
                    <TabButton tabName="load" label="Caracterización de la Carga" />
                    <TabButton tabName="battery" label="Análisis de Baterías" />
                    <TabButton tabName="financial" label="Inversión Financiera" />
                </div>

                <main>
                    {activeTab === 'simulation' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <InputForm inputs={inputs} setInputs={setInputs} onSubmit={handleSolarSimulation} />
                            </div>

                            <div className="lg:col-span-2">
                                {results ? (
                                    <div className="space-y-8">
                                        <LocationVisuals 
                                            latitude={inputs.latitude} 
                                            longitude={inputs.longitude} 
                                            weather={inputs.weather}
                                            weatherPoints={inputs.weatherPoints}
                                            onCoordsChange={(lat, lon) => setInputs(p => ({...p, latitude: lat, longitude: lon}))}
                                        />
                                        <ResultsDisplay energy={results.totalEnergy} inputs={inputs} />
                                        <PowerChart data={results.powerData} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-8 h-full border border-gray-200">
                                        <SunIcon />
                                        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Esperando Simulación</h2>
                                        <p className="mt-2 text-gray-500 text-center">
                                            Por favor, ingrese los parámetros de su panel y haga clic en "Ejecutar Simulación" para ver los resultados.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'load' && (
                       <LoadCharacterization
                           userAppliances={userAppliances}
                           setUserAppliances={setUserAppliances}
                       />
                    )}
                    {activeTab === 'battery' && (
                        <BatteryAnalysis
                            settings={batterySettings}
                            setSettings={setBatterySettings}
                            results={batteryAnalysisResult}
                            onRunSimulation={handleBatterySimulation}
                            isSolarSimulated={!!results}
                            isLoadCharacterized={userAppliances.length > 0}
                        />
                    )}
                     {activeTab === 'financial' && (
                        <FinancialAnalysis
                            inputs={inputs}
                            batterySettings={batterySettings}
                            userAppliances={userAppliances}
                            isSolarSimulated={!!results}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
