// End-to-end parser tests against anonymized text fixtures.
//
// These tests don't read PDFs — they read .txt fixtures whose content is the
// extracted text from the corresponding PDF, generated once via:
// `npm run extract-pdf -- --all`
// Source PDFs are kept private (see test/fixtures/.gitignore) so this test
// suite can run anywhere from a fresh clone.
import { readFileSync } from 'fs';
import taxData from '../data/data2025.json';
import { iso2FR } from '../src/parsers/ep5Parser';
import { router } from '../src/parsers/router';

const loadFixture = (path) => readFileSync(path, 'utf8');

test('AF payslip parsing', () => {
    const text = loadFixture('test/fixtures/af-payslip.txt');
    expect(router(text, 'af-payslip.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'pay',
        fileName: 'af-payslip.pdf',
        fileOrder: 0,
        errors: [],
        date: '2025-11',
        imposable: '8811.55',
        cumul: '56644.85',
        repas: ['526.36'],
        transport: ['0.00'],
        decouchers_fpro: ['253.20'],
    }]);
});

test('AF EP5 parsing', () => {
    const text = loadFixture('test/fixtures/af-ep4ep5.txt');
    expect(router(text, 'af-ep4ep5.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'ep5',
        fileName: 'af-ep4ep5.pdf',
        fileOrder: 0,
        date: '2025-10',
        rots: [
            {
                isComplete: '<>',
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

test('AF nuitées attestation parsing', () => {
    const text = loadFixture('test/fixtures/af-nuitees.txt');
    expect(router(text, 'af-nuitees.pdf', 0, '2025', taxData, ['CDG', 'ORY'], iso2FR)).toEqual([{
        type: 'nights',
        fileName: 'af-nuitees.pdf',
        fileOrder: 0,
        errors: [],
        date: '2025',
        total: 4407.84,
    }]);
});
