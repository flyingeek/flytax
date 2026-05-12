/**
 * Create a stable identity signature for a parsed payslip result.
 *
 * Two payslips are considered the same iff they share the same airline,
 * payment date, and net imposable. Re-importing the same PDF — or the
 * same payslip exported under a different filename — produces the same
 * signature, so downstream consumers can deduplicate on insert.
 *
 * Payment date (`YYYY-MM-DD`) is used rather than the period date
 * (`YYYY-MM`) because it's strictly more discriminating: it distinguishes
 * two bulletins covering the same period but issued on different days
 * (e.g. multiple complémentaires for the same month).
 *
 * @example
 *   payslipSignature({airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.55'})
 *   // → "AF|2025-11-30|8811.55"
 *
 * @param {{airline: string, paymentDate: string, imposable: string}} payslip
 * @returns {string}
 */
export const payslipSignature = (payslip) =>
    `${payslip.airline}|${payslip.paymentDate}|${payslip.imposable}`;

/**
 * Group an array of payslips by their period month (`"01"`–`"12"`),
 * extracted from the `YYYY-MM` `date` field.
 *
 * @example
 *   groupByMonth([{date: '2025-11', ...}, {date: '2025-11', ...}, {date: '2025-12', ...}])
 *   // → { "11": [{...}, {...}], "12": [{...}] }
 *
 * @param {Array<{date: string}>} items
 * @returns {Object<string, Array<object>>}
 */
export const groupByMonth = (payslips) => {
    const out = {};

    for (const payslip of payslips) (out[payslip.date.split('-')[1]] ??= []).push(payslip);

    return out;
};

/**
 * Find a payslip in `payslips` that shares its identity signature.
 *
 * Returns the matching payslip or `undefined` if none.
 *
 * @example
 *   findIn(store.items, parsedResult)  // → existing payslip, or undefined
 *
 * @param {Array<object>} payslips
 * @param {object} candidate
 * @returns {object | undefined}
 */
export const findIn = (payslips, candidate) => {
    const sig = payslipSignature(candidate);

    return payslips.find((payslip) => payslipSignature(payslip) === sig);
};

/**
 * Set of months for which `items` carries at least one entry — extracted
 * from a `YYYY-MM…` field on each item via `getDate`.
 *
 * Defaults to reading each item's `date` field, used by paySlips
 * (`"YYYY-MM"`, the period month). Rotations pass `r => r.taxDate` so
 * they read the tax-year-stamped month (`"YYYY-00"`–`"YYYY-13"`) instead.
 *
 * @example
 *   loadedMonths([{date: '2025-11'}, {date: '2025-12'}, {date: '2025-11'}])
 *   // → Set { "11", "12" }
 *   loadedMonths([{taxDate: '2025-00'}], (r) => r.taxDate)
 *   // → Set { "00" }
 *
 * @param {Array<object>} items
 * @param {(item: object) => string} [getDate]
 * @returns {Set<string>}
 */
export const loadedMonths = (items, getDate = (b) => b.date) =>
    new Set(items.map((item) => getDate(item).split('-')[1]));
