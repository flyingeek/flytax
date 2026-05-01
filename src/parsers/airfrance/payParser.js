import { decimal, sum } from '../../utilities/numbers';
import { matchAll, matchLast } from '../../utilities/regex';

/**
 * Whether `text` looks like an Air France payslip.
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isPayslip = (text) =>
    /BULLETIN DE PAIE_(AIR FRANCE|BASE|DP GN)/.test(text);

/**
 * Parse an Air France payslip.
 *
 * Soft failures (e.g. a missing imposable line) are recorded both in
 * `result.errors` and as standalone error/warning envelopes alongside
 * the result, so downstream consumers can log them individually.
 *
 * The date-not-found case is treated as fatal and yields a
 * single `type: "error"` envelope instead of a result.
 *
 * @param {string} text
 * @param {import('./index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
export const payParser = (text, ctx) => {
    const {fileName, fileOrder} = ctx;

    const result = {
        type: 'pay',
        airline: 'AF',
        fileName,
        fileOrder,
        errors: [],
    };

    try {
        result.date = matchLast(text, DATE_RE).split('/').reverse().join('-');

        if (result.date.endsWith('00')) throw new Error(`Date invalide: ${result.date}`);
    } catch (err) {
        return [{
            type: 'error',
            msg: 'Date non trouvée',
            fileName,
            fileOrder,
            content: err,
        }];
    }

    try {
        const net = matchAll(text, NET_RE);

        result.imposable = sum(net.map(decimal));

        if (net.length > 1) result.errors.push({
            type: 'warning',
            message: 'Plusieurs bulletins de salaire trouvés',
        });
    } catch (err) {
        result.imposable = '0';

        result.errors.push({
            type: 'error',
            message: 'Net imposable non trouvé',
        });
    }

    try {
        result.cumul = decimal(matchLast(text, CUMUL_RE));
    } catch (err) {
        result.cumul = '0';

        result.errors.push({
            type: 'error',
            message: 'Cumul Net imposable non trouvé',
        });
    }

    result.repas = matchAll(text, REPAS_RE, "0").map(decimal);
    result.transport = matchAll(text, TRANSPORT_RE, "0").map(decimal);
    result.decouchers_fpro = matchAll(text, DECOUCHERS_FPRO_RE, "0").map(decimal);

    // Surface each soft failure as its own envelope so DropZone can log it.
    return [
        result,
        ...result.errors.map((error) => ({
            type: error.type,
            msg: error.message,
            fileName,
            fileOrder,
            content: text,
        })),
    ];
};

const DATE_RE = /PERIODE DU \d{2}\/(\d{2}\/\d{4})/g;
const NET_RE = /_Mensuel_[\-0-9, ]+_{1,2}([\-0-9, ]+)_/g;
const CUMUL_RE = /_Annuel_[\-0-9, ]+_{1,2}([\-0-9, ]+)_/g;
const REPAS_RE = /(?:IND\.REPAS_+|INDEMNITE REPAS_+|IR\.FIN ANNEE DOUBL_+|IR EXONEREES_+|IR NON EXONEREES_+)([\-0-9, ]+)/g;
// Allows for optional quantity and rate before amount
const TRANSPORT_RE = /(?:IND\. TRANSPORT EXO_+|IND\. TRANSPORT_+|FRAIS REELS TRANSP_+|R\. FRAIS DE TRANSPORT_+)(?:[\-0-9, ]+_[\-0-9, ]+_)?([\-0-9, ]+)/g;
const DECOUCHERS_FPRO_RE = /(?:_I.DECOUCHERS F.PRO_+)([\-0-9, ]+)/g;
