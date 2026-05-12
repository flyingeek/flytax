// End-to-end tests for the Air France parsers, run via the router against
// anonymized text fixtures. The .txt fixtures are the extracted text of the
// corresponding PDFs, generated once via `npm run extract-pdf -- --all`.
// Source PDFs are kept private (see test/fixtures/.gitignore) so this suite
// can run from a fresh clone.
import { readFileSync } from 'fs';
import taxData from '../../data/data2025.json';
import { iso2FR } from '../../src/utilities/dates';
import { router } from '../../src/parsers/router';

const loadFixture = (path) => readFileSync(path, 'utf8');

// AF payslip — net imposable, frais d'emploi, découchers F.PRO
test('AF payslip parsing', () => {
    const text = loadFixture('test/fixtures/af-payslip.txt');
    expect(router(text, 'af-payslip.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'pay',
        airline: 'AF',
        fileName: 'af-payslip.pdf',
        fileOrder: 0,
        errors: [],
        date: '2025-11',
        paymentDate: '2025-11-30',
        imposable: '8811.55',
        cumul: '56644.85',
        repas: ['526.36'],
        transport: ['0.00'],
        decouchers_fpro: ['253.20'],
    }]);
});

// AF carnet de vol — modern EP5 layout (header rendered as `_CARNET DE VOL -  EP5_`)
test('AF EP5 parsing', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5.txt');
    expect(router(text, 'af-ep4ep5.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'af-ep4ep5.pdf',
        fileOrder: 0,
        date: '2025-10',
        rots: [
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['JFK', 'JFK', 'JFK'],
                start: '2025-10-04T11:03+02:00',
                end: '2025-10-06T06:58+02:00',
                days: 3,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-JFK-CDG',
                countries: ['NY', 'NY', 'NY'],
                formula: '3 x NY',
                currencyFormula: '3 x 490USD',
                indemnity: 1330.8,
                error: false,
            },
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['HAV', 'HAV', 'HAV', 'HAV', 'HAV'],
                start: '2025-10-18T15:13+02:00',
                end: '2025-10-22T13:14+02:00',
                days: 5,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-HAV-CDG',
                countries: ['CU', 'CU', 'CU', 'CU', 'CU'],
                formula: '5 x CU',
                currencyFormula: '5 x 200EUR',
                indemnity: 1000,
                error: false,
            },
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['MIA', 'MIA', 'MIA'],
                start: '2025-10-25T11:14+02:00',
                end: '2025-10-27T10:29+01:00',
                days: 3,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-MIA-CDG',
                countries: ['US', 'US', 'US'],
                formula: '3 x US',
                currencyFormula: '3 x 360USD',
                indemnity: 977.73,
                error: false,
            },
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['JFK', 'JFK', 'JFK'],
                start: '2025-10-30T10:43+01:00',
                end: '2025-11-01T06:53+01:00',
                days: 3,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-JFK-CDG',
                countries: ['NY', 'NY', 'NY'],
                formula: '3 x NY',
                currencyFormula: '3 x 490USD',
                indemnity: 1330.8,
                error: false,
            },
        ],
    }]);
});

// AF carnet de vol — legacy EP5 layout (header rendered as `CARNET _DE _VOL _- _EP _5`)
test('AF legacy EP5 parsing', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5-legacy.txt');
    expect(router(text, 'af-ep4ep5-legacy.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'af-ep4ep5-legacy.pdf',
        fileOrder: 0,
        date: '2025-07',
        rots: [
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['DTW', 'DTW', 'DTW'],
                start: '2025-07-20T16:41+02:00',
                end: '2025-07-22T10:55+02:00',
                days: 3,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-DTW-CDG',
                countries: ['US', 'US', 'US'],
                formula: '3 x US',
                currencyFormula: '3 x 360USD',
                indemnity: 977.73,
                error: false,
            },
            {
                isComplete: '<>',
                airline: 'AF',
                nights: ['ABJ', 'ABJ', 'ABJ'],
                start: '2025-07-26T15:21+02:00',
                end: '2025-07-28T06:00+02:00',
                days: 3,
                dep: 'CDG', arr: 'CDG',
                summary: 'CDG-ABJ-CDG',
                countries: ['CI', 'CI', 'CI'],
                formula: '3 x CI',
                currencyFormula: '3 x 137000XOF',
                indemnity: 626.58,
                error: false,
            },
        ],
    }]);
});

// AF EP5 December previous year — prev-year boundary
test('AF EP5 parsing — December carries over from the previous tax year', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5-dec.txt');
    expect(router(text, 'af-ep4ep5-dec.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'af-ep4ep5-dec.pdf',
        fileOrder: 0,
        date: '2025-00', // Stamped as `${taxYear}-00` so it remains alongside the next year's months.
        rots: [
            {
                isComplete: '<',
                airline: 'AF',
                nights: ['YYZ'],
                start: '2024-12-31T15:33+01:00',
                end: '2025-01-01T01:00+01:00',
                days: 1,
                flights: [{
                    stop: '',
                    dep: 'CDG', start: '2024-12-31T14:33Z',
                    arr: 'YYZ', end: '2024-12-31T22:08Z',
                }],
                base: ['CDG', 'ORY'],
                dep: 'CDG', arr: '...',
                summary: 'CDG-YYZ...',
                countries: ['VT'],
                formula: '1 x VT',
                currencyFormula: '',
                indemnity: 0,
                error: false,
            },
        ],
    }]);
});

// AF EP5 January next year — next-year boundary
test('AF EP5 parsing — January carries over to the previous tax year', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5-jan.txt');
    expect(router(text, 'af-ep4ep5-jan.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'af-ep4ep5-jan.pdf',
        fileOrder: 0,
        date: '2025-13', // Stamped as `${taxYear}-13` so it remains alongside the previous year's months.
        rots: [
            {
                isComplete: '>',
                airline: 'AF',
                nights: ['YYZ', 'YYZ'],
                start: '2026-01-01T01:00+01:00',
                end: '2026-01-02T08:39+01:00',
                days: 2,
                flights: [{
                    stop: '',
                    dep: 'YYZ', start: '2026-01-01T23:45Z',
                    arr: 'CDG', end: '2026-01-02T07:39Z',
                }],
                base: ['CDG', 'ORY'],
                dep: '...', arr: 'CDG',
                summary: '...YYZ-CDG',
                countries: ['VT', 'VT'],
                formula: '2 x VT',
                currencyFormula: '',
                indemnity: 0,
                error: false,
            },
        ],
    }]);
});

// AF EP5 from a different tax year — returns early without rotations
test('AF EP5 outside the tax year is recognized but not parsed', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5.txt');
    expect(router(text, 'af-ep4ep5.pdf', 0, '2020', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'rotations',
        fileName: 'af-ep4ep5.pdf',
        fileOrder: 0,
        date: '2025-10',
    }]);
});

// EP4 fallback in tax-year window — no EP5 contained in EP4EP5
test('AF EP4 without EP5 surfaces an "absence d\'EP5" warning', () => {
    const text = loadFixture('test/fixtures/af-ep4.txt');
    expect(router(text, 'af-ep4.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'ep4',
        warning: "absence d'EP5",
        fileName: 'af-ep4.pdf',
        fileOrder: 0,
        content: text,
    }]);
});

// EP4 fallback outside the tax-year window — passthrough with date stamp, no warning
test('AF EP4 outside the tax year passes through silently', () => {
    const text = loadFixture('test/fixtures/af-ep4.txt');
    expect(router(text, 'af-ep4.pdf', 0, '2020', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'ep4',
        date: '2025-10',
        fileName: 'af-ep4.pdf',
        fileOrder: 0,
        content: text,
    }]);
});

// EP4 fallback in tax-year window — no EP5 contained in EP4EP5
test('AF legacy EP4 without EP5 surfaces an "absence d\'EP5" warning', () => {
    const text = loadFixture('test/fixtures/af-ep4-legacy.txt');
    expect(router(text, 'af-ep4-legacy.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'ep4',
        warning: "absence d'EP5",
        fileName: 'af-ep4-legacy.pdf',
        fileOrder: 0,
        content: text,
    }]);
});

// EP4 fallback outside the tax-year window — passthrough with date stamp, no warning
test('AF legacy EP4 outside the tax year passes through silently', () => {
    const text = loadFixture('test/fixtures/af-ep4-legacy.txt');
    expect(router(text, 'af-ep4-legacy.pdf', 0, '2020', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'ep4',
        date: '2025-06',
        fileName: 'af-ep4-legacy.pdf',
        fileOrder: 0,
        content: text,
    }]);
});

// AF nuitées attestation — annual lodging total paid by the company
test('AF nuitées attestation parsing', () => {
    const text = loadFixture('test/fixtures/af-nuitees.txt');
    expect(router(text, 'af-nuitees.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'lodging',
        fileName: 'af-nuitees.pdf',
        fileOrder: 0,
        errors: [],
        date: '2025',
        total: 4407.84,
    }]);
});

// AF legacy nuitées attestation — older layout for the same document type
test('AF legacy nuitées attestation parsing', () => {
    const text = loadFixture('test/fixtures/af-nuitees-legacy.txt');
    expect(router(text, 'af-nuitees-legacy.pdf', 0, '2024', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'lodging',
        fileName: 'af-nuitees-legacy.pdf',
        fileOrder: 0,
        errors: [],
        date: '2024',
        total: 5230.68,
    }]);
});

// AF nuitées attestation for a different tax year — surfaced as an error
test('AF nuitées attestation for the wrong year surfaces an error', () => {
    const text = loadFixture('test/fixtures/af-nuitees.txt');
    expect(router(text, 'af-nuitees.pdf', 0, '2020', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'lodging',
        error: 'année ≠ 2020',
        fileName: 'af-nuitees.pdf',
        fileOrder: 0,
        content: text,
    }]);
});

// Unrecognized file — bottom of the router fallthrough
test('unrecognized file content yields a "fichier non reconnu" error', () => {
    expect(router('hello world, no markers here', 'random.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'error',
        msg: 'fichier non reconnu',
        fileName: 'random.pdf',
        fileOrder: 0,
        content: 'hello world, no markers here',
    }]);
});
