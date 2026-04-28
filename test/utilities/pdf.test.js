// Verify that PDF.js text extraction produces the expected text for each
// fixture PDF, in both flat and row-aware modes. The expected text lives in
// the corresponding .txt / .rows.txt fixture, generated once via
// `npm run extract-pdf -- --all`.
//
// Source PDFs are kept private (see test/fixtures/.gitignore). When they're
// absent (fresh clone, external contributor, CI without access), each test
// skips cleanly. The .txt / .rows.txt fixtures are the public regression
// baseline; this test layer adds a check that PDF.js → .txt remains stable
// for collaborators who do have the PDFs.
import { existsSync, readFileSync } from 'fs';
import { extractPdfText, extractPdfTextByRows, setupPdfjs } from '../helpers/extractPdfText';

beforeAll(setupPdfjs);

const ifPdf = (pdfPath) => existsSync(pdfPath) ? test : test.skip;

ifPdf('test/fixtures/af-payslip.pdf')('AF payslip extraction matches .txt fixture', async () => {
    expect(await extractPdfText('test/fixtures/af-payslip.pdf'))
        .toBe(readFileSync('test/fixtures/af-payslip.txt', 'utf8'));
});

ifPdf('test/fixtures/af-ep4ep5.pdf')('AF EP5 extraction matches .txt fixture', async () => {
    expect(await extractPdfText('test/fixtures/af-ep4ep5.pdf'))
        .toBe(readFileSync('test/fixtures/af-ep4ep5.txt', 'utf8'));
});

ifPdf('test/fixtures/af-nuitees.pdf')('AF nuitées attestation extraction matches .txt fixture', async () => {
    expect(await extractPdfText('test/fixtures/af-nuitees.pdf'))
        .toBe(readFileSync('test/fixtures/af-nuitees.txt', 'utf8'));
});

ifPdf('test/fixtures/af-payslip.pdf')('AF payslip row-aware extraction matches .rows.txt fixture', async () => {
    expect(await extractPdfTextByRows('test/fixtures/af-payslip.pdf'))
        .toBe(readFileSync('test/fixtures/af-payslip.rows.txt', 'utf8'));
});

ifPdf('test/fixtures/af-ep4ep5.pdf')('AF EP5 row-aware extraction matches .rows.txt fixture', async () => {
    expect(await extractPdfTextByRows('test/fixtures/af-ep4ep5.pdf'))
        .toBe(readFileSync('test/fixtures/af-ep4ep5.rows.txt', 'utf8'));
});

ifPdf('test/fixtures/af-nuitees.pdf')('AF nuitées attestation row-aware extraction matches .rows.txt fixture', async () => {
    expect(await extractPdfTextByRows('test/fixtures/af-nuitees.pdf'))
        .toBe(readFileSync('test/fixtures/af-nuitees.rows.txt', 'utf8'));
});
