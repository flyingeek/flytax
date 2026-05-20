import { isTransaviaPV, pvParser } from './pvParser';

/**
 * Ordered list of detectors covering Transavia France document types.
 *
 * Order matters — earlier detectors win.
 *
 * @type {import('../airfrance/index.js').Detector[]}
 */
export const transaviaDetectors = [
    { match: isTransaviaPV, parse: pvParser },
];
