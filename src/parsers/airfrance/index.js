import { ep4Parser, isEP4 } from './ep4Parser';
import { ep5Parser, isEP5 } from './ep5Parser';
import { isNuitees, nightsAFParser } from './nightsParser';
import { isPayslip, payParser } from './payParser';

/**
 * @typedef {Object} ParserContext
 * @property {string} fileName
 * @property {number} fileOrder - Position in the upload batch.
 * @property {string} taxYear - 4-digit year of the declaration.
 * @property {Object} taxData - Tax-year data (countries, exchange rates).
 * @property {string[]} base - Base IATA codes, e.g. ["CDG", "ORY"].
 * @property {Function} tzConverter - Time-zone converter, e.g. iso2FR.
 */

/**
 * @typedef {Object} Detector
 * @property {(text: string, ctx: ParserContext) => boolean} match
 *   Cheap test that decides whether this detector applies.
 * @property {(text: string, ctx: ParserContext) => Array<object>} parse
 *   Produces the result envelope(s).
 */

/**
 * Ordered list of detectors covering Air France document types.
 *
 * The router iterates these in order and stops at the first detector
 * whose match returns true. Each parser owns its full responsibility
 * (envelope shape, year discrimination, format dispatch), so this
 * file stays purely declarative.
 *
 * Order matters — earlier detectors win:
 *
 *   1. Payslip              most-specific marker
 *   2. EP5                  ahead of nuitées so a hypothetical PDF
 *                           carrying both markers parses as EP5
 *                           (the richer payload)
 *   3. Nuitées              parser internally checks the year
 *   4. EP4 fallback         most permissive, comes last
 *
 * @type {Detector[]}
 */
export const airfranceDetectors = [
    { match: isPayslip, parse: payParser      },
    { match: isEP5,     parse: ep5Parser      },
    { match: isNuitees, parse: nightsAFParser },
    { match: isEP4,     parse: ep4Parser      },
];
