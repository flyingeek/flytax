import {buildRots, iso2FR, addIndemnities, iata2country, FORMULA_ERROR} from '../../src/parsers/ep5Parser';
import taxData from "../data/dataTest.json";
import {jest} from '@jest/globals';

test("1 ON stop long France", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-01T12:00Z", "arr": "BOD" ,"end": "2019-01-01T13:00Z"},
        {"stop":"xx,xx", "dep": "BOD", "start": "2019-01-01T20:01Z", "arr": "CDG" ,"end": "2019-01-01T21:10Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'BOD' ],
        countries: [ 'FR' ],
        start: '2019-01-01T13:00+01:00',
        end: '2019-01-01T22:10+01:00',
        days: 1,
        summary: 'CDG-BOD-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156/2);
    expect(rots[0].formula).toBe('0.5 x FR');
});

test("2 ON straddling civil month (but not gmt month)", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T19:00Z", "arr": "BOD" ,"end": "2019-01-31T20:15Z"},
        {"stop":"x,xx", "dep": "BOD", "start": "2019-01-31T22:15Z", "arr": "CDG" ,"end": "2019-01-31T23:30Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: ['CDG', 'CDG'],
        countries: ['FR', 'FR'],
        start: '2019-01-31T20:00+01:00',
        end: '2019-02-01T00:30+01:00',
        days: 2, // rot wil not appear next month so count also arrival day
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156 * 1.5);
    expect(rots[0].formula).toBe("1.5 x FR");
});

test("2 ON arrival at 00:00Z", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T19:00Z", "arr": "SVO" ,"end": "2019-01-31T20:15Z"},
        {"stop":"x,xx", "dep": "SVO", "start": "2019-01-31T22:15Z", "arr": "CDG" ,"end": "2019-02-01T00:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: ['CDG', 'CDG'],
        countries: ['FR', 'FR'],
        start: '2019-01-31T20:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 2, // rot wil not appear next month so count also arrival day
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156 * 1.5);
    expect(rots[0].formula).toBe("1.5 x FR");
});

//Rot Vancouver PPT
test("10 ON YVR PPT YVR", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-09-01T17:05Z", "arr": "YVR" ,"end": "2019-09-02T03:02Z"},
        {"stop":"xx,xx", "dep": "YVR", "start": "2019-09-04T04:46Z", "arr": "PPT" ,"end": "2019-09-04T14:29Z"},
        {"stop":"xx,xx", "dep": "PPT", "start": "2019-09-06T17:28Z", "arr": "YVR" ,"end": "2019-09-07T02:54Z"},
        {"stop":"xx,xx", "dep": "LAX", "start": "2019-09-10T05:20Z", "arr": "CDG" ,"end": "2019-09-10T14:35Z"}
    ];
    //  1 YVR en vol => 1ère destination
    //  2 YVR
    //  3 YVR
    //  4 PPT
    //  5 PPT
    //  6 ??? PPT (SNPL) YVR (SNPNC) en vol => nuit précédente => pour moi PPT
    //  7 YVR
    //  8 YVR
    //  9 YVR
    // 10 YVR par convention nuit précédente
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    //console.log(rots[0]);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'YVR', 'YVR', 'YVR', 'PPT', 'PPT', 'PPT', 'YVR', 'YVR', 'YVR', 'YVR'],
        countries: [ 'VV', 'VV', 'VV', 'PF', 'PF', 'PF', 'VV', 'VV', 'VV', 'VV'],
        start: '2019-09-01T19:05+02:00',
        end: '2019-09-10T16:35+02:00',
        days: 10,
        summary: 'CDG-YVR-PPT-YVR-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x VV + 3 x PF + 4 x VV');
    expect(rots[0].indemnity).toBeCloseTo((7 * 260 / 1.5057) + (3 * 120), 1);
});

test("3ON SVO du soir", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-13T22:00Z", "arr": "SVO" ,"end": "2019-01-14T01:30Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-15T18:01Z", "arr": "CDG" ,"end": "2019-01-15T21:10Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO', 'SVO', 'SVO' ],
        countries: [ 'RU', 'RU', 'RU' ],
        start: '2019-01-13T23:00+01:00',
        end: '2019-01-15T22:10+01:00',
        days: 3,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(3 * 230);
    expect(rots[0].formula).toBe('3 x RU');
});

test("4ON SVO du soir retour après 2h", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-13T22:00Z", "arr": "SVO" ,"end": "2019-01-14T01:30Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-15T22:01Z", "arr": "CDG" ,"end": "2019-01-16T03:30Z"}
    ];
    //13 SVO
    //14 SVO
    //15 SVO
    //16 SVO
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO', 'SVO', 'SVO', 'SVO' ],
        countries: [ 'RU', 'RU', 'RU', 'RU' ],
        start: '2019-01-13T23:00+01:00',
        end: '2019-01-16T04:30+01:00',
        days: 4,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(4 * 230);
    expect(rots[0].formula).toBe('4 x RU');
});

test('indemnity change during rotation' , () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-08-30T21:00Z", "arr": "JFK" ,"end": "2019-01-31T07:30Z"},
        {"stop":"xx,xx", "dep": "JFK", "start": "2019-09-02T22:01Z", "arr": "CDG" ,"end": "2019-09-03T03:30Z"}
    ];

    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots = addIndemnities("2019", rots, taxData, iso2FR);

    expect(rots[0].indemnity).toBeCloseTo(1714.48, 1);
    expect(rots[0].formula).toBe('5 x NY');
    expect(rots[0].currencyFormula).toBe('(2 x 320USD + 3 x 450USD)');
});

test('unknown airport' , () => {
    console.error = jest.fn();
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-08-30T21:00Z", "arr": "???" ,"end": "2019-01-31T07:30Z"},
        {"stop":"xx,xx", "dep": "???", "start": "2019-09-02T22:01Z", "arr": "CDG" ,"end": "2019-09-03T03:30Z"}
    ];

    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(console.error.mock.calls[0][0]).toBe('Code IATA inconnu ???');
    expect(rots[0].indemnity).toBe(0);
    expect(rots[0].formula.endsWith(FORMULA_ERROR)).toBe(true);
    expect(rots[0].error).toBe(true);
});

test('unknown country' , () => {
    console.error = jest.fn();
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-08-30T21:00Z", "arr": "SYD" ,"end": "2019-01-31T07:30Z"},
        {"stop":"xx,xx", "dep": "SYD", "start": "2019-09-02T22:01Z", "arr": "CDG" ,"end": "2019-09-03T03:30Z"}
    ];

    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(console.error.mock.calls[0][0]).toBe('Données pays manquantes pour AU');
    expect(rots[0].countries).toEqual([ 'AU', 'AU', 'AU', 'AU', 'AU' ]);
    expect(rots[0].indemnity).toBe(0);
    expect(rots[0].formula.endsWith(FORMULA_ERROR)).toBe(true);
    expect(rots[0].error).toBe(true);
});

test('no matching date indemnity amount' , () => {
    console.error = jest.fn();
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2018-08-30T21:00Z", "arr": "JFK" ,"end": "2018-01-31T07:30Z"},
        {"stop":"xx,xx", "dep": "JFK", "start": "2018-09-02T22:01Z", "arr": "CDG" ,"end": "2018-09-03T03:30Z"}
    ];

    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots = addIndemnities("2018", rots, taxData, iso2FR);
    expect(console.error.mock.calls[0][0]).toBe("Pas d'indemnité définie pour NEW-YORK CITY au 2018-09-03");
    expect(rots[0].indemnity).toBe(0);
    expect(rots[0].formula.endsWith(FORMULA_ERROR)).toBe(true);
    expect(rots[0].error).toBe(true);
});
