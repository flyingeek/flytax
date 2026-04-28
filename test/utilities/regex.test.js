import { matchAll, matchFirst, matchLast } from '../../src/utilities/regex';

test("matchAll collects the first capture group of every match", () => {
    expect(matchAll("a1 b2 c3", /([a-z])(\d)/g)).toEqual(["a", "b", "c"]);
});

test("matchAll throws when no match is found and no default is given", () => {
    expect(() => matchAll("nothing here", /(\d+)/g))
        .toThrow("No match found");
});

test("matchAll returns [default] when no match is found", () => {
    expect(matchAll("nothing here", /(\d+)/g, "0")).toEqual(["0"]);
});

test("matchFirst returns the first capture group of the first match", () => {
    expect(matchFirst("a1 b2 c3", /([a-z])(\d)/)).toBe("a");
});

test("matchFirst throws when no match is found and no default is given", () => {
    expect(() => matchFirst("nothing here", /(\d+)/))
        .toThrow("No match found");
});

test("matchFirst returns the default when no match is found", () => {
    expect(matchFirst("nothing here", /(\d+)/, "fallback")).toBe("fallback");
});

test("matchLast returns the first capture group of the last match", () => {
    expect(matchLast("a1 b2 c3", /([a-z])(\d)/g)).toBe("c");
});

test("matchLast throws when no match is found and no default is given", () => {
    expect(() => matchLast("nothing here", /(\d+)/g))
        .toThrow("No match found");
});

test("matchLast returns the default when no match is found", () => {
    expect(matchLast("nothing here", /(\d+)/g, "fallback")).toBe("fallback");
});
