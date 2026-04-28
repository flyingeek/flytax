import airportsData from "../../data/airports.json";

/**
 * Map an IATA airport code to its 2-letter country code (or city-specific
 * code, since some cities are tracked individually for tax purposes).
 *
 * Falls back to the input code when the airport is unknown — the caller
 * is expected to surface the missing-data error downstream.
 *
 * @example
 *   iata2country("CDG")  // → "FR"
 *   iata2country("JFK")  // → "NY"
 *   iata2country("XYZ")  // → "XYZ"
 *
 * @param {string} iata - 3-letter IATA airport code.
 * @returns {string}
 */
export const iata2country = (iata) => {
    const index = airportsData.indexOf(iata + ':');
    return (index >= 0) ? airportsData.substring(index + 4, index + 6) : iata;
};
