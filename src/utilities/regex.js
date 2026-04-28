// Collect first group of every match. Returns Array of strings.
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

// Returns first group of first match. Throws if no match found and no default.
export const matchFirst = (text, re, bydefault) => {
    let match;
    if (null !== (match = re.exec(text))) return match[1];
    if (bydefault === undefined) throw new Error(`No match found for ${re}`);
    return bydefault;
};

// Returns first group of last match. Throws if no match found and no default.
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
