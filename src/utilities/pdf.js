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

const getPageText = async (pdf, pageNo, separator) => {
    const page = await pdf.getPage(pageNo);
    const tokenizedText = await page.getTextContent();
    return tokenizedText.items.map((token) => token.str).join(separator);
};

export const getPDFText = async (source, separator = "_") => {
    if (!pdfjsLib) throw new Error("PDF.js not registered — call setPdfjsLib first");
    const worker = ensureWorker();
    const fullSource = worker ? {...source, verbosity: 0, worker} : {...source, verbosity: 0};
    const pdf = await pdfjsLib.getDocument(fullSource).promise;
    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
        pages.push(await getPageText(pdf, pageNo, separator));
    }
    return pages.join("\n");
};

export const getPDFTextFromFile = (file, separator = "_") => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => getPDFText({data: ev.target.result}, separator).then(resolve, reject);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
});
