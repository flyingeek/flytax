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
    expect(rots1[0]).toEqual({
        isComplete: '<',
        nights: [ 'SVO', 'BOD'],
        countries: [ 'RU', 'FR'],
        start: '2019-01-30T09:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 2,
        summary: 'CDG-SVO-BOD' + CONTINUATION_MARK,
        dep: 'CDG',
        arr: CONTINUATION_MARK
    });
    rots1 = addIndemnities("2019", rots1, taxData, iso2FR);
    
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots2.length).toBe(1);
    expect(rots2[0]).toEqual({
        isComplete: '>',
        nights: ['BOD'],
        countries: ['FR'],
        start: '2019-02-01T01:00+01:00',
        end: '2019-02-01T10:00+01:00',
        days: 1,
        summary: CONTINUATION_MARK + "BOD-CDG",
        arr: 'CDG',
        dep: CONTINUATION_MARK
    });
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
    expect(rots1[0]).toEqual({
        isComplete: '<',
        error: false,
        nights: [ 'SVO', 'SVO'],
        stays: ['SVO'],
        countries: ["RU", "RU"],
        start: '2019-01-30T23:00+01:00',
        end: '2019-02-01T01:00+01:00',
        days: 2,
        summary: 'CDG-SVO' + CONTINUATION_MARK,
        dep: 'CDG',
        arr: CONTINUATION_MARK,
        "currencyFormula": "2 x 230EUR",
        "indemnity": 460,
        "formula": "2 x RU"

    });
    //01 SVO
    //02 BOD
    //03 BOD
    //04 TLS
    //05 TLS
    let rots2 = buildRots(flights2, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    rots2 = addIndemnities("2019", rots2, taxData, iso2FR);
    expect(rots2[0]).toEqual({
        isComplete: '>',
        error: false,
        nights: [ 'SVO', 'BOD', 'BOD', 'TLS', 'TLS'],
        countries: ["RU", "FR", "FR", "FR", "FR"],
        // note there is no stays prop here
        start: '2019-02-01T01:00+01:00',
        end: '2019-02-05T10:30+01:00',
        days: 5,
        summary: CONTINUATION_MARK + 'SVO-BOD-TLS-CDG',
        arr: 'CDG',
        dep: CONTINUATION_MARK,
        "currencyFormula": "1 x 230EUR + 4 x 156EUR",
        "indemnity": 854,
        "formula": "1 x RU + 4 x FR"

    });
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