// PDF text extractor
//
// In the browser, PDF.js is loaded from CDN (see DropZone.svelte::preload)
// and registered here via setPdfjsLib(lib, {useWorker: true}). In Node tests,
// the npm package is registered via setPdfjsLib(lib) — no worker, the fake
// worker built into PDF.js is used.

let pdfjsLib = null;
let createWorker = null;
let pdfWorker = null;

// Register the PDF.js library to use. options.useWorker creates a real
// PDFWorker (off the main thread) — only useful in the browser.
export const setPdfjsLib = (lib, options = {}) => {
    pdfjsLib = lib;
    pdfWorker = null;
    createWorker = options.useWorker
        ? () => new lib.PDFWorker({verbosity: 0})
        : null;
};

const ensureWorker = () => {
    if (!createWorker) return null;

    if (!pdfWorker || pdfWorker.destroyed) pdfWorker = createWorker();

    return pdfWorker;
};

// Flat extraction
// Emit items in the order PDF.js found them. This is what every existing parser is
// tuned to — both AF and (legacy) bystanders.
export const getPDFText = (source, separator = "_") =>
    processPages(source, (items) => items.map(({str}) => str).join(separator));

export const getPDFTextFromFile = (file, separator = "_") => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => getPDFText({data: ev.target.result}, separator).then(resolve, reject);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
});

// Row-aware extraction
// Group items by Y baseline (within a small tolerance to absorb sub-pixel drift),
// sort each row left-to-right by X, then join.
// Use this for documents whose PDF layout is column-based and whose parser
// expects row-ordered text (e.g. Transavia payslips).
// For documents whose parser is tuned to PDF.js's natural emission order (AF EP5),
// prefer getPDFText — row grouping reorders items in ways those parsers don't expect.
const Y_TOLERANCE = 2; // points; absorbs sub-pixel baseline drift (diacritics)

export const getPDFTextByRows = (source, separator = "_") =>
    processPages(source, (items) => itemsToRowText(items, separator));

export const getPDFTextByRowsFromFile = (file, separator = "_") => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => getPDFTextByRows({data: ev.target.result}, separator).then(resolve, reject);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
});

const itemsToRowText = (items, separator) => {
    const rows = [];
    for (const { str, transform: [, , , , x, y] } of items) {
        if (!str) continue;

        let row = rows.find((r) => Math.abs(r.y - y) < Y_TOLERANCE);

        if (!row) {
            row = { y, items: [] };
            rows.push(row);
        }

        row.items.push({ x, str });
    }

    // PDF y increases upward; sort descending = top-to-bottom.
    rows.sort((a, b) => b.y - a.y);
    for (const row of rows) row.items.sort((a, b) => a.x - b.x);

    return rows.map((r) => r.items.map((i) => i.str).join(separator)).join(separator);
};

// Load every page and convert each one's items via the supplied processor,
// then join all page outputs with newlines.
// Centralizes the PDF.js setup so the two extraction modes (flat / row-aware) stay tiny.
const processPages = async (source, processor) => {
    if (!pdfjsLib) throw new Error("PDF.js not registered — call setPdfjsLib first");

    const pdf = await pdfjsLib.getDocument({
        ...source,
        verbosity: 0,
        worker: ensureWorker() ?? undefined,
    }).promise;

    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const { items } = await page.getTextContent();
        pages.push(processor(items));
    }
    return pages.join("\n");
};
