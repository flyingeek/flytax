import { isInTaxYearWindow, stampForTaxYear } from '../../utilities/taxYear';
import { EP5MONTHS } from './ep5Parser';

/**
 * Whether `text` looks like an Air France EP4.
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isEP4 = (text) => EP4_RE.test(text);

/**
 * Best-effort fallback parser for EP4 documents that arrived without
 * the matching EP5. Assumes {@link isEP4} returned true.
 *
 * In-window months get a `warning: "absence d'EP5"` so the UI can
 * prompt for the missing EP5; out-of-window months get a passthrough
 * envelope with the date stamp so the register can still account for
 * the file.
 *
 * @param {string} text
 * @param {import('./index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
export const ep4Parser = (text, ctx) => {
    const {fileName, fileOrder, taxYear} = ctx;
    const match = EP4_RE.exec(text);
    const monthIndex = EP5MONTHS.indexOf(match[1]);
    const month = (monthIndex + 1).toString(10).padStart(2, '0');
    const year = match[2];

    if (isInTaxYearWindow(month, year, taxYear)) {
        return [{
            type: 'ep4',
            warning: "absence d'EP5",
            fileName,
            fileOrder,
            content: text,
        }];
    }

    return [{
        type: 'ep4',
        date: stampForTaxYear(month, year, taxYear),
        fileName,
        fileOrder,
        content: text,
    }];
};

const EP4_RE = new RegExp(String.raw`[_\s]EP\s?_?4.+?_(${EP5MONTHS.join('|')})[\s_]+?(20\d{2})`);
