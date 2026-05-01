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
