const HOURS = [6, 9, 12, 15, 18];

/**
 * Performs linear interpolation for a given hour based on a set of weather factor points.
 * @param hour The hour for which to calculate the weather factor (e.g., 13.5 for 1:30 PM).
 * @param points An array of 5 numbers representing the weather factor at 6, 9, 12, 15, and 18 hours.
 * @returns The interpolated weather factor, clamped to the range of the first and last points.
 */
export const getInterpolatedWeatherFactor = (hour: number, points: number[]): number => {
    // Clamp to the edges for hours outside the defined range
    if (hour <= HOURS[0]) {
        return points[0];
    }
    if (hour >= HOURS[HOURS.length - 1]) {
        return points[HOURS.length - 1];
    }

    // Find the two points the current hour falls between
    for (let i = 0; i < HOURS.length - 1; i++) {
        const h1 = HOURS[i];
        const h2 = HOURS[i + 1];

        if (hour >= h1 && hour <= h2) {
            const p1 = points[i];
            const p2 = points[i + 1];
            
            // Calculate the position (t) of the hour between h1 and h2, from 0.0 to 1.0
            const t = (hour - h1) / (h2 - h1);

            // Linear interpolation: p1 * (1 - t) + p2 * t
            return p1 + t * (p2 - p1);
        }
    }

    // Fallback for safety, though it should not be reached with the clamping logic above.
    return points[points.length - 1];
};
