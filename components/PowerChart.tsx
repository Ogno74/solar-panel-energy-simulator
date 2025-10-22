
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PowerDataPoint } from '../types';

interface PowerChartProps {
    data: PowerDataPoint[];
}

export const PowerChart: React.FC<PowerChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Generación de Potencia Instantánea (6 AM a 6 PM)</h3>
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="time" tick={{ fill: '#4b5563' }} />
                        <YAxis unit=" W" tick={{ fill: '#4b5563' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Area 
                            type="monotone" 
                            dataKey="power1" 
                            stackId="1" 
                            stroke="#3b82f6" 
                            fill="#60a5fa" 
                            name="Potencia Panel Frontal" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="power2" 
                            stackId="1" 
                            stroke="#f59e0b" 
                            fill="#fcd34d" 
                            name="Potencia Panel Trasero" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};