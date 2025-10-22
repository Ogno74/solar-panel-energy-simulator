import React, { useMemo } from 'react';
import type { SimulationInput, BatterySettings, UserAppliance } from '../types';

interface FinancialAnalysisProps {
    inputs: SimulationInput;
    batterySettings: BatterySettings;
    userAppliances: UserAppliance[];
    isSolarSimulated: boolean;
}

const InfoMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl text-center shadow-md">
        <p className="text-lg font-semibold">Información Requerida</p>
        <p className="mt-2">{children}</p>
    </div>
);

const ComponentCard: React.FC<{
    title: string;
    description: string;
    price: string;
    amazonLink: string;
}> = ({ title, description, price, amazonLink }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2 mb-4 flex-grow">{description}</p>
        <div className="mt-auto">
             <p className="text-3xl font-extrabold text-gray-800 mb-4">{price}</p>
             <a
                href={amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
            >
                Buscar en Amazon
            </a>
        </div>
    </div>
);

export const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({ inputs, batterySettings, userAppliances, isSolarSimulated }) => {
    
    // 1. Panel Information
    const totalPanels = inputs.numPanelsA + inputs.numPanelsB;
    const panelPrice = (totalPanels * inputs.panelPower * 0.5).toFixed(0);
    const panelAmazonQuery = `solar panel ${inputs.panelPower}W`;
    const panelAmazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(panelAmazonQuery)}`;

    // 2. Battery Information
    const totalCapacityWh = useMemo(() => (batterySettings.capacityInputMode === 'wh'
        ? batterySettings.capacityWh * batterySettings.count
        : batterySettings.capacityAh * batterySettings.voltage * batterySettings.count), [batterySettings]);
    const totalCapacityKWh = totalCapacityWh / 1000;
    const batteryPrice = (totalCapacityKWh * 150).toFixed(0);
    const batteryAmazonQuery = `${batterySettings.type} battery ${batterySettings.voltage}V ${batterySettings.capacityAh}Ah deep cycle`;
    const batteryAmazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(batteryAmazonQuery)}`;

    // 3. Inverter Information
    const maxLoadPowerW = useMemo(() => {
        if (userAppliances.length === 0) return 0;
        const loadProfileW = Array(24).fill(0);
        userAppliances.forEach(app => {
            app.usage.forEach((isOn, hour) => {
                if (isOn) {
                    // Inverter must handle the peak power if all appliances for an hour turn on.
                    loadProfileW[hour] += app.power;
                }
            });
        });
        return Math.max(...loadProfileW);
    }, [userAppliances]);
    
    // Add 25% safety margin and round up to nearest 100W
    const inverterSizeW = Math.ceil((maxLoadPowerW * 1.25) / 100) * 100;
    const inverterPrice = (inverterSizeW * 0.4).toFixed(0);
    const inverterAmazonQuery = `solar power inverter pure sine wave ${inverterSizeW}W ${batterySettings.voltage}V`;
    const inverterAmazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(inverterAmazonQuery)}`;

    if (!isSolarSimulated || userAppliances.length === 0) {
        return (
            <div className="max-w-3xl mx-auto">
                 <InfoMessage>
                    Para estimar la inversión, por favor complete los siguientes pasos:
                    <ul className="list-disc list-inside text-left mt-3 inline-block">
                        {!isSolarSimulated && <li>Ejecute una <span className="font-semibold">Simulación Solar</span> para definir los paneles.</li>}
                        {userAppliances.length === 0 && <li>Añada electrodomésticos en <span className="font-semibold">Caracterización de la Carga</span> para dimensionar el inversor.</li>}
                        <li>Configure su <span className="font-semibold">Análisis de Baterías</span>.</li>
                    </ul>
                </InfoMessage>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Resumen de Componentes y Estimación de Inversión</h2>
                <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                    A continuación se presenta un resumen de los componentes principales del sistema fotovoltaico, con un costo estimado y enlaces de referencia. Los precios son aproximados y pueden variar.
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ComponentCard 
                    title="Paneles Solares"
                    description={`Cantidad: ${totalPanels} paneles de ${inputs.panelPower} W cada uno. Potencia total instalada de ${(totalPanels * inputs.panelPower / 1000).toFixed(2)} kWp.`}
                    price={`~$${panelPrice} USD`}
                    amazonLink={panelAmazonLink}
                />
                <ComponentCard 
                    title="Banco de Baterías"
                    description={`Cantidad: ${batterySettings.count} baterías de tipo ${batterySettings.type}. Capacidad total del banco de ${totalCapacityKWh.toFixed(2)} kWh.`}
                    price={`~$${batteryPrice} USD`}
                    amazonLink={batteryAmazonLink}
                />
                 <ComponentCard 
                    title="Inversor de Corriente"
                    description={`Capacidad recomendada: ${inverterSizeW} W. Dimensionado para cubrir una demanda máxima de ${maxLoadPowerW} W con un margen de seguridad.`}
                    price={`~$${inverterPrice} USD`}
                    amazonLink={inverterAmazonLink}
                />
            </div>
        </div>
    )
};