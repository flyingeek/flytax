import { airfranceDetectors } from './airfrance';

const detectors = [...airfranceDetectors];

/**
 * Dispatch a piece of extracted PDF text to the first matching parser.
 *
 * Iterates the registered detectors in order; the first one whose
 * `match` returns true wins, and its `parse` produces the result
 * envelope(s). Files that match nothing fall through to a
 * "fichier non reconnu" error envelope.
 *
 * Each parser returns an array of result objects so the same call can
 * yield both a primary result and accompanying warnings.
 *
 * @param {string} text - Extracted PDF text.
 * @param {string} fileName
 * @param {number} fileOrder - Position in the upload batch.
 * @param {string} taxYear - 4-digit year of the declaration.
 * @param {Object} taxData
 * @param {string[]} base - Base IATA codes, e.g. ["CDG", "ORY"].
 * @param {Function} tzConverter - Time-zone converter.
 * @returns {Array<object>}
 */
export const router = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const ctx = { fileName, fileOrder, taxYear, taxData, base, tzConverter };

    for (const { match, parse } of detectors) {
        if (match(text, ctx)) return parse(text, ctx);
    }

    return [{
        type: 'error',
        msg: 'fichier non reconnu',
        fileName,
        fileOrder,
        content: text,
    }];
};
