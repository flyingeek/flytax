import {buildRots, iso2FR, iata2country, addIndemnities, CONTINUATION_MARK, mergeRots} from '../../src/parsers/ep5Parser';
import taxData from "../data/dataTest.json";

test('mergeRots', () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-30T08:00Z", "arr": "SVO" ,"end": "2019-01-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-31T15:00Z", "arr": "CDG" ,"end": "2019-01-31T18:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T19:00Z", "arr": "BOD" ,"end": "2019-01-31T20:00Z"}
    ];
    const flights2 = [
        {"stop":"x,xx", "dep": "BOD", "start": "2019-02-01T08:00Z", "arr": "CDG" ,"end": "2019-02-01T09:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});

    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD'],
        countries: ["RU", "FR", "FR"],
        start: '2019-01-30T09:00+01:00',
        end: '2019-02-01T10:00+01:00',
        days: 3,
        summary: 'CDG-SVO-BOD-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 230EUR + 2 x 156EUR",
        "formula": "1 x RU + 2 x FR",
        "indemnity": 542
    });
});

test("2 ON SVO BOD straddling check not MC", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-30T08:00Z", "arr": "SVO" ,"end": "2019-01-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-31T15:00Z", "arr": "CDG" ,"end": "2019-01-31T18:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T19:00Z", "arr": "BOD" ,"end": "2019-01-31T20:00Z"}
    ];
    const flights2 = [
        {"stop":"x,xx", "dep": "BOD", "start": "2019-02-01T08:00Z", "arr": "CDG" ,"end": "2019-02-01T09:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1.length).toBe(1);
    expect(rots1[0].isComplete).toBe('<');
    expect(rots1[0].days).toBe(2);
    expect(rots1[0].nights).toEqual([ 'SVO', 'BOD']);
    expect(rots1[0].countries).toEqual([ 'RU', 'FR']);
    //expect(rots1[0].stays).toEqual(['SVO', 'BOD']);
    expect(rots1[0].start).toBe('2019-01-30T09:00+01:00');
    expect(rots1[0].end).toBe('2019-02-01T01:00+01:00');
    expect(rots1[0].summary).toBe('CDG-SVO-BOD' + CONTINUATION_MARK);
    expect(rots1[0].dep).toBe('CDG');
    expect(rots1[0].arr).toBe(CONTINUATION_MARK);
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2.length).toBe(1);
    expect(rots2[0].isComplete).toBe('>');
    expect(rots2[0].days).toBe(1);
    expect(rots2[0].nights).toEqual(['BOD']);
    expect(rots2[0].countries).toEqual(['FR']);
    expect(rots2[0].start).toBe('2019-02-01T01:00+01:00');
    expect(rots2[0].end).toBe('2019-02-01T10:00+01:00');
    expect(rots2[0].summary).toBe(CONTINUATION_MARK + "BOD-CDG");
    expect(rots2[0].dep).toBe(CONTINUATION_MARK);
    expect(rots2[0].arr).toBe('CDG');
    rots2 = addIndemnities("2019", rots2, taxData, iso2FR);
    
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD'],
        countries: ["RU", "FR", "FR"],
        start: '2019-01-30T09:00+01:00',
        end: '2019-02-01T10:00+01:00',
        days: 3,
        summary: 'CDG-SVO-BOD-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 230EUR + 2 x 156EUR",
        "formula": "1 x RU + 2 x FR",
        "indemnity": 542,
    });
    expect(rots[0].formula).toBe('1 x RU + 2 x FR');
});

test("attempts successive merge to check results does not change", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-30T08:00Z", "arr": "SVO" ,"end": "2019-01-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-31T15:00Z", "arr": "CDG" ,"end": "2019-01-31T18:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T19:00Z", "arr": "BOD" ,"end": "2019-01-31T20:00Z"}
    ];
    const flights2 = [
        {"stop":"x,xx", "dep": "BOD", "start": "2019-02-01T08:00Z", "arr": "CDG" ,"end": "2019-02-01T09:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);

    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots2 = addIndemnities("2019", rots2, taxData, iso2FR);
    
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    const expected = {
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD'],
        countries: ["RU", "FR", "FR"],
        start: '2019-01-30T09:00+01:00',
        end: '2019-02-01T10:00+01:00',
        days: 3,
        summary: 'CDG-SVO-BOD-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 230EUR + 2 x 156EUR",
        "formula": "1 x RU + 2 x FR",
        "indemnity": 542
    };
    expect(rots[0]).toEqual(expected);
    //
    // Try a second time, check that results are the same, otherwise there is a deep clone failure somewhere
    //
    rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots[0]).toEqual(expected);
});

test('2 0N ending at 00:30+01:00 next year for 2019', () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-31T08:00Z", "arr": "SVO" ,"end": "2019-12-31T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T23:30Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    expect(rots1[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: ['CDG', 'CDG'],
        countries: ['FR', 'FR'],
        start: '2019-12-31T09:00+01:00',
        end: '2020-01-01T00:30+01:00',
        days: 2,
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 156EUR",
        "formula": "1 x FR ¹",
        "indemnity": 156
    });
});
test('2 0N short stop SVO ending at 00:30+01:00 next year for 2020', () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-31T08:00Z", "arr": "SVO" ,"end": "2019-12-31T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T23:30Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2020", rots1, taxData, iso2FR);
    expect(rots1[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: ['CDG', 'CDG'],
        countries: ['FR', 'FR'],
        start: '2019-12-31T09:00+01:00',
        end: '2020-01-01T00:30+01:00',
        days: 2,
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "0.5 x 156EUR",
        "formula": "0.5 x FR ¹",
        "indemnity": 78
    });
});
test('3 0N SVO ending at 00:30+01:00 next year for 2019', () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-30T08:00Z", "arr": "SVO" ,"end": "2019-12-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T23:30Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    expect(rots1[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: ['SVO', 'SVO', 'SVO'],
        countries: ['RU', 'RU', 'RU'],
        start: '2019-12-30T09:00+01:00',
        end: '2020-01-01T00:30+01:00',
        days: 3,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "2 x 230EUR",
        "formula": "2 x RU ¹",
        "indemnity": 460
    });
});
test('3 0N SVO ending at 00:30+01:00 next year for 2020', () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-30T08:00Z", "arr": "SVO" ,"end": "2019-12-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T23:30Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2020", rots1, taxData, iso2FR);
    expect(rots1[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: ['SVO', 'SVO', 'SVO'],
        countries: ['RU', 'RU', 'RU'],
        start: '2019-12-30T09:00+01:00',
        end: '2020-01-01T00:30+01:00',
        days: 3,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 230EUR",
        "formula": "1 x RU ¹",
        "indemnity": 230
    });
});
test("2 ON SVO BOD straddling years check not MC for 2020", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-30T08:00Z", "arr": "SVO" ,"end": "2019-12-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T18:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-31T19:00Z", "arr": "BOD" ,"end": "2019-12-31T20:00Z"}
    ];
    const flights2 = [
        {"stop":"x,xx", "dep": "BOD", "start": "2020-01-01T08:00Z", "arr": "CDG" ,"end": "2020-01-01T09:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2020", rots1, taxData, iso2FR);
    
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots2 = addIndemnities("2020", rots2, taxData, iso2FR);
    let rots = mergeRots([rots1, rots2], "2020", taxData, iso2FR);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD'],
        countries: ["RU", "FR", "FR"],
        start: '2019-12-30T09:00+01:00',
        end: '2020-01-01T10:00+01:00',
        days: 3,
        summary: 'CDG-SVO-BOD-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 156EUR",
        "formula": "1 x FR ¹",
        "indemnity": 156,
    });
});
test("2 ON SVO BOD straddling years check for 2019", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-30T08:00Z", "arr": "SVO" ,"end": "2019-12-30T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-12-31T15:00Z", "arr": "CDG" ,"end": "2019-12-31T18:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-12-31T19:00Z", "arr": "BOD" ,"end": "2019-12-31T20:00Z"}
    ];
    const flights2 = [
        {"stop":"x,xx", "dep": "BOD", "start": "2020-01-01T08:00Z", "arr": "CDG" ,"end": "2020-01-01T09:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots2 = addIndemnities("2019", rots2, taxData, iso2FR);
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD'],
        countries: ["RU", "FR", "FR"],
        start: '2019-12-30T09:00+01:00',
        end: '2020-01-01T10:00+01:00',
        days: 3,
        summary: 'CDG-SVO-BOD-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "1 x 230EUR + 1 x 156EUR",
        "formula": "1 x RU + 1 x FR ¹",
        "indemnity": 386,
    });
});

test("7ON SVO du soir", () => {
    // This test verify that we require the isBase check in the first line of StandbyDays computation
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-30T22:00Z", "arr": "SVO" ,"end": "2019-01-31T01:30Z"}
    ];
    const flights2 = [
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-02-01T22:01Z", "arr": "BOD" ,"end": "2019-02-02T03:30Z"},
        {"stop":"xx,xx", "dep": "BOD", "start": "2019-02-04T08:00Z", "arr": "CDG" ,"end": "2019-02-04T09:30Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-04T11:00Z", "arr": "TLS" ,"end": "2019-02-04T11:30Z"},
        {"stop":"xx,xx", "dep": "TLS", "start": "2019-02-05T08:00Z", "arr": "CDG" ,"end": "2019-02-05T09:30Z"},

    ];
    //30 SVO
    //31 SVO
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    expect(rots1[0].isComplete).toBe('<');
    expect(rots1[0].days).toBe(2);
    expect(rots1[0].nights).toEqual(['SVO', 'SVO']);
    expect(rots1[0].countries).toEqual(['RU', 'RU']);
    //expect(rots1[0].stays).toEqual(['SVO']);
    expect(rots1[0].start).toBe('2019-01-30T23:00+01:00');
    expect(rots1[0].end).toBe('2019-02-01T01:00+01:00');
    expect(rots1[0].summary).toBe('CDG-SVO' + CONTINUATION_MARK);
    expect(rots1[0].dep).toBe('CDG');
    expect(rots1[0].arr).toBe(CONTINUATION_MARK);
    //01 SVO
    //02 BOD
    //03 BOD
    //04 TLS
    //05 TLS
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots2 = addIndemnities("2019", rots2, taxData, iso2FR);
    expect(rots2[0].isComplete).toBe('>');
    expect(rots2[0].days).toBe(5);
    expect(rots2[0].nights).toEqual([ 'SVO', 'BOD', 'BOD', 'TLS', 'TLS']);
    expect(rots2[0].countries).toEqual(["RU", "FR", "FR", "FR", "FR"]);
    expect(rots2[0].start).toBe('2019-02-01T01:00+01:00');
    expect(rots2[0].end).toBe('2019-02-05T10:30+01:00');
    expect(rots2[0].summary).toBe(CONTINUATION_MARK + 'SVO-BOD-TLS-CDG');
    expect(rots2[0].dep).toBe(CONTINUATION_MARK);
    expect(rots2[0].arr).toBe('CDG');

    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'SVO', 'SVO', 'BOD', 'BOD', 'TLS', 'TLS'],
        countries: ["RU", "RU", "RU", "FR", "FR", "FR", "FR"],
        start: '2019-01-30T23:00+01:00',
        end: '2019-02-05T10:30+01:00',
        days: 7,
        summary: 'CDG-SVO-BOD-TLS-CDG',
        dep: 'CDG',
        arr:'CDG',
        "currencyFormula": "3 x 230EUR + 4 x 156EUR",
        "indemnity": 1314,
        "formula": "3 x RU + 4 x FR"

    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
});

test("2ON SVO check 0,00 CDG straddling", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T22:00Z", "arr": "SVO" ,"end": "2019-01-31T24:00Z"},
    ];
    const flights2 = [
        {"stop":"0,00", "dep": "CDG", "start": "2019-02-01T00:00Z", "arr": "SVO" ,"end": "2019-02-01T03:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-02-01T14:00Z", "arr": "CDG" ,"end": "2019-02-01T20:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO', 'SVO',],
        countries: [ 'RU', 'RU',],
        currencyFormula: "2 x 230EUR",
        start: '2019-01-31T23:00+01:00',
        end: '2019-02-01T21:00+01:00',
        days: 2,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG',
        error: false,
        formula: "2 x RU",
        indemnity: 460
    });
    expect(rots[0].indemnity).toBeCloseTo(2 * 230);
    expect(rots[0].formula).toBe('2 x RU');
});

test("2ON SVO check 0,00 SVO straddling", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T08:00Z", "arr": "SVO" ,"end": "2019-01-31T13:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-31T22:00Z", "arr": "CDG" ,"end": "2019-01-31T24:00Z"},
    ];
    const flights2 = [
        {"stop":"0,00", "dep": "SVO", "start": "2019-02-01T00:00Z", "arr": "CDG" ,"end": "2019-02-01T02:00Z"},
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO', 'SVO',],
        countries: [ 'RU', 'RU',],
        currencyFormula: "2 x 230EUR",
        start: '2019-01-31T09:00+01:00',
        end: '2019-02-01T03:00+01:00',
        days: 2,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG',
        error: false,
        formula: "2 x RU",
        indemnity: 460
    });
    expect(rots[0].indemnity).toBeCloseTo(2 * 230);
    expect(rots[0].formula).toBe('2 x RU');
});


test("single day rotation, last straddling flight of an EP5 with a base arrival", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T21:00Z", "arr": "BOD" ,"end": "2019-01-31T22:00Z"},
        {"stop":"xx,xx", "dep": "BOD", "start": "2019-01-31T23:00Z", "arr": "CDG" ,"end": "2019-01-31T24:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0].isComplete).toBe('<');
    expect(rots[0].days).toBe(1);
    expect(rots[0].nights).toEqual(['CDG']);
    expect(rots[0].countries).toEqual(['FR']);
    //expect(rots[0].stays).toEqual([]);
    expect(rots[0].start).toBe('2019-01-31T22:00+01:00');
    expect(rots[0].end).toBe('2019-02-01T01:00+01:00');
    expect(rots[0].summary).toBe('CDG' + CONTINUATION_MARK);
    expect(rots[0].dep).toBe('CDG');
    expect(rots[0].arr).toBe(CONTINUATION_MARK);
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156/2);
    expect(rots[0].formula).toBe("0.5 x FR");
});

test("single day rotation, last straddling flight of an EP5 with a base arrival SVO before", () => {
    const flights1 = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-30T18:00Z", "arr": "SVO" ,"end": "2019-01-30T22:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-31T15:00Z", "arr": "CDG" ,"end": "2019-01-31T19:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T21:00Z", "arr": "BOD" ,"end": "2019-01-31T22:00Z"},
        {"stop":"xx,xx", "dep": "BOD", "start": "2019-01-31T23:00Z", "arr": "CDG" ,"end": "2019-01-31T24:00Z"}
    ];
    let rots1 = buildRots(flights1, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots1.length).toBe(1);
    expect(rots1[0].isComplete).toBe('<');
    expect(rots1[0].days).toBe(2);
    expect(rots1[0].nights).toEqual(['SVO', 'SVO']);
    expect(rots1[0].countries).toEqual(['RU', 'RU']);
    //expect(rots1[0].stays).toEqual(['SVO']);
    expect(rots1[0].start).toBe('2019-01-30T19:00+01:00');
    expect(rots1[0].end).toBe('2019-02-01T01:00+01:00');
    expect(rots1[0].summary).toBe('CDG-SVO' + CONTINUATION_MARK);
    expect(rots1[0].dep).toBe('CDG');
    expect(rots1[0].arr).toBe(CONTINUATION_MARK);
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    expect(rots1[0].indemnity).toBe(460);
    expect(rots1[0].formula).toBe("2 x RU");
    const flights2 = [
        {"stop":"0,00", "dep": "BOD", "start": "2019-02-01T00:00Z", "arr": "CDG" ,"end": "2019-02-01T04:00Z"}
    ];
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2[0].isComplete).toBe('>');
    expect(rots2[0].days).toBe(1);
    expect(rots2[0].nights).toEqual(['BOD']);
    expect(rots2[0].countries).toEqual(['FR']);
    //expect(rots2[0].stays).toEqual([]);
    expect(rots2[0].start).toBe('2019-02-01T01:00+01:00');
    expect(rots2[0].end).toBe('2019-02-01T05:00+01:00');
    expect(rots2[0].summary).toBe(CONTINUATION_MARK + 'BOD-CDG');
    expect(rots2[0].dep).toBe(CONTINUATION_MARK);
    expect(rots2[0].arr).toBe('CDG');
    let rots = mergeRots([rots1, rots2], "2019", taxData, iso2FR);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        error: false,
        nights: [ 'SVO', 'SVO', 'SVO'],
        countries: ["RU", "RU", "RU"],
        start: '2019-01-30T19:00+01:00',
        end: '2019-02-01T05:00+01:00',
        days: 3,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr: 'CDG',
        "currencyFormula": "3 x 230EUR",
        "formula": "3 x RU",
        "indemnity": 690,
    });
});

test("single day rotation, last straddling flight of an EP5 with a base arrival and accross civil month", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-31T21:00Z", "arr": "BOD" ,"end": "2019-01-31T22:00Z"},
        {"stop":"xx,xx", "dep": "BOD", "start": "2019-01-31T23:00Z", "arr": "CDG" ,"end": "2019-01-31T23:30Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: ['CDG', 'CDG'],
        countries: ['FR', 'FR'],
        start: '2019-01-31T22:00+01:00',
        end: '2019-02-01T00:30+01:00',
        days: 2,
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr: 'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156+78);
    expect(rots[0].formula).toBe("1.5 x FR");
});
