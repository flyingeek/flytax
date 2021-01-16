import {buildRots, iso2FR, iata2country, addIndemnities, WITHIN_BASE_TEXT, CONTINUATION_MARK} from '../../src/parsers/ep5Parser';
import taxData from "../data/dataTest.json";


test("single day rotation, one leg base->base", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "ORY", "start": "2019-01-01T12:00Z", "arr": "CDG" ,"end": "2019-01-01T13:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [], // no nights as we are not moving out of Base
        countries: [], // no nights as we are not moving out of Base
        start: '2019-01-01T13:00+01:00',
        end: '2019-01-01T14:00+01:00',
        days: 1,
        summary: 'ORY-CDG',
        dep: 'ORY',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(0);
    expect(rots[0].formula).toBe(WITHIN_BASE_TEXT);
});

test("single day rotation, first straddling flight of an EP5 with a base arrival", () => {
    const flights = [
        {"stop":"0,00", "dep": "BOD", "start": "2019-01-01T00:00Z", "arr": "CDG" ,"end": "2019-01-01T01:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '>',
        nights: ['BOD'],
        countries: ['FR'],
        start: '2019-01-01T01:00+01:00',
        end: '2019-01-01T02:00+01:00',
        days: 1,
        summary: CONTINUATION_MARK + 'BOD-CDG',
        arr: 'CDG',
        dep: CONTINUATION_MARK
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156/2);
    expect(rots[0].formula).toBe("0.5 x FR");
});


test("single day rotation, only one leg straddling gmt month, stopover", () => {
    const flights = [
        {"stop":"x,xx", "dep": "CDG", "start": "2019-01-31T21:00Z", "arr": "JFK" ,"end": "2019-01-31T24:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<',
        nights: ['JFK'],
        stays: ['JFK'],
        countries: ['NY'],
        start: '2019-01-31T22:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 1,
        summary: 'CDG-JFK' + CONTINUATION_MARK,
        dep: 'CDG',
        arr: CONTINUATION_MARK
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(320/1.1607, 2);
    expect(rots[0].formula).toBe("1 x NY");
});

test("single day rotation, only one leg straddling civil month (but not gmt month), stopover", () => {
    const flights = [
        {"stop":"x,xx", "dep": "CDG", "start": "2019-01-31T21:00Z", "arr": "JFK" ,"end": "2019-01-31T23:30Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<',
        nights: ['JFK'],
        stays: ['JFK'],
        countries: ['NY'],
        start: '2019-01-31T22:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 1,
        summary: 'CDG-JFK' + CONTINUATION_MARK,
        dep: 'CDG',
        arr: CONTINUATION_MARK
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(320/1.1607, 2);
    expect(rots[0].formula).toBe("1 x NY");
});

test("two days rotation, only one leg, no stopover out of base", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "ORY", "start": "2019-01-01T12:00Z", "arr": "CDG" ,"end": "2019-01-02T00:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [], // no nights as we are not moving out of Base
        countries: [], // no nights as we are not moving out of Base
        start: '2019-01-01T13:00+01:00',
        end: '2019-01-02T01:00+01:00',
        days: 2,
        summary: 'ORY-CDG',
        dep: 'ORY',
        arr: 'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(0);
    expect(rots[0].formula).toBe(WITHIN_BASE_TEXT);
});

test("stopover 3 days before the end of the month", () => {
    const flights = [
        {"stop":"x,xx", "dep": "CDG", "start": "2019-01-29T12:00Z", "arr": "JFK" ,"end": "2019-01-29T21:30Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<',
        nights: ['JFK', 'JFK', 'JFK'],
        stays: ['JFK', 'JFK', 'JFK'],
        countries: ['NY', 'NY', 'NY'],
        start: '2019-01-29T13:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 3,
        summary: 'CDG-JFK' + CONTINUATION_MARK,
        dep: 'CDG',
        arr: CONTINUATION_MARK
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(320*3/1.1607, 1);
    expect(rots[0].formula).toBe("3 x NY");
});