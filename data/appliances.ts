export interface Appliance {
    name: string;
    power: number; // in Watts
    minPower: number;
    maxPower: number;
}

export const APPLIANCE_LIST: Appliance[] = [
    { name: 'Refrigerador', power: 150, minPower: 100, maxPower: 250 },
    { name: 'Luces LED (x5)', power: 50, minPower: 10, maxPower: 100 },
    { name: 'Televisor', power: 120, minPower: 50, maxPower: 300 },
    { name: 'Computadora Portátil', power: 60, minPower: 20, maxPower: 100 },
    { name: 'Microondas', power: 1100, minPower: 800, maxPower: 1500 },
    { name: 'Lavadora', power: 500, minPower: 300, maxPower: 2000 },
    { name: 'Aire Acondicionado', power: 1500, minPower: 800, maxPower: 3000 },
    { name: 'Router Wi-Fi', power: 10, minPower: 5, maxPower: 20 },
    { name: 'Cargador de Celular', power: 5, minPower: 5, maxPower: 25 },
    { name: 'Horno Eléctrico', power: 2000, minPower: 1200, maxPower: 4000 },
    { name: 'Ducha Eléctrica', power: 3500, minPower: 2500, maxPower: 5500 },
    { name: 'Otro', power: 100, minPower: 10, maxPower: 10000 },
];