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

// Train-station codes used by Transavia France for crew ground
// positioning between regional bases and the Paris area. These aren't
// real IATA airports; some collide with actual codes (GST = Gustavus
// AK, GNT = Grants NM, GPL = Guapiles CR, GMA = Gemena CD, GRN =
// Gordon NE) which is why we keep this map out of the default
// `iata2country` and only use it from parsers that know they're
// processing train legs.
const TRAIN_STATIONS = {
    GPL: 'FR', // Gare de Paris-Lyon
    GPM: 'FR', // Gare de Paris-Montparnasse
    GPE: 'FR', // Gare de Paris-Est
    GPN: 'FR', // Gare de Paris-Nord
    GST: 'FR', // Gare de Strasbourg
    GNT: 'FR', // Gare de Nantes
    GBO: 'FR', // Gare de Bordeaux Saint-Jean
    GLI: 'FR', // Gare de Lille Europe
    GLY: 'FR', // Gare de Lyon Part-Dieu
    GMA: 'FR', // Gare de Marseille Saint-Charles
    GRN: 'FR', // Gare de Rennes
    GTL: 'FR', // Gare de Toulouse Matabiau
};

/**
 * Like {@link iata2country} but resolves train-station codes (GPM,
 * GNT, GST, …) to "FR" first. Intended for parsers whose source
 * documents use these codes for ground positioning (Transavia France
 * PV slips).
 *
 * @param {string} iata
 * @returns {string}
 */
export const iata2countryWithTrainStations = (iata) =>
    TRAIN_STATIONS[iata] ?? iata2country(iata);
