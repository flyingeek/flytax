import { buildRots } from '../../rotations';
import { fr2iso, hhmmToMin, minToHHMM, offsetDay } from '../../utilities/dates';
import { iata2countryWithTrainStations } from '../../utilities/iata';
import { isInTaxYearWindow, stampForTaxYear } from '../../utilities/taxYear';

// English month names as they appear in the activity-slip header.
export const TO_MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

/**
 * Whether `text` looks like a Transavia France monthly activity slip
 * (PV — "RELEVE D'ACTIVITE REMUNEREE"). Both markers must be present:
 * the section header and the page-footer issuer line.
 *
 * @param {string} text
 * @returns {boolean}
 */
export const isTransaviaPV = (text) =>
    PV_HEADER_RE.test(text) && ISSUER_RE.test(text);

/**
 * Parse a Transavia France monthly PV slip.
 *
 * @param {string} text
 * @param {import('../airfrance/index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
export const pvParser = (text, ctx) => {
    const {month, year} = findPVDate(text, ctx);

    const result = {
        type: 'rotations',
        date: stampForTaxYear(month, year, ctx.taxYear),
        fileName: ctx.fileName,
        fileOrder: ctx.fileOrder,
    };

    if (!isInTaxYearWindow(month, year, ctx.taxYear)) return [result];

    // Stop at the end of the PV section: the HC section that follows
    // duplicates the same day rows with different productivity columns.
    const pvText = text.split(HC_HEADER_RE)[0];

    result.rots = buildTORotations(
        [...pvText.matchAll(DAY_LINE_RE)].flatMap(
            (match) => flightsFromRow(match, year, month)
        ),
        ctx,
    );

    return [result];
};


// --- Internal: regex anchors -----------------------------------------

const PV_HEADER_RE = /RELEVE D'ACTIVITE REMUNEREE/;
const HC_HEADER_RE = /RELEVE D'ACTIVITE DECOMPTEE/;
const ISSUER_RE = /Licensed to[_\s]+Transavia France/;

// English month + 4-digit year, anywhere in the document header.
const HEADER_DATE_RE = new RegExp(
    `(${TO_MONTHS.join('|')})\\s+(20\\d{2})`,
    'i',
);

// Match one flight day row in the pdf.js `_`-joined output. Each row
// carries two HH:MM pairs (prog then réel) followed by a variable-
// width tail of decimal columns and then the next HH:MM (Dpt TSV).
//
// The tail layout depends on what the day contains, because empty
// cells are dropped from the pdf.js token stream:
//   - Pure commercial (4 decimals): HV, HV100, Cmt, HCv
//   - Mixed flight + MEP (5 decimals): HV, HV100, Cmt, MEP, HCv
//   - Pure positioning (2 decimals): MEP, HCv
// We capture the whole tail as one string and parse it in JS by
// counting the decimals — splitTail() below.
//
//  Group 1: day of month (01-31)
//  Group 2: Affectation (single token — route chain like ORY-TUN-ORY,
//           or non-flight keyword like JOUR OFF)
//   (n.c.): Dpt prog (HH:MM)
//   (n.c.): Arr prog (HH:MM)
//  Group 3: Dpt réel (HH:MM)
//  Group 4: Arr réel (HH:MM)
//  Group 5: trailing decimals, `_`-separated
// (anchor): Dpt TSV (HH:MM) — only matched to bound the tail
//
// The `[A-Z]` start gate keeps decimals like `_3.5_` from matching as
// an Affectation. Non-flight rows ("JOUR OFF", "Conges Annuels", …)
// carry only one HH:MM pair (the prog pair, with placeholder 00:00 /
// 23:59) and so don't match — that's fine because we skip them via
// isFlightLine.
const DAY_LINE_RE = /_(\d{2})_([A-Z][^_]+)_(?:\d{2}:\d{2})_(?:\d{2}:\d{2})_(\d{2}:\d{2})_(\d{2}:\d{2})_((?:[\d.]+_)+[\d.]+)_(?=\d{2}:\d{2})/g;

// Match a route chain anywhere in the Affectation column value: at
// least two 3-letter codes separated by "-" (commercial) or "*" (MEP),
// e.g. "ORY-TUN-ORY", "BOD*GPM*ORY", or "ORY-BCN" tucked at the end of
// "E learning refresh APRS-ORY-BCN". Word boundaries keep the match
// from straddling longer alphanumeric runs ("APRS-ORY" — the "APR"
// portion lacks a leading boundary, so the match starts at "ORY").
const ROUTE_CHAIN_RE = /\b[A-Z]{3}(?:[-*][A-Z]{3})+\b/;


// --- Internal: helpers -----------------------------------------------

/**
 * Locate the English month / 4-digit year header of a PV slip.
 *
 * @param {string} text
 * @param {import('../airfrance/index.js').ParserContext} ctx
 * @returns {{month: string, year: string}} `month` is a 2-digit string
 *   ("01"–"12"); `year` is the 4-digit string from the document.
 * @throws {Error} When the pattern doesn't match; message includes
 *   `ctx.fileName` for diagnostics.
 */
const findPVDate = (text, ctx) => {
    const match = HEADER_DATE_RE.exec(text);

    if (!match) throw new Error(`Transavia PV parser: Date not found in ${ctx.fileName}`);

    return {
        month: (TO_MONTHS.indexOf(match[1].toLowerCase()) + 1)
            .toString(10)
            .padStart(2, '0'),
        year: match[2],
    };
};

/**
 * Whether an Affectation column value represents a flight day, i.e.
 * contains at least one route chain pattern. Free-form prefixes like
 * "E learning refresh" are tolerated as long as a route chain follows.
 *
 * @param {string} affectation
 * @returns {boolean}
 */
const isFlightLine = (affectation) =>
    typeof affectation === 'string' && ROUTE_CHAIN_RE.test(affectation);

/**
 * Parse the route chain inside an Affectation column value into an
 * ordered list of stops (airports / SNCF stations). Returns `[]` if no
 * chain is present.
 *
 * The convention used by Transavia France:
 *   - The first 3-letter code is the day's starting point (no prefix).
 *   - Subsequent codes are preceded by "-" (commercial flight) or
 *     "*" (positioning / MEP).
 *
 * Examples (each stop rendered as `{iata, mep}`):
 *   "ORY-TUN-ORY"
 *     -> [{ORY, f}, {TUN, f}, {ORY, f}]
 *   "NTE-TUN-NTE*GNT*GPY*ORY"
 *     -> [{NTE, f}, {TUN, f}, {NTE, f}, {GNT, t}, {GPY, t}, {ORY, t}]
 *   "E learning refresh APRS-ORY-BCN"   (free-form prefix, chain at end)
 *     -> [{ORY, f}, {BCN, f}]
 *
 * Train-station codes (GPM, GNT, GST, etc.) used for TGV positioning
 * are resolved to country "FR" via {@link iata2countryWithTrainStations}; this parser
 * only records the iata + mep flag and leaves the country lookup to
 * the rotation builder.
 *
 * @param {string} str
 * @returns {Array<{iata: string, mep: boolean}>}
 */
const parseRouteChainStops = (str) => {
    const [chain] = ROUTE_CHAIN_RE.exec(str) ?? [];

    if (!chain) return [];

    return Array.from(
        chain.matchAll(/([-*]?)([A-Z]{3})/g),
        ([, sep, iata]) => ({iata, mep: sep === '*'}),
    );
};

/**
 * Parse the trailing decimal block of a day row into HV and MEP hours.
 * The column count varies with what the day contained:
 *
 *   4 decimals → pure commercial: [HV, HV100, Cmt, HCv]
 *   5 decimals → mixed:           [HV, HV100, Cmt, MEP, HCv]
 *   2 decimals → pure positioning:[MEP, HCv]
 *
 * Other widths fall through to {0, 0} so {@link emitFlights} falls
 * back to even distribution across the window.
 *
 * @param {string} tail - Captured tail, e.g. `"5.8_6.25_1_6.25"`.
 * @returns {{operatedHours: number, deadheadHours: number}}
 */
const splitTail = (tail) => {
    const cols = tail.split('_').map(parseFloat);

    switch (cols.length) {
        case 4:  return {operatedHours: cols[0], deadheadHours: 0};        // commercial
        case 5:  return {operatedHours: cols[0], deadheadHours: cols[3]};  // mixed
        case 2:  return {operatedHours: 0,       deadheadHours: cols[0]};  // positioning
        default: return {operatedHours: 0,       deadheadHours: 0};        // fallback
    }
};

/**
 * Turn one PV day-row {@link DAY_LINE_RE} match into a list of flights.
 * Returns `[]` for non-flight rows.
 *
 * Sizes each operated leg from HV réalisé and each deadhead leg from MEP.
 * The rest of the `[Dpt réel, Arr réel]` window is absorbed into equal
 * ground gaps between legs (turnaround / layover time).
 *
 * Example: a same-day round trip ORY-XYZ-ORY with `[Dpt réel, Arr réel]`
 * = 09:00–21:00 and `HV` = 2h emits two 1-hour flights (09:00–10:00 and
 * 20:00–21:00) with a 10-hour layover gap in between, instead of two
 * 6-hour flights back-to-back.
 *
 * Falls back to even distribution across the window when HV + MEP is
 * zero or exceeds the window — protects against malformed data.
 *
 * @param {RegExpMatchArray} match - One {@link DAY_LINE_RE} match.
 * @param {string} year - 4-digit year of the slip.
 * @param {string} month - 2-digit month of the slip.
 * @returns {Array<{stop: string, dep: string, arr: string, start: string, end: string}>}
 *   One flight per leg, with UTC ISO timestamps.
 */
const flightsFromRow = ([, day, affectation, dptReel, arrReel, tail], year, month) => {
    if (!isFlightLine(affectation)) return [];

    // Convert a minute-offset from midnight of the row's calendar day
    // to a UTC ISO timestamp, properly rolling into the next day.
    const toIso = (minute) => {
        const d = offsetDay(year, month, day, Math.floor(minute / (24 * 60)));
        return fr2iso(`${d.year}-${d.month}-${d.day}`, minToHHMM(Math.round(minute) % (24 * 60)));
    };

    const stops = parseRouteChainStops(affectation);

    const totalLegCount = stops.length - 1;
    const deadheadLegCount = stops.slice(1).filter((s) => s.mep).length;
    const operatedLegCount = totalLegCount - deadheadLegCount;

    const start = hhmmToMin(dptReel);
    let end = hhmmToMin(arrReel);
    if (end <= start) end += 24 * 60;

    const duration = end - start;

    const {operatedHours, deadheadHours} = splitTail(tail);
    const operatedTime = operatedHours * 60;
    const deadheadTime = deadheadHours * 60;
    const totalTime = operatedTime + deadheadTime;

    const useActive = totalTime > 0 && totalTime <= duration;
    const gapDuration = (useActive && totalLegCount > 1)
        ? (duration - totalTime) / (totalLegCount - 1)
        : 0;
    const legDuration = (k) => {
        if (!useActive) return duration / totalLegCount;

        return stops[k + 1].mep
            ? deadheadTime / deadheadLegCount
            : operatedTime / operatedLegCount;
    };

    const flights = [];
    let legStart = start;

    for (let k = 0; k < totalLegCount; k += 1) {
        const legEnd = legStart + legDuration(k);

        flights.push({
            stop: '',
            dep: stops[k].iata,
            arr: stops[k + 1].iata,
            start: toIso(legStart),
            end: toIso(legEnd),
        });

        legStart = legEnd + gapDuration;
    }

    return flights;
};

/**
 * Sort flights by `start`, breaking ties on `end`. Mutates in place and
 * returns the same array (matches the AF ep5Parser convention).
 *
 * @param {Array<{start: string, end: string}>} flights
 * @returns {Array<{start: string, end: string}>}
 */
const sortFlights = (flights) => flights.sort((a, b) => {
    const c = a.start.localeCompare(b.start);
    return c === 0 ? a.end.localeCompare(b.end) : c;
});

/**
 * Build Transavia rotations from a flat list of flights. Delegates to
 * the shared `buildRots` pipeline, tagging rotations with
 * `airline: 'TO'`. The router's decorate step handles indemnity
 * computation and taxDate stamping.
 *
 * @param {Array<object>} flights - Output of {@link flightsFromRow}.
 * @param {import('../airfrance/index.js').ParserContext} ctx
 * @returns {Array<object>}
 */
const buildTORotations = (flights, ctx) => buildRots(
    sortFlights(flights),
    {
        tzConverter: ctx.tzConverter,
        base: ctx.base,
        iataMap: iata2countryWithTrainStations,
        airline: 'TO',
    },
);
