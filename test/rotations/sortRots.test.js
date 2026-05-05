import {sortRots} from '../../src/rotations';

const rot = (start, isComplete = '<>') => ({start, isComplete});

test("sortRots orders rotations chronologically by start", () => {
    const a = rot('2025-10-04T11:03+02:00');
    const b = rot('2025-10-18T15:13+02:00');
    const c = rot('2025-11-01T08:00+01:00');

    expect(sortRots([c, a, b])).toEqual([a, b, c]);
});

test("sortRots ties on start: '<' precedes '>' so straddler halves stay adjacent", () => {
    const startHalf = rot('2025-10-31T23:59+01:00', '<');
    const endHalf   = rot('2025-10-31T23:59+01:00', '>');

    expect(sortRots([endHalf, startHalf])).toEqual([startHalf, endHalf]);
});

test("sortRots ties on start: lexical order on isComplete (`<` < `<>` < `>`)", () => {
    const t = '2025-10-31T23:59+01:00';
    const begin = rot(t, '<');
    const full  = rot(t, '<>');
    const end   = rot(t, '>');

    expect(sortRots([end, full, begin])).toEqual([begin, full, end]);
});

test("sortRots returns a new array without mutating the input", () => {
    const a = rot('2025-10-18T15:13+02:00');
    const b = rot('2025-10-04T11:03+02:00');
    const input = [a, b];

    const sorted = sortRots(input);

    expect(input).toEqual([a, b]);          // input untouched
    expect(sorted).toEqual([b, a]);         // result is sorted
    expect(sorted).not.toBe(input);         // not the same reference
});

test("sortRots returns an empty array for an empty input", () => {
    expect(sortRots([])).toEqual([]);
});

test("sortRots is stable across multiple distinct months", () => {
    const dec = rot('2024-12-31T15:33+01:00', '<');
    const jan = rot('2026-01-01T01:00+01:00', '>');
    const jun = rot('2025-06-15T08:00+02:00', '<>');

    expect(sortRots([jan, jun, dec])).toEqual([dec, jun, jan]);
});
