import { decimal } from '../../utilities/numbers';
import { escapeRegExp, matchLast } from '../../utilities/regex';

/**
 * Whether `text` looks like a TO payslip. Both markers must be present:
 * the generic "BULLETIN DE PAIE" header and the issuer line "TRANSAVIA FRANCE"
 * (the latter rules out AF bulletins).
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isTransaviaPayslip = (text) =>
    HEADER_RE.test(text) && ISSUER_RE.test(text);

/**
 * Parse a TO monthly payslip.
 *
 * All extraction reads from `ctx.textByRows` — the bulletin layout is
 * column-based, so flat extraction interleaves rubrique codes,
 * libellés, and amounts in ways that defeat regex matching. The `text`
 * parameter is only kept around to populate the `content` field of
 * soft-error envelopes.
 *
 * Soft failures (missing paymentDate, missing imposable) are recorded
 * both in `result.errors` and as standalone error envelopes so
 * DropZone can log them individually. The date-not-found case is
 * fatal and yields a single `type: "error"` envelope instead of a
 * result, matching the AF payslip parser's contract.
 *
 * @param {string} text - Flat-extracted text (used as content for error envelopes).
 * @param {import('../airfrance/index.js').ParserContext & {textByRows: string}} ctx
 * @returns {Array<object>}
 */
export const payParser = (text, ctx) => {
    const {textByRows: src, fileName, fileOrder} = ctx;

    const result = {
        type: 'pay',
        airline: 'TO',
        fileName,
        fileOrder,
        errors: [],
    };

    try {
        result.date = matchLast(src, PERIOD_RE).split('/').reverse().join('-');
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
        result.paymentDate = matchLast(src, PAYMENT_DATE_RE).split('/').reverse().join('-');
    } catch (err) {
        result.paymentDate = '';

        result.errors.push({
            type: 'error',
            message: 'Date de paiement non trouvée',
        });
    }

    try {
        const match = SUMMARY_RE.exec(src);
        if (!match) throw new Error('Summary table not found');

        result.imposable = decimal(match[2]);
        result.cumul = decimal(match[5]);
    } catch (err) {
        result.imposable = '0';
        result.cumul = '0';

        result.errors.push({
            type: 'error',
            message: 'Net imposable non trouvé',
        });
    }

    result.repas     = extractAmounts(src, REPAS_RUBRIQUES).map(decimal);
    result.transport = extractAmounts(src, TRANSPORT_RUBRIQUES).map(decimal);

    // Transavia payslips don't itemize découchés frais professionnels.
    result.decouchers_fpro = ['0'].map(decimal);

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


// --- Internal: regex anchors -----------------------------------------

const HEADER_RE = /BULLETIN\s+DE\s+PAIE/;
const ISSUER_RE = /Transavia\s+France/i;

// "VIREMENT   du 30/09/2025"
const PAYMENT_DATE_RE = /VIREMENT\s+du\s+(\d{2}\/\d{2}\/\d{4})/g;

// "Période de paie du 1/09/2025 au 30/09/2025": leading day not zero-padded,
// month and year always zero-padded; multi-space tolerated.
// We capture only the MM/YYYY of the second half — the active period.
const PERIOD_RE = /Période de paie du\s+\d{1,2}\/\d{2}\/\d{4}\s+au\s+\d{1,2}\/(\d{2}\/\d{4})/g;

// Summary table at the bottom of page 2. The Mois and Cumul rows each
// carry 7 columns:
//   - Brut
//   - Charges Salariales
//   - Charges Patronales
//   - **Net imposable**
//   - Plafond
//   - Total versement
//   - Allèg. Cotis. (Not always populated)
//
// Every value is *duplicated* in the row-mode extraction — backreferences
// enforce the doubling so the regex bails loudly if the format ever changes.
//
// Net imposable is the 4th column → capture group 2 on Mois, group 5 on Cumul.
const SUMMARY_RE = /Mois_(?:([\-\d,]+)_\1_){3}(?:([\-\d,]+)_\2_)(?:([\-\d,]+)_\3_){2,3}\s+Cumul_(?:([\-\d,]+)_\4_){3}(?:([\-\d,]+)_\5_)(?:([\-\d,]+)_\6_){2,3}/;


// --- Internal: rubrique inventory ------------------------------------
// Each entry: [rubriqueCode, libelléLiteral].
// The literal must not include a `_`, since `extractAmounts` matches
// against `_`-joined row-mode text.
//
// Inventory is the union of all (code, libellé) pairs observed.

const REPAS_RUBRIQUES = [
    ['4169',  'Indemnité de nettoyage'],
    ['4170',  'Indemnité de repas Etranger'],
    ['4171',  'Indemnité de repas France'],
    ['4566',  'Indemn. Repas Soumise'],
    ['4566',  'Indemnité repas soumise'],
    ['21014', 'Indemnité repas'],
];

const TRANSPORT_RUBRIQUES = [
    ['4567',  'Ind.IKV Soumis'],
    ['4568',  'Remb.Transport Soumis'],
    ['4569',  'Remb.Transport Soumis'],
    ['21010', 'Rembt Ind Trsprt/Navigo/Velib'],
    ['21011', 'Remb.Transport'],
    ['21013', 'Indemnités IKV'],
    ['21020', 'Indemnité Transport'],
    ['21038', 'Indemnité Transport Sup.'],
];


// --- Internal: row-mode rubrique amount extraction --------------------

/**
 * For each (code, libellé) pair, find every occurrence on the bulletin
 * and return the rubrique's amount (the last amount column on its row).
 *
 * Row-mode payslip rows have shape:
 *   <code>_<libellé>_(<MM/YY>_)?(<base>_)?(<rate>_)?<amount>
 *
 * Where the optional middle cells vary by rubrique, e.g.:
 *   4566 has just the amount
 *   4567 has base+amount
 *   4568 has base+rate+amount
 *   21010 has base+rate+amount but no retroactive period
 *
 * @param {string} src - Row-mode payslip text.
 * @param {Array<[string, string]>} rubriques - [code, libellé] pairs. Libellés
 *   are literal strings (regex metachars are escaped on regex build).
 * @returns {string[]} Raw amount strings (with comma decimals).
 */
const extractAmounts = (src, rubriques) =>
    rubriques.flatMap(([code, libelle]) =>
        [...src.matchAll(buildRubriqueRe(code, libelle))]
            .map((match) => match[1])
    );

// The regex pins all five cell slots of a rubrique row directly:
//   <code>_<libellé>_                 anchor: rubrique row start
//   (?:\d{2}\/\d{2}_)?                optional Per. retro stamp (e.g. `07/25`)
//   (?:\s*-?\d+,\d{2}_){0,2}          0-2 leading amount cells (base, taux)
//   \s*(-?\d+,\d{2})                  amount  ← captured as group 1
//   (?=_|\n|$)                        must end at a cell boundary
//                                       (`_` between cells, `\n` page break, `$` end-of-document)
const buildRubriqueRe = (code, libelle) =>
    new RegExp(
        String.raw`${code}_${escapeRegExp(libelle)}_(?:\d{2}\/\d{2}_)?(?:\s*-?\d+,\d{2}_){0,2}\s*(-?\d+,\d{2})(?=_|\n|$)`,
        'g',
    );
