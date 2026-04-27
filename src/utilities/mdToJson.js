// Convert markdown to a heading-nested JSON object.
//
// The shape mirrors the document's heading hierarchy:
//
//     # H1                       →  { "H1": { ... } }
//     ## H2                      →     { "H2": { ... } }
//     text under H2              →        { "raw": "text\n\n" }
//
// Text content beneath a heading accumulates into a `raw` string. Trailing
// blank lines before another heading are preserved as `\n\n`; content at
// end-of-file gets no trailing whitespace.

export const mdToJson = (md) => {
    const root = {};
    const stack = [{ depth: 0, node: root }];
    let buffer = [];

    const flushBuffer = (followedByHeading) => {
        // Trim leading and trailing blank lines from the buffer.
        while (buffer.length > 0 && buffer[0] === '') buffer.shift();
        let hadTrailingBlank = false;
        while (buffer.length > 0 && buffer[buffer.length - 1] === '') {
            buffer.pop();
            hadTrailingBlank = true;
        }
        if (buffer.length === 0) { buffer = []; return; }

        const text = buffer.join('\n');
        const trailing = (followedByHeading && hadTrailingBlank) ? '\n\n' : '';
        const top = stack[stack.length - 1].node;
        top.raw = (top.raw || '') + text + trailing;
        buffer = [];
    };

    // Trim leading/trailing blank lines from the input before tokenizing.
    for (const line of md.trim().split('\n')) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);
        if (headingMatch) {
            flushBuffer(true);
            const depth = headingMatch[1].length;
            const title = headingMatch[2];
            while (stack[stack.length - 1].depth >= depth) stack.pop();
            const parent = stack[stack.length - 1].node;
            const node = {};
            parent[title] = node;
            stack.push({ depth, node });
        } else {
            buffer.push(line);
        }
    }
    flushBuffer(false); // EOF
    return root;
};
