import React, { useState } from 'react';
import type { SimulationInput, WeatherCondition } from '../types';
import { PanelOrientation } from './PanelOrientation';
import { LocationInput } from './LocationInput';
import { Compass } from './Compass';
import { WeatherEqualizer } from './WeatherEqualizer';
import { fetchWeatherForecast } from '../services/weatherService';

interface InputFormProps {
    inputs: SimulationInput;
    setInputs: React.Dispatch<React.SetStateAction<SimulationInput>>;
    onSubmit: () => void;
}

const SliderField: React.FC<{ label: string; id: keyof SimulationInput; value: number; unit: string; min: number; max: number; step: number; onChange: (id: keyof SimulationInput, value: number) => void; }> = ({ label, id, value, unit, min, max, step, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center">
            <input
                type="range"
                id={id}
                name={id}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(id, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="ml-4 text-right w-24 font-mono text-gray-800">{value}{unit}</span>
        </div>
    </div>
);

const NumberField: React.FC<{ label: string; id: keyof SimulationInput; value: number; min: number; onChange: (id: keyof SimulationInput, value: number) => void; }> = ({ label, id, value, min, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="number"
            id={id}
            name={id}
            value={value}
            min={min}
            step={1}
            onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= min) {
                    onChange(id, val);
                }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
    </div>
);


export const InputForm: React.FC<InputFormProps> = ({ inputs, setInputs, onSubmit }) => {
    const [forecastStatus, setForecastStatus] = useState<'idle' | 'loading' | 'error'>('idle');

    const handleInputChange = (id: keyof SimulationInput, value: any) => {
        setInputs(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const handleFetchForecast = async () => {
        setForecastStatus('loading');
        try {
            const forecastPoints = await fetchWeatherForecast(inputs.latitude, inputs.longitude, inputs.date);
            handleInputChange('weatherPoints', forecastPoints);
            setForecastStatus('idle');
        } catch (error) {
            console.error("Failed to fetch weather forecast:", error);
            setForecastStatus('error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Configuración</h2>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-6 flex-grow overflow-y-auto pr-2">
                    {/* Geographic & Date Inputs */}
                    <LocationInput
                        latitude={inputs.latitude}
                        longitude={inputs.longitude}
                        onCoordsChange={(lat, lon) => setInputs(p => ({...p, latitude: lat, longitude: lon}))}
                    />
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={inputs.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="weather" className="block text-sm font-medium text-gray-700">Condición Climática</label>
                        <select
                            id="weather"
                            name="weather"
                            value={inputs.weather}
                            onChange={(e) => handleInputChange('weather', e.target.value as WeatherCondition)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option>Soleado</option>
                            <option>Parcialmente Nublado</option>
                            <option>Nublado</option>
                            <option>Avanzado</option>
                        </select>
                        {inputs.weather === 'Avanzado' && (
                            <WeatherEqualizer 
                                points={inputs.weatherPoints}
                                onPointsChange={(newPoints) => handleInputChange('weatherPoints', newPoints)}
                                onFetchForecast={handleFetchForecast}
                                forecastStatus={forecastStatus}
                            />
                        )}
                    </div>

                    <hr className="my-4 border-gray-200" />
                    
                    {/* Panel Orientation */}
                    <Compass
                        azimuth={inputs.azimuth}
                        onAzimuthChange={(az) => handleInputChange('azimuth', az)}
                    />
                    
                    <hr className="my-4 border-gray-200" />
                    
                    {/* Panel Inputs */}
                     <div className="grid grid-cols-2 gap-4">
                        <NumberField
                            label="Nº de Paneles Frontales"
                            id="numPanelsA"
                            value={inputs.numPanelsA}
                            onChange={handleInputChange}
                            min={1}
                        />
                         <NumberField
                            label="Nº de Paneles Traseros"
                            id="numPanelsB"
                            value={inputs.numPanelsB}
                            onChange={handleInputChange}
                            min={0}
                        />
                    </div>
                    <div>
                        <SliderField 
                            label="Inclinación Panel Frontal (Ángulo a)"
                            id="angleA"
                            value={inputs.angleA}
                            unit="°"
                            min={0}
                            max={90}
                            step={1}
                            onChange={handleInputChange}
                        />
                        <PanelOrientation angle={inputs.angleA} panelLabel="a" />
                    </div>
                    <div>
                        <SliderField 
                            label="Inclinación Panel Trasero (Ángulo b)"
                            id="angleB"
                            value={inputs.angleB}
                            unit="°"
                            min={0}
                            max={90}
                            step={1}
                            onChange={handleInputChange}
                        />
                         <PanelOrientation angle={inputs.angleB} panelLabel="b" />
                    </div>
                    <SliderField 
                        label="Potencia Declarada del Panel"
                        id="panelPower"
                        value={inputs.panelPower}
                        unit=" W"
                        min={100}
                        max={1000}
                        step={10}
                        onChange={handleInputChange}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 shadow-md"
                >
                    Ejecutar Simulación
                </button>
            </form>
        </div>
    );
};