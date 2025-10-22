import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserAppliance } from '../types';

interface LoadProfileChartProps {
    appliances: UserAppliance[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const LoadProfileChart: React.FC<LoadProfileChartProps> = ({ appliances }) => {
    
    const chartData = useMemo(() => {
        const data = Array.from({ length: 24 }, (_, i) => ({
            name: `${i.toString().padStart(2, '0')}:00`,
        }));

        appliances.forEach(appliance => {
            appliance.usage.forEach((isOn, hour) => {
                if (isOn) {
                    // The power shown on the chart is the average power for that hour,
                    // which is the appliance's power adjusted by its duty cycle.
                    const averagePower = appliance.power * (appliance.dutyCycle / 100);
                    const key = `${appliance.name} (${appliance.id})`; // Use a unique key
                    data[hour][key] = (data[hour][key] || 0) + averagePower;
                }
            });
        });

        return data;
    }, [appliances]);

    const applianceKeys = useMemo(() => 
        // FIX: Changed `appliance.id` to `app.id` to use the correct variable from the map function.
        appliances.map(app => `${app.name} (${app.id})`),
    [appliances]);
    
    const uniqueApplianceNames = useMemo(() => 
        [...new Set(appliances.map(app => app.name))],
    [appliances]);


    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis unit=" W" tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem'
                        }}
                        // FIX: Added type conversions to handle recharts' broad `ValueType` and `NameType`.
                        // `Number(value)` handles potential string values, and `String(name)` handles potential number names.
                        formatter={(value, name) => [Number(value).toFixed(0) + ' W', String(name).split(' (')[0]]}
                    />
                    <Legend formatter={(value) => value.split(' (')[0]} />
                    {uniqueApplianceNames.map((name, index) => {
                         const matchingAppliances = appliances.filter(app => app.name === name);
                         return matchingAppliances.map(app => (
                             <Bar 
                                key={app.id}
                                dataKey={`${app.name} (${app.id})`}
                                name={app.name}
                                stackId="a"
                                fill={COLORS[index % COLORS.length]}
                             />
                         ));
                    })}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};