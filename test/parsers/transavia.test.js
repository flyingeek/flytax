// End-to-end tests for the Transavia France parsers, run via the router
// against text fixtures extracted from `to-*.pdf` in test/fixtures/.
// The .txt fixtures are generated via `npm run extract-pdf -- --all`.
import { readFileSync } from 'fs';
import taxData from '../../data/data2025.json';
import { router } from '../../src/parsers/router';
import { iso2FR } from '../../src/utilities/dates';

const loadFixture = (path) => readFileSync(path, 'utf8');

// Build a minimal PV-shaped text covering one or more flight days.
// Default `rows` is a same-day base→non-base→base row that exercises
// no special behaviour — handy for tax-year stamping tests where the
// row contents don't matter, just the month/year header.
const pv = (
    monthEn = 'March',
    year = '2025',
    rows = '_15_ORY-ARN-ORY_15:25_21:40_15:24_21:31_5.35_6_1_6_14:24_22:01_',
) =>
    `_RELEVE D'ACTIVITE REMUNEREE (PV)_LVV (OPL/0000001)_${monthEn} ${year}_` +
    rows +
    `_Licensed to_Transavia France_`;


// --- Real-fixture coverage -------------------------------------------

test('TO PV parsing', () => {
    const text = loadFixture('test/fixtures/to-activities.txt');

    expect(router(text, undefined, 'to-activities.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'to-activities.pdf',
        fileOrder: 0,
        date: '2025-03',
        rots: [
            {
                isComplete: '<>',
                airline: 'TO',
                nights: ['PGF', 'PGF'],
                start: '2025-03-19T14:24+01:00',
                end: '2025-03-20T19:23+01:00',
                days: 2,
                dep: 'ORY', arr: 'ORY',
                summary: 'ORY-PGF-ORY',
                countries: ['FR', 'FR'],
                formula: '1.5 x FR',
                currencyFormula: '1.5 x 176EUR',
                indemnity: 264,
                error: false,
                taxDate: '2025-03',
            },
            {
                isComplete: '<>',
                airline: 'TO',
                nights: ['ORY'],
                start: '2025-03-23T15:24+01:00',
                end: '2025-03-23T21:31+01:00',
                days: 1,
                dep: 'ORY', arr: 'ORY',
                summary: 'ORY-ORY',
                countries: ['FR'],
                formula: '0.5 x FR',
                currencyFormula: '0.5 x 176EUR',
                indemnity: 88,
                error: false,
                taxDate: '2025-03',
            },
            {
                isComplete: '<>',
                airline: 'TO',
                nights: ['BIQ', 'BIQ', 'BIQ'],
                start: '2025-03-24T14:47+01:00',
                end: '2025-03-26T19:07+01:00',
                days: 3,
                dep: 'ORY', arr: 'ORY',
                summary: 'ORY-BIQ-ORY',
                countries: ['FR', 'FR', 'FR'],
                formula: '2.5 x FR',
                currencyFormula: '2.5 x 176EUR',
                indemnity: 440,
                error: false,
                taxDate: '2025-03',
            },
            {
                isComplete: '<>',
                airline: 'TO',
                nights: ['ORY'],
                start: '2025-03-31T07:29+02:00',
                end: '2025-03-31T13:33+02:00',
                days: 1,
                dep: 'ORY', arr: 'ORY',
                summary: 'ORY-ORY',
                countries: ['FR'],
                formula: '0.5 x FR',
                currencyFormula: '0.5 x 176EUR',
                indemnity: 88,
                error: false,
                taxDate: '2025-03',
            },
        ],
    }]);
});

test('TO PV with multi-space grouped cells still parses rotations', () => {
    // Some Transavia PV exports emit one pdf.js text item per row segment
    // (e.g. "20:45    23:40    20:41    23:28    2.78") instead of one item
    // per cell.
    const text = loadFixture('test/fixtures/to-activities-multispace.txt');

    const [parsed] = router(text, undefined, 'to-multispace.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR);

    expect(parsed.type).toBe('rotations');
    expect(parsed.date).toBe('2025-09');
    expect(parsed.rots.map((r) => r.summary)).toEqual([
        'ORY-DJE-PMO-ORY',
        'ORY-LYS-JED...',
    ]);
});


// --- Error handling -------------------------------------------

test('TO PV outside the tax year is recognized but not parsed', () => {
    expect(router(pv('June', '2025'), undefined, 'to-activities.pdf', 0, '2024', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'to-activities.pdf',
        fileOrder: 0,
        date: '2025-06',
    }]);
});

test('TO PV with an unknown airport in the chain flags the rotation as error: true', () => {
    const text = pv(
        'March',
        '2025',
        '_15_ORY-ZZZ_12:00_20:00_12:00_20:00_8_8_1_8_11:00_20:30_',
    );
    const parsedPv = router(text, undefined, 'to-err.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];
    const rot = parsedPv.rots[0];

    expect(rot.error).toBe(true);
    expect(rot.formula).toMatch(/!ERREUR!/);
    expect(rot.indemnity).toBe(0);
});


// --- Tax-year boundary stamping --------------------------------------

test('TO PV December is stamped as taxYear-00', () => {
    const parsedPv = router(pv('December', '2024'), undefined, 'to-dec.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.date).toEqual('2025-00');
});

test('TO PV January is stamped as taxYear-13', () => {
    const parsedPv = router(pv('January', '2026'), undefined, 'to-jan.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.date).toEqual('2025-13');
});

test('TO PV December boundary stamps taxDate 2025-00 on the surviving rotation', () => {
    const text = pv(
        'December',
        '2024',
        '_31_ORY-LIS_14:00_18:00_14:00_18:00_4_4_1_4_13:00_18:30_',
    );
    const parsedPv = router(text, undefined, 'to-dec-rot.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].taxDate).toBe('2025-00');
});

test('TO PV with a flight straddling Dec 31 → Jan 1 is kept by the tax-year filter', () => {
    const text = pv(
        'December',
        '2024',
        '_31_ORY-BER-ORY-PGF_14:30_21:10_14:24_21:32_4.9_5.75_1.09_6.26_13:24_22:02_8.63_5.26_1_8_6.26_9.76_0.52_11.03',
    );
    const parsedPv = router(text, undefined, 'to-straddle.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.date).toBe('2025-00');
    expect(parsedPv.rots.length).toBeGreaterThan(0);
});


// --- Non-flight row rejection ----------------------------------------

test('TO PV with a non-flight row (no HV/MEP times) emits no rotation', () => {
    const text = pv(
        'March',
        '2025',
        '_03_Blanc suite à un swap vol contre blanc_00:00_23:59',
    );
    const parsedPv = router(text, undefined, 'to-other.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    // Non-flight days in real PVs (JOUR OFF, Blanc, Conges Annuels, …)
    // carry only the prog HH:MM pair (00:00 / 23:59 placeholders) and no
    // réel pair / decimal tail. DAY_LINE_RE requires four HH:MM + tail +
    // anchor, so the row fails to match at the regex level.
    expect(parsedPv.rots).toEqual([]);
});

test('TO PV row whose Affectation lacks a chain emits no rotation', () => {
    const text = pv(
        'March',
        '2025',
        '_03_Blanc suite à un swap_12:00_22:00_12:00_22:00_4_4_1_4_11:00_22:30_',
    );
    const parsedPv = router(text, undefined, 'to-non-chain.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    // A synthetic row with the full PV column shape (4 HH:MM + tail +
    // anchor) but whose Affectation column doesn't contain a route chain.
    // The regex matches, but isFlightLine rejects on the chain check and
    // flightsFromRow returns [] — exercising the post-regex guard.
    expect(parsedPv.rots).toEqual([]);
});


// --- Chain-shape coverage --------------------------------------------

test('TO PV with same-day mixed deadhead + operated chain returning to base produces a complete rotation', () => {
    const text = pv(
        'March',
        '2025',
        '_15_ORY*GPM*GNT*NTE-LIS-ORY_11:50_22:05_11:50_22:19_4.63_5.08_1_3.12_6.64_10:50_22:49_11.98_8.26_1_4_8.26_8.26_0.91_9.34_',
    );
    const parsedPv = router(text, undefined, 'to-dhd.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots).toEqual([
        {
            isComplete: '<>',
            airline: 'TO',
            nights: ['ORY'],
            // Rotation anchors to Dpt réel / Arr réel — the leg
            // distribution between them is HV/MEP-based but the
            // outer envelope only reflects the bookends.
            start: '2025-03-15T11:50+01:00',
            end: '2025-03-15T22:19+01:00',
            days: 1,
            dep: 'ORY', arr: 'ORY',
            summary: 'ORY-ORY',
            // Same-day base→base: no overnight stay so buildRots
            // fills with the base airport (ORY → FR).
            countries: ['FR'],
            formula: '0.5 x FR',
            currencyFormula: '0.5 x 176EUR',
            indemnity: 88,
            error: false,
            taxDate: '2025-03',
        },
    ]);
});

test('TO PV with operated segments chain emits one flight per leg sized from HV time', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: NTE-MRS-BES-MRS-NTE (4 operated legs)
        // Window: 12:00 – 22:00 = 10 h
        // HV = 4 h (split across 4 operated legs → 1 h each)
        // Ground = window − HV = 6 h (split across 3 inter-leg gaps → 2 h each)
        '_10_NTE-MRS-BES-MRS-NTE_12:00_22:00_12:00_22:00_4_4_1_4_11:00_22:30_',
    );
    const parsedPv = router(text, undefined, 'to-operated.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'NTE', arr: 'MRS', start: '2025-03-10T11:00Z', end: '2025-03-10T12:00Z'}, // 1 hour, 2 hour gap
        {stop: '', dep: 'MRS', arr: 'BES', start: '2025-03-10T14:00Z', end: '2025-03-10T15:00Z'}, // 1 hour, 2 hour gap
        {stop: '', dep: 'BES', arr: 'MRS', start: '2025-03-10T17:00Z', end: '2025-03-10T18:00Z'}, // 1 hour, 2 hour gap
        {stop: '', dep: 'MRS', arr: 'NTE', start: '2025-03-10T20:00Z', end: '2025-03-10T21:00Z'}, // 1 hour
    ]);
});

test('TO PV with deadhead segments chain emits one flight per leg sized from MEP time', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: MRS*MRS*ORY*ORY (3 deadhead legs, no operated flights)
        // Window: 12:00 – 21:00 = 9 h
        // MEP = 3 h (split across 3 deadhead legs → 1 h each)
        // Ground = window − MEP = 6 h (split across 2 inter-leg gaps → 3 h each)
        '_24_MRS*MRS*ORY*ORY_12:00_21:00_12:00_21:00_3_3_11:00_21:30_',
    );
    const parsedPv = router(text, undefined, 'to-deadhead.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'MRS', arr: 'MRS', start: '2025-03-24T11:00Z', end: '2025-03-24T12:00Z'}, // 1 hour, 3 hour gap
        {stop: '', dep: 'MRS', arr: 'ORY', start: '2025-03-24T15:00Z', end: '2025-03-24T16:00Z'}, // 1 hour, 3 hour gap
        {stop: '', dep: 'ORY', arr: 'ORY', start: '2025-03-24T19:00Z', end: '2025-03-24T20:00Z'}, // 1 hour
    ]);
});

test('TO PV with mixed operated/deadhead segments chain sizes each leg by its type', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: ORY*GPM*GNT*NTE-LIS-NTE (3 deadhead legs + 2 operated legs)
        // Window: 12:00 – 22:00 = 10 h
        // HV = 4 h (split across 2 operated legs → 2 h each)
        // MEP = 3 h (split across 3 deadhead legs → 1 h each)
        // Ground = window − HV − MEP = 3 h (split across 4 inter-leg gaps → 45 min each)
        '_15_ORY*GPM*GNT*NTE-LIS-NTE_12:00_22:00_12:00_22:00_4_4_1_3_7_10:45_22:30_',
    );
    const parsedPv = router(text, undefined, 'to-mixed.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'ORY', arr: 'GPM', start: '2025-03-15T11:00Z', end: '2025-03-15T12:00Z'}, // 1 hour, 45 minute gap
        {stop: '', dep: 'GPM', arr: 'GNT', start: '2025-03-15T12:45Z', end: '2025-03-15T13:45Z'}, // 1 hour, 45 minute gap
        {stop: '', dep: 'GNT', arr: 'NTE', start: '2025-03-15T14:30Z', end: '2025-03-15T15:30Z'}, // 1 hour, 45 minute gap
        {stop: '', dep: 'NTE', arr: 'LIS', start: '2025-03-15T16:15Z', end: '2025-03-15T18:15Z'}, // 2 hours, 45 minute gap
        {stop: '', dep: 'LIS', arr: 'NTE', start: '2025-03-15T19:00Z', end: '2025-03-15T21:00Z'}, // 2 hours
    ]);
});

test('TO PV with a prefix before the chain still emits the flight', () => {
    const text = pv(
        'March',
        '2025',
        // Ground-course morning followed by an actual operated flight ORY-BCN.
        '_15_E learning refresh APRS-ORY-BCN_06:00_20:00_06:00_20:00_2.13_2.13_1_2.13_05:00_20:30_15.5_2_1_2_1_',
    );
    const parsedPv = router(text, undefined, 'to-elearn.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];
    const rot = parsedPv.rots[0];

    expect(rot.isComplete).toBe('<');
    // Caveat: the actual flight happens at the end of the day (after
    // the ground course), but the parser packs it at the start of the
    // [Dpt réel, Arr réel] window. Indemnity and rotation closure
    // depend only on the bookends and overnight stops, so the per-leg
    // misplacement doesn't affect the final tax calculation.
    expect(rot.flights).toEqual([
        {stop: '', dep: 'ORY', arr: 'BCN', start: '2025-03-15T05:00Z', end: '2025-03-15T07:08Z'},
    ]);
});

test('TO PV with a suffix after the chain still emits the flight', () => {
    const text = pv(
        'March',
        '2025',
        '_15_BCN-ORY-E learning refresh APRS_06:00_20:00_06:00_20:00_2.13_2.13_1_2.13_05:00_20:30_15.5_2_1_2_1_',
    );
    const parsedPv = router(text, undefined, 'to-suffix.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];
    const rot = parsedPv.rots[0];

    expect(rot.isComplete).toBe('>');
    expect(rot.flights).toEqual([
        {stop: '', dep: 'BCN', arr: 'ORY', start: '2025-03-15T05:00Z', end: '2025-03-15T07:08Z'},
    ]);
});

test('TO PV multi-day rotation closes correctly when the return leg is pure positioning', () => {
    const text = pv(
        'March',
        '2025',
        // Three consecutive day rows from a real PV PDF that together form a
        // complete rotation:
        //   day 22: ORY-TUN          (commercial, overnight at TUN)
        //   day 23: TUN-NCE-TUN-MRS  (commercial, overnight at MRS)
        //   day 24: MRS*MRS*ORY*ORY  (pure positioning back to base)
        '_22_ORY-TUN_20:15_22:50_20:41_22:49_2.13_2.75_1_2.75_19:15_23:19_4.07_3.5_1_12_3.5_12.9_1.16_14.57_' +
        '_23_TUN-NCE-TUN-MRS_15:50_22:35_15:41_22:37_4.5_5.67_1.14_6.45_14:41_23:07_8.43_5.14_1_6.45_1.06_' +
        '_24_MRS*MRS*ORY*ORY_12:40_16:00_12:40_16:00_2.08_1.04_11:40_16:30_4.83_2.95_1_2.95_',
    );
    const parsedPv = router(text, undefined, 'to-multi.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots).toEqual([
        {
            isComplete: '<>',
            airline: 'TO',
            nights: ['TUN', 'MRS', 'MRS'],
            start: '2025-03-22T20:41+01:00',
            end: '2025-03-24T16:00+01:00',
            days: 3,
            dep: 'ORY', arr: 'ORY',
            summary: 'ORY-TUN-MRS-ORY',
            countries: ['TN', 'FR', 'FR'],
            formula: '1 x TN + 1.5 x FR',
            currencyFormula: '1 x 125EUR + 1.5 x 176EUR',
            indemnity: 389,
            error: false,
            taxDate: '2025-03',
        },
    ]);
});


// --- Edge cases ----------------------------

test('TO PV with a flight crossing midnight (Arr réel < Dpt réel)', () => {
    const text = pv(
        'January',
        '2025',
        // Day 14 ORY-TLV: Dpt réel 22:00, Arr réel 02:00 (next day).
        // Window: 22:00 → 02:00 wraps past midnight = 4 h.
        // HV = 4 h fills the window
        // flight.end's ISO date is the following calendar day.
        '_14_ORY-TLV_22:00_02:00_22:00_02:00_4_4_1_4_21:00_02:30_',
    );
    const parsedPv = router(text, undefined, 'to-midnight.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights[0]).toEqual(
        {stop: '', dep: 'ORY', arr: 'TLV', start: '2025-01-14T21:00Z', end: '2025-01-15T01:00Z'},
    );
});

test('TO PV on a DST transition day (last Sunday of March / October)', () => {
    const text = pv(
        'March',
        '2025',
        '_28_ORY-VCE-ORY-BIQ_14:40_21:20_14:47_21:06_4.63_5.67_1.13_6.38_13:40_21:36_7.93_4.84_1_12_6.38_13.73_0.3_15.51' +
        '_29_BIQ-ORY-BIQ_17:45_21:30_17:44_21:16_2.77_3.25_1.19_3.85_16:44_21:46_5.03_3.5_1_3.85_0.38' +
        '_30_BIQ-ORY_17:45_19:15_17:45_19:07_1.37_1.67_1.19_1.99_16:45_19:37_2.87_3.5_1_3.5',
    );
    const parsedPv = router(text, undefined, 'to-dst.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];
    const rot = parsedPv.rots[0];

    // Expect: rotation start has one offset, end has the other.
    expect(rot.start.slice(-6)).toBe('+01:00');
    expect(rot.end.slice(-6)).toBe('+02:00');
});

test('TO PV day 1 starting at a non-base airport surfaces an incomplete > rotation', () => {
    const text = pv(
        'March',
        '2025',
        '_01_BIQ-ORY_17:45_19:15_17:45_19:07_1.37_1.67_1.19_1.99_16:45_19:37_2.87_3.5_1_3.5',
    );
    const parsedPv = router(text, undefined, 'to-day1.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].isComplete).toBe('>');
});

test('TO PV with HV + MEP exceeding the day window falls back to even distribution', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: ORY*ORY*BER-ORY-PGF (2 deadhead + 2 operated legs = 4 legs)
        // Window: 12:00 – 18:00 = 6 h
        // HV (4 h) + MEP (4 h) = 8 h > window → useActive=false
        // Fallback: each leg = window / leg count = 1 h 30 min, no inter-leg gap
        '_12_ORY*ORY*BER-ORY-PGF_12:00_18:00_12:00_18:00_4_4_1_4_8_11:00_18:30_',
    );
    const parsedPv = router(text, undefined, 'to-overflow.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'ORY', arr: 'ORY', start: '2025-03-12T11:00Z', end: '2025-03-12T12:30Z'},
        {stop: '', dep: 'ORY', arr: 'BER', start: '2025-03-12T12:30Z', end: '2025-03-12T14:00Z'},
        {stop: '', dep: 'BER', arr: 'ORY', start: '2025-03-12T14:00Z', end: '2025-03-12T15:30Z'},
        {stop: '', dep: 'ORY', arr: 'PGF', start: '2025-03-12T15:30Z', end: '2025-03-12T17:00Z'},
    ]);
});

test('TO PV with HV = 0 but operated legs present falls back to even distribution', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: ORY-TUN (1 operated leg)
        // Window: 18:00 – 20:00 = 2 h
        // HV = 0 → totalTime = 0 → useActive=false
        // Fallback: single leg fills the whole window
        '_22_ORY-TUN_18:00_20:00_18:00_20:00_0_0_1_0_17:00_20:30_',
    );
    const parsedPv = router(text, undefined, 'to-zero-hv.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'ORY', arr: 'TUN', start: '2025-03-22T17:00Z', end: '2025-03-22T19:00Z'},
    ]);
});

test('TO PV with MEP = 0 but deadhead legs present falls back to even distribution', () => {
    const text = pv(
        'March',
        '2025',
        // Chain: MRS*MRS*ORY*ORY (3 deadhead legs)
        // Window: 12:00 – 18:00 = 6 h
        // MEP = 0 → totalTime = 0 → useActive=false
        // Fallback: each leg = window / leg count = 2 h, no inter-leg gap
        '_24_MRS*MRS*ORY*ORY_12:00_18:00_12:00_18:00_0_0_11:00_18:30_',
    );
    const parsedPv = router(text, undefined, 'to-zero-mep.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)[0];

    expect(parsedPv.rots[0].flights).toEqual([
        {stop: '', dep: 'MRS', arr: 'MRS', start: '2025-03-24T11:00Z', end: '2025-03-24T13:00Z'},
        {stop: '', dep: 'MRS', arr: 'ORY', start: '2025-03-24T13:00Z', end: '2025-03-24T15:00Z'},
        {stop: '', dep: 'ORY', arr: 'ORY', start: '2025-03-24T15:00Z', end: '2025-03-24T17:00Z'},
    ]);
});


// --- Payslip coverage ------------------------------------------------

const loadPayFixture = (name) => ({
    flat: loadFixture(`test/fixtures/${name}.txt`),
    rows: loadFixture(`test/fixtures/${name}.rows.txt`),
});
const routePay = (name, fileName) => {
    const {flat, rows} = loadPayFixture(name);
    return router(flat, rows, fileName, 0, '2025', taxData, ['CDG', 'ORY'], iso2FR);
};

test('TO payslip — IKV bulletin (September 2025)', () => {
    const [result] = routePay('to-payslip-ikv', 'to-payslip-ikv.pdf');

    expect(result).toMatchObject({
        type: 'pay',
        airline: 'TO',
        fileName: 'to-payslip-ikv.pdf',
        fileOrder: 0,
        date: '2025-09',
        paymentDate: '2025-09-30',
        errors: [],
    });
    expect(String(result.imposable)).toBe('7663.06');
    expect(String(result.cumul)).toBe('62481.41');
    // 4566 (105,87) + 21014 (322,28)
    expect(result.repas.map(String)).toEqual(['105.87', '322.28']);
    // 4567 (34,53) + 21013 (188,01) — both IKV rubriques
    expect(result.ikv.map(String)).toEqual(['34.53', '188.01']);
    // No public transport on the IKV bulletin
    expect(result.transit.map(String)).toEqual([]);
    expect(result.decouchers_fpro.map(String)).toEqual(['0.00']);
});

test('TO payslip — Navigo bulletin populates transit from 21010', () => {
    const [result] = routePay('to-payslip-navigo', 'to-payslip-navigo.pdf');

    expect(result.date).toBe('2025-03');
    expect(result.paymentDate).toBe('2025-03-31');
    expect(String(result.imposable)).toBe('8447.28');
    // No IKV on the Navigo bulletin
    expect(result.ikv.map(String)).toEqual([]);
    // 4568 (20,35) Soumis + 21010 (61,05) Navigo exo
    expect(result.transit.map(String)).toEqual(['20.35', '61.05']);
    // 4566 (58,44) + 21014 (400,69)
    expect(result.repas.map(String)).toEqual(['58.44', '400.69']);
});

test('TO payslip — train bulletin populates transit from 4568/4569/21011', () => {
    const [result] = routePay('to-payslip-train', 'to-payslip-train.pdf');

    expect(result.date).toBe('2025-08');
    expect(result.paymentDate).toBe('2025-08-31');
    expect(String(result.imposable)).toBe('8775.15');
    expect(result.ikv.map(String)).toEqual([]);
    // 4568 (7,27) + 4569 (258,92) Soumis + 21011 (21,81) exo
    expect(result.transit.map(String)).toEqual(['7.27', '258.92', '21.81']);
    // 4566 (70,48) + 21014 (443,00)
    expect(result.repas.map(String)).toEqual(['70.48', '443.00']);
});

test('TO payslip detector wins over PV detector when both markers present', () => {
    // A pathological text carrying both BULLETIN DE PAIE + TRANSAVIA FRANCE
    // and the PV "RELEVE D'ACTIVITE REMUNEREE" string should route to the
    // payslip parser, not the PV parser.
    const text = '_BULLETIN DE PAIE_TRANSAVIA FRANCE_RELEVE D\'ACTIVITE REMUNEREE_Licensed to Transavia France_';
    const [result] = router(text, text, 'pathological.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR);

    expect(result.type).toBe('error'); // date not found → fatal in payParser
    expect(result.msg).toBe('Date non trouvée');
});

test('TO payslip detector does not match AF bulletins', () => {
    const afText = loadFixture('test/fixtures/af-payslip.txt');
    const [result] = router(afText, undefined, 'af-payslip.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR);

    expect(result.airline).toBe('AF');
});

test('AF payslip detector does not match TO bulletins', () => {
    const {flat, rows} = loadPayFixture('to-payslip-ikv');
    const [result] = router(flat, rows, 'to-payslip-ikv.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR);

    expect(result.airline).toBe('TO');
});
