export type WeatherCondition = 'Soleado' | 'Parcialmente Nublado' | 'Nublado' | 'Avanzado';

export interface SimulationInput {
  angleA: number;
  angleB: number;
  panelPower: number;
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD
  weather: WeatherCondition;
  azimuth: number;
  numPanelsA: number;
  numPanelsB: number;
  weatherPoints: number[];
}

export interface PowerDataPoint {
  time: string;
  hour: number;
  power1: number;
  power2: number;
}

export interface SimulationResult {
    powerData: PowerDataPoint[];
    totalEnergy: number;
}

export interface UserAppliance {
  id: number;
  name: string;
  power: number; // in Watts
  usage: boolean[]; // 24-element array for each hour of the day
  minPower: number;
  maxPower: number;
  dutyCycle: number; // Percentage from 1 to 100
  isCustom: boolean;
}

// --- Battery Analysis Types ---

export type BatteryType = 'Litio-ion' | 'Plomo-ácido' | 'Níquel-cadmio';
export type CapacityInputMode = 'wh' | 'ahv';

export interface BatterySettings {
  type: BatteryType;
  count: number;
  capacityInputMode: CapacityInputMode;
  capacityWh: number; // For single battery
  capacityAh: number; // For single battery
  voltage: number;     // For single battery
  initialChargePercent: number; // Percentage from 0 to 100
}

export interface BatteryChartDataPoint {
    hour: number;
    timeLabel: string;
    storedEnergy: number; // in kWh
    solarGeneration: number; // in W
    loadConsumption: number; // in W
}

export interface BatteryAnalysisResult {
    chartData: BatteryChartDataPoint[];
    energyBalance: number; // in kWh. Positive for surplus, negative for deficit vs initial state.
}