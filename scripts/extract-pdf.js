// Extract text from a PDF file using the same code path the app uses.
// Used to (re)generate the .txt fixtures next to each .pdf in test/fixtures/.
//
// Usage:
//   npm run extract-pdf -- <path.pdf>                     # → stdout
//   npm run extract-pdf -- <path.pdf> --out <path.txt>    # → file
//   npm run extract-pdf -- --all                          # regenerate every
//                                                           fixture in
//                                                           test/fixtures/
//
// The `--` separates npm's args from the script's. Without it, npm
// intercepts flags whose name matches one of its own (e.g. --all).

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import { createRequire } from 'module';
import { getPDFText, setPdfjsLib } from '../src/utilities/pdf.js';

const main = async () => {
    const { all, out, input } = parseArgs(process.argv);
    if (all) {
        await regenerateAll();
        return;
    }
    if (!input) {
        console.error('Usage: extract-pdf <path.pdf> [--out <path.txt>]');
        console.error('       extract-pdf --all     regenerate fixtures in test/fixtures/');
        process.exit(1);
    }
    const text = await extract(input);
    if (out) {
        writeFileSync(out, text);
        console.log(`Wrote ${out}`);
    } else {
        process.stdout.write(text);
    }
};

const parseArgs = (argv) => {
    const args = argv.slice(2);
    const flags = { all: false, out: null, input: null };
    for (let i = 0; i < args.length; i += 1) {
        const a = args[i];
        if (a === '--all') flags.all = true;
        else if (a === '--out') { flags.out = args[i + 1]; i += 1; }
        else if (!flags.input) flags.input = a;
    }
    return flags;
};

const extract = async (pdfPath) => {
    const data = new Uint8Array(readFileSync(pdfPath));
    return getPDFText({ data, verbosity: 0 }, '_');
};

// For --all: regenerate <base>.txt next to each .pdf in test/fixtures/.
const regenerateAll = async (dir = 'test/fixtures') => {
    const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
        console.log(`No PDFs found in ${dir}.`);
        return;
    }
    for (const pdf of pdfs) {
        const pdfPath = join(dir, pdf);
        const base = basename(pdf, extname(pdf));
        const flat = join(dir, `${base}.txt`);
        writeFileSync(flat, await extract(pdfPath));
        console.log(`✓ ${pdf} → ${base}.txt`);
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
