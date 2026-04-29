import { addIndemnities, buildRots } from '../../rotations';
import { decimalHours2iso } from '../../utilities/dates';
import { iata2country } from '../../utilities/iata';
import { isInTaxYearWindow, stampForTaxYear } from '../../utilities/taxYear';

// Months as written in EP5 headers.
export const EP5MONTHS = [
    'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE',
];

/**
 * Whether `text` looks like an Air France carnet de vol (EP5).
 * Matches both legacy and modern layout markers.
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isEP5 = (text) =>
    text.indexOf(LEGACY_MARKER) !== -1 || text.indexOf(MODERN_MARKER) !== -1;

/**
 * Parse an Air France carnet de vol (EP5). Internally dispatches to
 * the legacy or modern format based on which header marker the
 * document carries.
 *
 * @param {string} text
 * @param {import('./index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
export const ep5Parser = (text, ctx) => {
    return [text.indexOf(LEGACY_MARKER) !== -1
        ? parseEP5Legacy(text, ctx)
        : parseEP5Modern(text, ctx)
    ];
};


// --- Internal: modern layout (`_CARNET DE VOL -  EP5_`) --------------

// _OTP_3.08_1.83_OOA_01 | 04.07_L-21_CDG_1.25_01 | 07.15_0_GTAY
//   1: departure airport
//   2: departure day
//   3: departure decimal-hour time
//   4: arrival airport
//   5: arrival day
//   6: arrival decimal-hour time
const MODERN_FLIGHT_RE = /_(\S{3})_(?:[0-9.]+(?:_[0-9.]+)?_[^_]+|[^_]+_[0-9.]+)_(\d+)\s\|\s([0-9.]+)_(?:[^_]+_(\S{3})(?:_[0-9.]+)?_(\d+)\s\|\s([0-9.]+)_\d_(?:[A-Z]{4})|\sZZ_(\S{3})_(\d+)\s\|\s([0-9.]+))/g;
const MODERN_HEADER_PATTERN = String.raw`_(${EP5MONTHS.join('|')})\s+?(20\d{2})_`;

const parseEP5Modern = (text, ctx) => {
    const {month, year} = findEP5Date(text, ctx, MODERN_HEADER_PATTERN);

    const result = {
        type: 'ep5',
        date: stampForTaxYear(month, year, ctx.taxYear),
        fileName: ctx.fileName,
        fileOrder: ctx.fileOrder,
    };

    if (!isInTaxYearWindow(month, year, ctx.taxYear)) return result;

    const flights = [];
    let match;

    while ((match = MODERN_FLIGHT_RE.exec(text)) !== null) {
        let [, dep, depDay, depTime, arr, arrDay, arrTime, mepArr, mepArrDay, mepArrTime] = match;
        arr = arr ?? mepArr;
        arrDay = arrDay ?? mepArrDay;
        arrTime = arrTime ?? mepArrTime;

        // The arrival may roll over into the next month/year if its day
        // number is smaller than the departure's.
        let arrMonthInt = parseInt(month, 10);
        let arrYearInt = parseInt(year, 10);
        if (/^\d+$/.test(depDay) && /^\d+$/.test(arrDay) && parseInt(arrDay, 10) < parseInt(depDay, 10)) {
            arrYearInt += arrMonthInt === 12 ? 1 : 0;
            arrMonthInt = (arrMonthInt % 12) + 1;
        }

        flights.push({
            stop: '',
            dep,
            arr,
            start: `${year}-${month}-${depDay}T${decimalHours2iso(depTime)}`,
            end: `${arrYearInt}-${arrMonthInt.toString(10).padStart(2, '0')}-${arrDay}T${decimalHours2iso(arrTime)}`,
        });
    }

    result.rots = buildAFRotations(flights, ctx);

    return result;
};


// --- Internal: legacy layout (`CARNET _DE _VOL _- _EP _5`) -----------

// 0,00 T-77W  GSQY 0 PEK  01 00,00 CDG  01 04,03
// (filters out simulator entries)
//   1: previous-stop time ("0,00" if straddling previous month)
//   2: aircraft type, or blank for MEP
//   3: registration
//   4: activity type (0)
//   5: departure airport
//   6: departure day
//   7: departure decimal-hour time ("00,00" if start of month)
//   8: arrival airport
//   9: arrival day
//  10: arrival decimal-hour time ("24,00" if end of month and straddling)
const LEGACY_FLIGHT_RE = /([0-9,]+)\s(?:.{5})\s{2}(?:\S{4})\s(?:.+?)\s(\S{3})\s+(\d+)\s+([0-9,]+)\s+(\S{3})\s+(\d+)\s+([0-9,]+)/g;
const LEGACY_HEADER_PATTERN = String.raw`\s(${EP5MONTHS.join('|')})\s+?(20\d{2})`;

const parseEP5Legacy = (text, ctx) => {
    const {month, year} = findEP5Date(text, ctx, LEGACY_HEADER_PATTERN);

    const result = {
        type: 'ep5',
        date: stampForTaxYear(month, year, ctx.taxYear),
        fileName: ctx.fileName,
        fileOrder: ctx.fileOrder,
    };

    if (!isInTaxYearWindow(month, year, ctx.taxYear)) return result;

    const flights = [];
    let match;

    while ((match = LEGACY_FLIGHT_RE.exec(text)) !== null) {
        const [, stop, dep, depDay, depTime, arr, arrDay, arrTime] = match;

        flights.push({
            stop,
            dep,
            arr,
            start: `${year}-${month}-${depDay}T${decimalHours2iso(depTime)}`,
            end: `${year}-${month}-${arrDay}T${decimalHours2iso(arrTime)}`,
        });
    }

    result.rots = buildAFRotations(flights, ctx);

    return result;
};


// --- Internal: shared helpers ----------------------------------------

// Section headers that identify each EP5 layout.
const LEGACY_MARKER = 'CARNET _DE _VOL _- _EP _5';
const MODERN_MARKER = '_CARNET DE VOL -  EP5_';

const sortFlights = (flights) => flights.sort((a, b) => {
    const c = a.start.localeCompare(b.start);
    return c === 0 ? a.end.localeCompare(b.end) : c;
});

const buildAFRotations = (flights, ctx) => {
    const rots = buildRots(
        sortFlights(flights),
        {
            tzConverter: ctx.tzConverter,
            base: ctx.base,
            iataMap: iata2country,
            airline: 'AF',
        },
    );

    return addIndemnities(ctx.taxYear, rots, ctx.taxData, ctx.tzConverter, ctx.fileName);
};

/**
 * Locate the month/year header in an EP5 document.
 *
 * @param {string} text
 * @param {import('./index.js').ParserContext} ctx
 * @param {string} headerPattern - Regex source with two capture groups:
 *   `(month)` matching one of {@link EP5MONTHS}, and `(year)` matching the
 *   4-digit year.
 * @returns {{month: string, year: string}} `month` is a 2-digit string
 *   ("01"–"12"); `year` is the 4-digit string from the document.
 * @throws {Error} When the pattern doesn't match; message includes
 *   `ctx.fileName` for diagnostics.
 */
const findEP5Date = (text, ctx, headerPattern) => {
    const match = new RegExp(headerPattern).exec(text);

    if (!match) throw new Error(`EP5 parser: Date not found in ${ctx.fileName}`);

    return {
        month: (EP5MONTHS.indexOf(match[1]) + 1).toString(10).padStart(2, '0'),
        year: match[2],
    };
};
