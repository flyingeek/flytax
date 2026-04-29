/**
 * Whether a (month, year) pair belongs to the tax-year window for `taxYear`.
 *
 * The window spans December of the previous year, all of the current year,
 * and January of the next year — the months that can carry rotations
 * straddling the year boundary into the current tax year.
 *
 * @example
 *   isInTaxYearWindow("12", "2024", "2025")  // → true  (boundary)
 *   isInTaxYearWindow("06", "2025", "2025")  // → true  (regular month)
 *   isInTaxYearWindow("01", "2026", "2025")  // → true  (boundary)
 *   isInTaxYearWindow("11", "2024", "2025")  // → false (out of window)
 *
 * @param {string} month - 2-digit month "01"–"12".
 * @param {string} year - 4-digit year, e.g. "2025".
 * @param {string} taxYear - 4-digit year of the declaration, e.g. "2025".
 * @returns {boolean}
 */
export const isInTaxYearWindow = (month, year, taxYear) => {
    if (year === taxYear) return true;
    const previousTaxYear = (parseInt(taxYear, 10) - 1).toString();
    const nextTaxYear = (parseInt(taxYear, 10) + 1).toString();
    return (month === "12" && year === previousTaxYear)
        || (month === "01" && year === nextTaxYear);
};

/**
 * Date stamp used to file a (month, year) under the right tax-year register key.
 *
 * Maps the boundary months to dedicated keys that sort outside the regular
 * `01`–`12` range so they remain co-located with the rest of the tax year:
 *
 *   - `${taxYear}-00` for December of the previous year
 *   - `${taxYear}-13` for January of the next year
 *   - `${year}-${month}` otherwise (whether in window or not)
 *
 * @example
 *   stampForTaxYear("12", "2024", "2025")  // → "2025-00"
 *   stampForTaxYear("06", "2025", "2025")  // → "2025-06"
 *   stampForTaxYear("01", "2026", "2025")  // → "2025-13"
 *   stampForTaxYear("06", "2020", "2025")  // → "2020-06" (out of window)
 *
 * @param {string} month - 2-digit month "01"–"12".
 * @param {string} year - 4-digit year, e.g. "2025".
 * @param {string} taxYear - 4-digit year of the declaration, e.g. "2025".
 * @returns {string}
 */
export const stampForTaxYear = (month, year, taxYear) => {
    const previousTaxYear = (parseInt(taxYear, 10) - 1).toString();
    const nextTaxYear = (parseInt(taxYear, 10) + 1).toString();
    if (month === "12" && year === previousTaxYear) return `${taxYear}-00`;
    if (month === "01" && year === nextTaxYear) return `${taxYear}-13`;
    return `${year}-${month}`;
};
