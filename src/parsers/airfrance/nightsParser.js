import { matchFirst } from '../../utilities/regex';

/**
 * Whether `text` looks like an Air France nuitées attestation.
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isNuitees = (text) => text.indexOf(ATTESTATION_MARKER) !== -1;

/**
 * Parse an Air France "Attestation de décompte des nuitées" — the
 * annual statement of hotel-night expenses paid by the company.
 *
 * If the document's year doesn't match `ctx.taxYear`, returns a
 * `type: "lodging"` envelope carrying an `error`; otherwise returns
 * the same envelope with the parsed total.
 *
 * @param {string} text
 * @param {import('./index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
export const nightsAFParser = (text, ctx) => {
    const {fileName, fileOrder, taxYear} = ctx;

    const yearMatch = ATTESTATION_RE.exec(text);

    if (!yearMatch || yearMatch[1] !== taxYear) {
        return [{
            type: 'lodging',
            error: `année ≠ ${taxYear}`,
            fileName,
            fileOrder,
            content: text,
        }];
    }

    const result = {
        type: 'lodging',
        fileName,
        fileOrder,
        errors: [],
        date: taxYear,
    };

    try {
        const rawTotal = matchFirst(text, /compte s'élève à\s?:\s([\-0-9,. ]+)\sEuros/);

        result.total = parseFloat(rawTotal.replace(/\s+/g, '').replace(',', '.'));
    } catch (err) {
        result.errors.push({
            type: 'error',
            message: 'Montant des nuitées AF non trouvé',
        });
    }

    return [result];
};

const ATTESTATION_MARKER = "ATTESTATION DE DECOMPTE DES NUITEES POUR L'ANNEE ";
const ATTESTATION_RE = new RegExp(`${ATTESTATION_MARKER}(\\d+)`);
