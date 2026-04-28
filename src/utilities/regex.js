// Regex helpers that share a contract: each returns the first capture group
// of one or more matches, falling back to a caller-supplied default or
// throwing when no match is found and no default is given.

/**
 * Collect the first capture group of every match.
 *
 * @param {string} text
 * @param {RegExp} re - Must use the `g` flag to iterate.
 * @param {string} [bydefault] - Returned as `[bydefault]` if no match is found.
 * @returns {string[]}
 * @throws {Error} When no match is found and no default is given.
 */
export const matchAll = (text, re, bydefault) => {
    const results = [];
    let match;
    while (null !== (match = re.exec(text))) {
        results.push(match[1]);
    }
    if (results.length > 0) return results;
    if (bydefault === undefined) throw new Error(`No match found for ${re}`);
    return [bydefault];
};

/**
 * Return the first capture group of the first match.
 *
 * @param {string} text
 * @param {RegExp} re
 * @param {string} [bydefault] - Returned if no match is found.
 * @returns {string}
 * @throws {Error} When no match is found and no default is given.
 */
export const matchFirst = (text, re, bydefault) => {
    let match;
    if (null !== (match = re.exec(text))) return match[1];
    if (bydefault === undefined) throw new Error(`No match found for ${re}`);
    return bydefault;
};

/**
 * Return the first capture group of the last match.
 *
 * @param {string} text
 * @param {RegExp} re - Must use the `g` flag to iterate.
 * @param {string} [bydefault] - Returned if no match is found.
 * @returns {string}
 * @throws {Error} When no match is found and no default is given.
 */
export const matchLast = (text, re, bydefault) => {
    let match;
    let lastMatch;
    while (null !== (match = re.exec(text))) {
        lastMatch = match;
    }
    if (lastMatch) return lastMatch[1];
    if (bydefault === undefined) throw new Error(`No match found for ${re}`);
    return bydefault;
};
