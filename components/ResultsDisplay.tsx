import React from 'react';
import type { SimulationInput } from '../types';

interface ResultsDisplayProps {
    energy: number;
    inputs: SimulationInput;
}

const InfoCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ energy, inputs }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados de la Simulación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-blue-50 border-2 border-blue-200 p-6 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-lg text-blue-800">Energía Total Generada</p>
                    <p className="text-5xl font-extrabold text-blue-600 my-2">
                        {energy.toFixed(2)}
                        <span className="text-3xl font-semibold ml-2">kWh</span>
                    </p>
                    <p className="text-sm text-blue-700">para el día seleccionado</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <InfoCard title="Latitud" value={`${inputs.latitude.toFixed(2)}°`} />
                    <InfoCard title="Longitud" value={`${inputs.longitude.toFixed(2)}°`} />
                    <InfoCard title="Paneles Frontales" value={`${inputs.numPanelsA}`} />
                    <InfoCard title="Paneles Traseros" value={`${inputs.numPanelsB}`} />
                    <InfoCard title="Ángulo Panel Frontal" value={`${inputs.angleA}°`} />
                    <InfoCard title="Ángulo Panel Trasero" value={`${inputs.angleB}°`} />
                    <InfoCard title="Azimut" value={`${inputs.azimuth}°`} />
                    <InfoCard title="Potencia del Panel" value={`${inputs.panelPower} W`} />
                </div>
            </div>
        </div>
    );
};