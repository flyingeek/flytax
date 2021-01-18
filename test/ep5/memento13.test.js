/*
 * Variations based on the exemple 13 of the Memento
 *
 */

import {buildRots, iso2FR, addIndemnities, iata2country, numberOfDays, lastDayInMonthISO, mergeRots} from '../../src/parsers/ep5Parser';
import taxData from "../data/dataTest.json";
import {jest} from '@jest/globals';
test("memento13 arrival dxb next day", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-07-03T18:00Z", "arr": "DXB" ,"end": "2019-07-04T03:00Z"},
        {"stop":"xx,xx", "dep": "DXB", "start": "2019-07-05T08:00Z", "arr": "HKG" ,"end": "2019-07-05T19:00Z"},
        {"stop":"xx,xx", "dep": "HKG", "start": "2019-07-07T19:00Z", "arr": "CDG" ,"end": "2019-07-08T05:00Z"}
    ];
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(console.log.mock.calls.length).toBe(0);
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'HKG', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('2 x AE + 4 x HK');
});

test("memento13 arrival hkg next day", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-07-03T15:00Z", "arr": "DXB" ,"end": "2019-07-03T21:00Z"},
        {"stop":"xx,xx", "dep": "DXB", "start": "2019-07-05T16:00Z", "arr": "HKG" ,"end": "2019-07-06T03:00Z"},
        {"stop":"xx,xx", "dep": "HKG", "start": "2019-07-07T19:00Z", "arr": "CDG" ,"end": "2019-07-08T05:00Z"}
    ];
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(console.log.mock.calls.length).toBe(0);
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 arrival dxb next day hkg next day", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-07-03T18:00Z", "arr": "DXB" ,"end": "2019-07-04T03:00Z"},
        {"stop":"xx,xx", "dep": "DXB", "start": "2019-07-05T16:00Z", "arr": "HKG" ,"end": "2019-07-06T03:00Z"},
        {"stop":"xx,xx", "dep": "HKG", "start": "2019-07-07T19:00Z", "arr": "CDG" ,"end": "2019-07-08T05:00Z"}
    ];
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(console.log.mock.calls.length).toBe(0);
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 returns CDG same day", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-07-03T15:00Z", "arr": "DXB" ,"end": "2019-07-03T21:00Z"},
        {"stop":"xx,xx", "dep": "DXB", "start": "2019-07-05T08:00Z", "arr": "HKG" ,"end": "2019-07-05T19:00Z"},
        {"stop":"xx,xx", "dep": "HKG", "start": "2019-07-07T09:00Z", "arr": "CDG" ,"end": "2019-07-07T17:00Z"}
    ];
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(console.log.mock.calls.length).toBe(0);
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('2 x AE + 3 x HK');
});

test("memento13 mergeRots #1", () => {
    const flights1 = [
        { stop: 'xx,xx', dep: 'CDG', start: '2019-06-26T15:00Z', arr: 'DXB', end: '2019-06-26T21:00Z' },
        { stop: 'xx,xx', dep: 'DXB', start: '2019-06-28T08:00Z', arr: 'HKG', end: '2019-06-28T19:00Z' },
        { stop: 'xx,xx', dep: 'HKG', start: '2019-06-30T19:00Z', arr: 'CDG', end: '2019-06-30T24:00Z' }
    ];
    const flights2 = [
        { stop: 'xx,xx', dep: 'HKG', start: '2019-07-01T00:00Z', arr: 'CDG', end: '2019-07-01T05:00Z' }
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1[0].stays).toEqual(['DXB', 'DXB', 'HKG', 'HKG']);
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].stays).toEqual([]);
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 mergeRots #2", () => {
    const flights1 = [
        { stop: 'xx,xx', dep: 'CDG', start: '2019-06-27T15:00Z', arr: 'DXB', end: '2019-06-27T21:00Z' },
        { stop: 'xx,xx', dep: 'DXB', start: '2019-06-29T08:00Z', arr: 'HKG', end: '2019-06-29T19:00Z' }
    ];
    const flights2 = [
        { stop: 'xx,xx', dep: 'HKG', start: '2019-07-01T19:00Z', arr: 'CDG', end: '2019-07-02T05:00Z' }
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1[0].stays).toEqual(['DXB', 'DXB', 'HKG', 'HKG']);
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].stays).toEqual([]);
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 mergeRots #3", () => {
    const flights1 = [
        { stop: 'xx,xx', dep: 'CDG', start: '2019-06-28T15:00Z', arr: 'DXB', end: '2019-06-28T21:00Z' },
        { stop: 'xx,xx', dep: 'DXB', start: '2019-06-30T08:00Z', arr: 'HKG', end: '2019-06-30T19:00Z' }
    ];
   const flights2 = [
        {
        stop: 'xx,xx', dep: 'HKG', start: '2019-07-02T19:00Z', arr: 'CDG', end: '2019-07-03T05:00Z' }
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1[0].stays).toEqual(['DXB', 'DXB', 'HKG']);
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].stays).toEqual(['HKG']);
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 mergeRots #4", () => {
    const flights1 = [
        { stop: 'xx,xx', dep: 'CDG', start: '2019-06-29T15:00Z', arr: 'DXB', end: '2019-06-29T21:00Z' }
    ];
  const flights2 = [
        { stop: 'xx,xx', dep: 'DXB', start: '2019-07-01T08:00Z', arr: 'HKG', end: '2019-07-01T19:00Z' },
        { stop: 'xx,xx', dep: 'HKG', start: '2019-07-03T19:00Z', arr: 'CDG', end: '2019-07-04T05:00Z' }
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1[0].stays).toEqual(['DXB', 'DXB']);
    expect(rots1[0].nights).toEqual(['DXB', 'DXB']);
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].stays).toEqual(['HKG', 'HKG']);
    expect(rots2[0].nights).toEqual(['HKG', 'HKG', 'HKG', 'HKG']);
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

test("memento13 mergeRots #5", () => {
    const flights1 = [
        { stop: 'xx,xx', dep: 'CDG', start: '2019-06-30T15:00Z', arr: 'DXB', end: '2019-06-30T21:00Z' }
    ];
  const flights2 = [
        { stop: 'xx,xx', dep: 'DXB', start: '2019-07-02T08:00Z', arr: 'HKG', end: '2019-07-02T19:00Z' },
        { stop: 'xx,xx', dep: 'HKG', start: '2019-07-04T19:00Z', arr: 'CDG', end: '2019-07-05T05:00Z' }
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1[0].stays).toEqual(['DXB']);
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].stays).toEqual(['DXB', 'HKG', 'HKG']);
    const originalLog = console.log;
    console.log = jest.fn();
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    console.log = originalLog;
    expect(rots.length).toBe(1);
    expect(rots[0].nights).toEqual([ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ]);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
});

