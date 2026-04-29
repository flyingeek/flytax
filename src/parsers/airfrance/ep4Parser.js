import {EP5MONTHS} from './ep5Parser';
import {isInTaxYearWindow, stampForTaxYear} from '../../utilities/taxYear';

// Match an EP4 marker followed by a month name and a 4-digit year.
// Permissive enough to handle the various pdf.js tokenisations seen in
// the wild: "_EP4_", "_EP_4_", "EP 4", "EP4_", with either spaces or
// underscores between the month name and the year.
const EP4_RE = new RegExp(
    String.raw`[_\s]EP\s?_?4.+?_(${EP5MONTHS.join('|')})[\s_]+?(20\d{2})`
);

/**
 * Best-effort fallback parser for EP4 documents that arrived without
 * the matching EP5. Returns the EP4-shaped result envelope, or null
 * when the EP4 marker can't be located (caller decides what to do
 * with that — typically surfacing "fichier non reconnu").
 *
 * In-window months get a `warning: "absence d'EP5"` so the UI can
 * prompt for the missing EP5; out-of-window months get a passthrough
 * envelope with the date stamp so the register can still account for
 * the file.
 *
 * @param {string} text
 * @param {string} fileName
 * @param {number} fileOrder
 * @param {string} taxYear - 4-digit year of the declaration, e.g. "2025".
 * @returns {object|null}
 */
export const ep4Parser = (text, fileName, fileOrder, taxYear) => {
    const match = EP4_RE.exec(text);
    if (!match) return null;
    const monthIndex = EP5MONTHS.indexOf(match[1]);
    const month = (monthIndex + 1).toString(10).padStart(2, '0');
    const year = match[2];
    if (isInTaxYearWindow(month, year, taxYear)) {
        return {type: 'ep4', warning: "absence d'EP5", fileName, fileOrder, content: text};
    }
    return {type: 'ep4', date: stampForTaxYear(month, year, taxYear), fileName, fileOrder, content: text};
};
