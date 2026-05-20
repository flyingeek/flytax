import { isTransaviaPayslip, payParser } from './payParser';
import { isTransaviaPV, pvParser } from './pvParser';

/**
 * Ordered list of detectors covering Transavia France document types.
 *
 * Order matters — earlier detectors win. The payslip detector runs
 * first because its `BULLETIN DE PAIE` marker is more specific than
 * any PV anchor, and a TO payslip should never fall through to the
 * PV parser.
 *
 * @type {import('../airfrance/index.js').Detector[]}
 */
export const transaviaDetectors = [
    { match: isTransaviaPayslip, parse: payParser },
    { match: isTransaviaPV,      parse: pvParser  },
];
