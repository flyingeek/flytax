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
import { getPDFText, setPdfjsLib } from '../../src/utilities/pdf';

const nodeRequire = createRequire(import.meta.url);

export const setupPdfjs = () => {
    const pdfjs = nodeRequire('pdfjs-dist/es5/build/pdf.js');
    pdfjs.GlobalWorkerOptions.workerSrc = nodeRequire.resolve('pdfjs-dist/es5/build/pdf.worker.js');
    setPdfjsLib(pdfjs);
};

// getPDFTextFromFile expects a browser File and uses FileReader internally.
// Node has no FileReader, so tests reach the underlying primitive (getPDFText)
// directly with file-system bytes — the equivalent of what FileReader produces.
export const extractPdfText = (path) => {
    const data = new Uint8Array(readFileSync(path));
    return getPDFText({data, verbosity: 0}, '_');
};
