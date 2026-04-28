// Shared helper for tests that need PDF text extraction
//
// Registers the Node-side PDF.js library against src/utilities/pdf so the
// production code path (getPDFText) is exercised. Tests call setupPdfjs()
// from beforeAll, then extractPdfText(path) per assertion.
//
// IMPORTANT: pdfjs-dist must stay pinned in package.json to the exact same
// version as CONF_PDFJS_JS in rollup.config.js — extraction output is highly
// version-sensitive (verified empirically: even minor v2.x bumps break
// parsers).
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { getPDFText, getPDFTextByRows, setPdfjsLib } from '../../src/utilities/pdf';

const nodeRequire = createRequire(import.meta.url);

export const setupPdfjs = () => {
    const pdfjs = nodeRequire('pdfjs-dist/es5/build/pdf.js');
    pdfjs.GlobalWorkerOptions.workerSrc = nodeRequire.resolve('pdfjs-dist/es5/build/pdf.worker.js');
    setPdfjsLib(pdfjs);
};

export const extractPdfText = (path) =>
    getPDFText({data: getFileData(path), verbosity: 0}, '_');

export const extractPdfTextByRows = (path) =>
    getPDFTextByRows({data: getFileData(path), verbosity: 0}, '_');

// FileReader is browser-only, so we synchronously read the bytes from disk
// and pass them as data directly — equivalent to what getPDFTextFromFile
// produces internally in the browser.
const getFileData = (path) => new Uint8Array(readFileSync(path));
