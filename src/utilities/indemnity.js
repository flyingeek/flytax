// Build-time validation ensures airportsData, countriesData and exrData stay
// consistent, but findAmount* still surfaces AmountError to handle gaps at runtime.

/**
 * Error thrown by {@link findAmount} and {@link findAmountEuros} when an
 * indemnity amount cannot be resolved (missing country data, no entry
 * covering the date, or unknown currency).
 */
export class AmountError extends Error {}

/**
 * @typedef {Object} CountryData
 * @property {string} n - Country name (used in error messages).
 * @property {Array<[string, string, string]>} a - Entries `[isoDate, currency, amount]`,
 *   ordered most-recent-first. The first entry whose date is ≤ the queried date wins.
 */

/**
 * Look up the per-day indemnity for a country at a given date.
 *
 * Walks `countryData.a` and returns the first entry whose date is ≤ `isoDate`
 * (the array is expected to be ordered most-recent-first).
 *
 * @param {CountryData} countryData
 * @param {string} isoDate - ISO date "YYYY-MM-DD".
 * @returns {[string, string]} Tuple of `[amount, currency]` as strings.
 * @throws {AmountError} When `countryData` is missing or no entry covers the date.
 */
export const findAmount = (countryData, isoDate) => {
    if (!countryData) throw new AmountError(`Indemnité manquante`);
    for (const [date, currency, amount] of countryData.a) {
        if (date.localeCompare(isoDate) <= 0) return [amount, currency];
    }
    throw new AmountError(`Pas d'indemnité définie pour ${countryData.n} au ${isoDate}`);
};

/**
 * Look up the per-day indemnity for a country at a given date and convert
 * it to euros via the supplied exchange-rate table.
 *
 * @param {CountryData} countryData
 * @param {string} isoDate - ISO date "YYYY-MM-DD".
 * @param {Object<string, [string, string, string]>} exrData - Map of currency
 *   code to a `[..., ..., rate]` tuple. Only the third entry (`exr[2]`) is used.
 * @returns {number} Amount in euros, rounded to 2 decimal places.
 * @throws {AmountError} When the country lookup fails or the currency has no rate.
 */
export const findAmountEuros = (countryData, isoDate, exrData) => {
    const [amount, currency] = findAmount(countryData, isoDate);
    const exr = exrData[currency];
    if (!exr) throw new AmountError(`Taux de change inconnu pour ${currency}`);
    const rate = parseFloat(exr[2]);
    return parseFloat((parseFloat(amount) / rate).toFixed(2));
};
