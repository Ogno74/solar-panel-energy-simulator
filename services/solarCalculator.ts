import type { SimulationInput, PowerDataPoint, SimulationResult, WeatherCondition } from '../types';
import { getInterpolatedWeatherFactor } from './interpolation';

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

const WEATHER_FACTORS: Record<Exclude<WeatherCondition, 'Avanzado'>, number> = {
    'Soleado': 1.0,
    'Parcialmente Nublado': 0.6,
    'Nublado': 0.2,
};

export const calculateSolarData = (inputs: SimulationInput): SimulationResult => {
    const { angleA, angleB, panelPower, latitude, longitude, date, weather, azimuth, numPanelsA, numPanelsB, weatherPoints } = inputs;

    const powerData: PowerDataPoint[] = [];
    let totalEnergyWattHours = 0;

    const latRad = toRadians(latitude);
    const panelTilt1Rad = toRadians(angleA);
    const panelTilt2Rad = toRadians(angleB);
    
    // Panel A (Front) uses the azimuth directly.
    // Panel B (Back) is counter-posed, facing the opposite direction.
    const panelAzimuth1Rad = toRadians(azimuth);
    const panelAzimuth2Rad = toRadians((azimuth + 180) % 360);

    // --- Solar Position Calculations ---
    const dateObj = new Date(date + 'T12:00:00Z'); // Use noon UTC to avoid timezone issues
    const startOfYear = new Date(dateObj.getFullYear(), 0, 0);
    const diff = dateObj.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const solarDeclinationRad = toRadians(23.45 * Math.sin(toRadians((360 / 365) * (dayOfYear - 81)) ));

    // Calculate sunrise/sunset to determine the simulation time range
    const cosHourAngleSunrise = -Math.tan(latRad) * Math.tan(solarDeclinationRad);
    const clampedCos = Math.max(-1, Math.min(1, cosHourAngleSunrise));
    const hourAngleSunriseRad = Math.acos(clampedCos);
    
    const sunriseHour = 12 - toDegrees(hourAngleSunriseRad) / 15;
    const sunsetHour = 12 + toDegrees(hourAngleSunriseRad) / 15;
    
    const timeStepHours = 0.25; // 15-minute intervals
    
    for (let localHour = sunriseHour; localHour <= sunsetHour; localHour += timeStepHours) {
        const weatherFactor = weather === 'Avanzado'
            ? getInterpolatedWeatherFactor(localHour, weatherPoints)
            : WEATHER_FACTORS[weather as Exclude<WeatherCondition, 'Avanzado'>];

        const hourAngleRad = toRadians((localHour - 12) * 15);
        
        // Solar Altitude (Elevation)
        const sinAltitude = Math.sin(latRad) * Math.sin(solarDeclinationRad) + Math.cos(latRad) * Math.cos(solarDeclinationRad) * Math.cos(hourAngleRad);
        const solarAltitudeRad = Math.asin(Math.max(0, sinAltitude));

        let power1 = 0;
        let power2 = 0;

        if (solarAltitudeRad > 0) { // If sun is above the horizon
            // Solar Azimuth (using a stable formula: 0° is North, 180° is South)
            const sinAzimuth = -Math.sin(hourAngleRad) * Math.cos(solarDeclinationRad) / Math.cos(solarAltitudeRad);
            const cosAzimuth = (Math.sin(solarAltitudeRad) * Math.sin(latRad) - Math.sin(solarDeclinationRad)) / (Math.cos(solarAltitudeRad) * Math.cos(latRad));
            const solarAzimuthRad = Math.atan2(sinAzimuth, cosAzimuth) + Math.PI;

            // Angle of Incidence calculation (how directly the sun hits the panel)
            const cosIncidence1 = Math.sin(solarAltitudeRad) * Math.cos(panelTilt1Rad) +
                                 Math.cos(solarAltitudeRad) * Math.sin(panelTilt1Rad) * Math.cos(solarAzimuthRad - panelAzimuth1Rad);

            const cosIncidence2 = Math.sin(solarAltitudeRad) * Math.cos(panelTilt2Rad) +
                                 Math.cos(solarAltitudeRad) * Math.sin(panelTilt2Rad) * Math.cos(solarAzimuthRad - panelAzimuth2Rad);
            
            // Power calculation based on incidence angle and weather, multiplied by the number of panels.
            power1 = panelPower * Math.max(0, cosIncidence1) * weatherFactor * numPanelsA;
            power2 = panelPower * Math.max(0, cosIncidence2) * weatherFactor * numPanelsB;
        }

        const totalPower = power1 + power2;

        if (powerData.length > 0) {
            const prevTotalPower = powerData[powerData.length - 1].power1 + powerData[powerData.length - 1].power2;
            totalEnergyWattHours += ((prevTotalPower + totalPower) / 2) * timeStepHours;
        }

        // Formatting for display on the chart
        const displayHour = Math.floor(localHour);
        const displayMinute = Math.round((localHour % 1) * 60);
        const ampm = displayHour >= 12 && displayHour < 24 ? 'PM' : 'AM';
        let formattedHour = displayHour % 12;
        if (formattedHour === 0) formattedHour = 12;
        const formattedMinute = displayMinute.toString().padStart(2, '0');
        
        powerData.push({
            time: `${formattedHour}:${formattedMinute} ${ampm}`,
            hour: localHour,
            power1: parseFloat(power1.toFixed(2)),
            power2: parseFloat(power2.toFixed(2)),
        });
    }

    const totalEnergyKiloWattHours = totalEnergyWattHours / 1000;
    
    if(powerData.length === 0){
        powerData.push({ time: 'Sunrise', hour: sunriseHour, power1: 0, power2: 0 });
        powerData.push({ time: 'Sunset', hour: sunsetHour, power1: 0, power2: 0 });
    }

    return { powerData, totalEnergy: totalEnergyKiloWattHours };
};