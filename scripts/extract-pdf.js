// Extract text from a PDF file using the same code path the app uses.
// Used to (re)generate the .txt fixtures next to each .pdf in test/fixtures/.
//
// Usage:
//   npm run extract-pdf -- <path.pdf>                          # flat → stdout
//   npm run extract-pdf -- <path.pdf> --rows                   # row-aware → stdout
//   npm run extract-pdf -- <path.pdf> --out <path.txt>         # flat → file
//   npm run extract-pdf -- <path.pdf> --rows --out <path.txt>  # row-aware → file
//   npm run extract-pdf -- --all                               # regenerate every
//                                                                fixture in
//                                                                test/fixtures/
//                                                                (both modes)
//
// The `--` separates npm's args from the script's. Without it, npm
// intercepts flags whose name matches one of its own (e.g. --all).

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import { createRequire } from 'module';
import { getPDFText, getPDFTextByRows, setPdfjsLib } from '../src/utilities/pdf.js';

const main = async () => {
    const { all, rows, out, input } = parseArgs(process.argv);
    if (all) {
        await regenerateAll();
        return;
    }
    if (!input) {
        console.error('Usage: extract-pdf <path.pdf> [--rows] [--out <path.txt>]');
        console.error('       extract-pdf --all     regenerate fixtures in test/fixtures/');
        process.exit(1);
    }
    const text = await extract(input, { rows });
    if (out) {
        writeFileSync(out, text);
        console.log(`Wrote ${out}`);
    } else {
        process.stdout.write(text);
    }
};

const parseArgs = (argv) => {
    const args = argv.slice(2);
    const flags = { all: false, rows: false, out: null, input: null };
    for (let i = 0; i < args.length; i += 1) {
        const a = args[i];
        if (a === '--all') flags.all = true;
        else if (a === '--rows') flags.rows = true;
        else if (a === '--out') { flags.out = args[i + 1]; i += 1; }
        else if (!flags.input) flags.input = a;
    }
    return flags;
};

const extract = async (pdfPath, { rows = false } = {}) => {
    const data = new Uint8Array(readFileSync(pdfPath));
    const fn = rows ? getPDFTextByRows : getPDFText;
    return fn({ data, verbosity: 0 }, '_');
};

// For --all: regenerate <base>.txt and <base>.rows.txt next to each .pdf in
// test/fixtures/.
const regenerateAll = async (dir = 'test/fixtures') => {
    const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
        console.log(`No PDFs found in ${dir}.`);
        return;
    }
    for (const pdf of pdfs) {
        const pdfPath = join(dir, pdf);
        const base = basename(pdf, extname(pdf));
        writeFileSync(join(dir, `${base}.txt`), await extract(pdfPath));
        writeFileSync(join(dir, `${base}.rows.txt`), await extract(pdfPath, { rows: true }));
        console.log(`✓ ${pdf} → ${base}.txt, ${base}.rows.txt`);
    }
};

const nodeRequire = createRequire(import.meta.url);
const pdfjs = nodeRequire('pdfjs-dist/es5/build/pdf.js');
pdfjs.GlobalWorkerOptions.workerSrc = nodeRequire.resolve('pdfjs-dist/es5/build/pdf.worker.js');
setPdfjsLib(pdfjs);

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
