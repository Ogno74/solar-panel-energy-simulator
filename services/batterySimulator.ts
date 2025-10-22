import type { SimulationResult, UserAppliance, BatterySettings, BatteryAnalysisResult, BatteryChartDataPoint } from '../types';

export const runBatterySimulation = (
    solarResults: SimulationResult,
    userAppliances: UserAppliance[],
    batterySettings: BatterySettings
): BatteryAnalysisResult => {

    // 1. Calculate total battery capacity in Wh
    const totalCapacityWh = batterySettings.capacityInputMode === 'wh'
        ? batterySettings.capacityWh * batterySettings.count
        : batterySettings.capacityAh * batterySettings.voltage * batterySettings.count;

    // 2. Create a 24-hour load profile (average power per hour in W)
    const loadProfileW = Array(24).fill(0);
    userAppliances.forEach(app => {
        app.usage.forEach((isOn, hour) => {
            if (isOn) {
                const avgPower = app.power * (app.dutyCycle / 100);
                loadProfileW[hour] += avgPower;
            }
        });
    });

    // 3. Create a 24-hour solar generation profile (average power per hour in W)
    const solarGenerationW = Array(24).fill(0);
    const hourlySolarData: { [hour: number]: { totalPower: number, count: number } } = {};

    solarResults.powerData.forEach(dp => {
        const hour = Math.floor(dp.hour);
        if (hour >= 0 && hour < 24) {
            if (!hourlySolarData[hour]) {
                hourlySolarData[hour] = { totalPower: 0, count: 0 };
            }
            hourlySolarData[hour].totalPower += dp.power1 + dp.power2;
            hourlySolarData[hour].count++;
        }
    });

    for (const hour in hourlySolarData) {
        if (Object.prototype.hasOwnProperty.call(hourlySolarData, hour)) {
            const hourIndex = parseInt(hour, 10);
            if(hourlySolarData[hourIndex].count > 0) {
                 solarGenerationW[hourIndex] = hourlySolarData[hourIndex].totalPower / hourlySolarData[hourIndex].count;
            }
        }
    }


    // 4. Run the 24-hour simulation starting from 6 AM
    const initialEnergyWh = totalCapacityWh * (batterySettings.initialChargePercent / 100);
    let currentEnergyWh = initialEnergyWh;
    const chartData: BatteryChartDataPoint[] = [];

    // Define the sequence of hours from 6 AM on day 1 to 5 AM on day 2
    const simulationHours = [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        0, 1, 2, 3, 4, 5
    ];

    simulationHours.forEach(hour => {
        const generation = solarGenerationW[hour] || 0;
        const load = loadProfileW[hour] || 0;
        const netPower = generation - load;

        // Energy delta for one hour (Power * 1h)
        const energyDeltaWh = netPower;

        const potentialEnergyWh = currentEnergyWh + energyDeltaWh;

        if (potentialEnergyWh < 0) {
            // Battery is depleted
            currentEnergyWh = 0;
        } else if (potentialEnergyWh > totalCapacityWh) {
            // Battery is full, excess energy is clipped (lost)
            currentEnergyWh = totalCapacityWh;
        } else {
            // Normal charge/discharge
            currentEnergyWh = potentialEnergyWh;
        }

        chartData.push({
            hour: hour,
            timeLabel: `${hour.toString().padStart(2, '0')}:00`,
            storedEnergy: parseFloat((currentEnergyWh / 1000).toFixed(3)), // store in kWh
            solarGeneration: parseFloat(generation.toFixed(2)),
            loadConsumption: parseFloat(load.toFixed(2)),
        });
    });

    const energyBalanceWh = currentEnergyWh - initialEnergyWh;

    return {
        chartData,
        energyBalance: energyBalanceWh / 1000, // convert to kWh
    };
};