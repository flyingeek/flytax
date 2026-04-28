// We work with two representations of monetary amounts:
//
//   decimal — a textual amount with two fraction digits, e.g. "123.45".
//             What humans (and most upstream documents) write.
//   cents   — an integer count of hundredths, e.g. 12345.
//             Lets us sum without floating-point drift.

/**
 * Normalize a textual amount to a 2-digit decimal string.
 * Accepts dot or comma as the fractional separator and strips
 * spaces used as thousands separators.
 *
 * @example
 *   decimal("12 345,6")  // → "12345.60"
 *
 * @param {string} text
 * @returns {string} A decimal string with exactly two fraction digits.
 */
export const decimal = (text) => {
    const number = text.replace(',', '.').replace(' ', '');
    const [left, right] = number.split(".");
    return left + '.' + (right || "00").padEnd(2, "0");
};

/**
 * Convert a decimal string to an integer count of cents.
 *
 * @param {string} decimal - A 2-digit decimal string (see {@link decimal}).
 * @returns {number}
 */
export const decimal2cents = (decimal) => {
    const [left, right] = decimal.split(".");
    return parseInt(left + (right || "00"), 10);
};

/**
 * Convert an integer count of cents back to a decimal string,
 * padding short values to exactly two fraction digits.
 *
 * @example
 *   cents2decimal(5)     // → "0.05"
 *   cents2decimal(12345) // → "123.45"
 *
 * @param {number} cents
 * @returns {string}
 */
export const cents2decimal = (cents) => {
    const centsString = cents.toString(10);
    switch (centsString.length) {
        case 2:  return '0.' + centsString;
        case 1:  return '0.0' + centsString;
        default: return centsString.slice(0, -2) + '.' + centsString.slice(-2);
    }
};

/**
 * Sum decimal strings via the cents representation, avoiding
 * floating-point drift (e.g. `0.1 + 0.2 !== 0.3` in IEEE 754).
 *
 * @param {string[]} decimals - Decimal strings to sum.
 * @returns {string} The total as a decimal string.
 */
export const sum = (decimals) => cents2decimal(decimals.map(decimal2cents).reduce((a, b) => a + b));
