/*
 * All examples found in the Memento Fiscal SNPL
 *
 * SNPNC rules:
 * Comptabiliser le nombre de jours « ON » de la rotation.
 * Compter 1 indemnité du pays de destination pour la 1ère journée
 * + 1 indemnité du pays dans lequel on découche pour chaque journée d’engagement supplémentaire.
 * Pour la dernière journée d’engagement compter 1 indemnité du pays du dernier découché.
 */

import {buildRots, iso2FR, addIndemnities, iata2country} from '../../src/parsers/ep5Parser';
import taxData from "../data/dataTest.json";
import {jest} from '@jest/globals';

//Memento Fiscal Exemple1
test("1 ON France", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-10T08:00Z", "arr": "MRS" ,"end": "2019-01-10T09:00Z"},
        {"stop":"xx,xx", "dep": "MRS", "start": "2019-01-10T10:00Z", "arr": "ORY" ,"end": "2019-01-10T11:00Z"},
        {"stop":"xx,xx", "dep": "ORY", "start": "2019-01-10T12:00Z", "arr": "TLS" ,"end": "2019-01-10T13:00Z"},
        {"stop":"xx,xx", "dep": "TLS", "start": "2019-01-10T14:00Z", "arr": "CDG" ,"end": "2019-01-10T15:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'CDG' ],
        countries: ["FR"],
        start: '2019-01-10T09:00+01:00',
        end: '2019-01-10T16:00+01:00',
        days: 1,
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156/2);
    expect(rots[0].formula).toBe('0.5 x FR');
}); 

//Memento Fiscal Exemple 2a
test("1 ON stop court SVO", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-13T08:00Z", "arr": "SVO" ,"end": "2019-01-13T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-13T17:59Z", "arr": "CDG" ,"end": "2019-01-13T21:10Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'CDG' ],
        countries: [ 'FR' ],
        start: '2019-01-13T09:00+01:00',
        end: '2019-01-13T22:10+01:00',
        days: 1,
        summary: 'CDG-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156/2);
    expect(rots[0].formula).toBe('0.5 x FR');
});

//Memento Fiscal Exemple 2b
test("1 ON stop long SVO", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-13T08:00Z", "arr": "SVO" ,"end": "2019-01-13T11:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-13T18:01Z", "arr": "CDG" ,"end": "2019-01-13T21:10Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO' ],
        countries: ["RU"],
        start: '2019-01-13T09:00+01:00',
        end: '2019-01-13T22:10+01:00',
        days: 1,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(230);
    expect(rots[0].formula).toBe('1 x RU');
});

//Memento Fiscal Exemple3
test("2 ON Europe", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-20T08:00Z", "arr": "TLS" ,"end": "2019-01-20T09:00Z"},
        {"stop":"xx,xx", "dep": "TLS", "start": "2019-01-20T10:00Z", "arr": "CDG" ,"end": "2019-01-20T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-20T12:00Z", "arr": "FRA" ,"end": "2019-01-20T13:00Z"},
        {"stop":"xx,xx", "dep": "FRA", "start": "2019-01-21T14:00Z", "arr": "CDG" ,"end": "2019-01-21T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-21T16:00Z", "arr": "MAD" ,"end": "2019-01-21T17:00Z"},
        {"stop":"xx,xx", "dep": "MAD", "start": "2019-01-21T18:00Z", "arr": "CDG" ,"end": "2019-01-21T19:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'FRA', 'FRA' ],
        countries: [ 'DE', 'DE' ],
        start: '2019-01-20T09:00+01:00',
        end: '2019-01-21T20:00+01:00',
        days: 2,
        summary: 'CDG-FRA-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBe(156*1.5);
    expect(rots[0].formula).toBe('1.5 x DE');
});

//Memento Fiscal Exemple4
test("2 ON Copenhague", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-01T08:00Z", "arr": "MRS" ,"end": "2019-02-01T09:00Z"},
        {"stop":"xx,xx", "dep": "MRS", "start": "2019-02-01T10:00Z", "arr": "CDG" ,"end": "2019-02-01T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-01T12:00Z", "arr": "CPH" ,"end": "2019-02-01T13:00Z"},
        {"stop":"xx,xx", "dep": "CPH", "start": "2019-02-02T14:00Z", "arr": "CDG" ,"end": "2019-02-02T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-02T16:00Z", "arr": "MXP" ,"end": "2019-02-02T17:00Z"},
        {"stop":"xx,xx", "dep": "MXP", "start": "2019-02-02T18:00Z", "arr": "CDG" ,"end": "2019-02-02T19:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'CPH', 'CPH' ],
        countries: [ 'DK', 'DK' ],
        start: '2019-02-01T09:00+01:00',
        end: '2019-02-02T20:00+01:00',
        days: 2,
        summary: 'CDG-CPH-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(1.5 * 1660 / 7.4564);
    expect(rots[0].formula).toBe('1.5 x DK');
});

//Memento Fiscal Exemple5
test("3 ON in FRA & LHR", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-15T08:00Z", "arr": "TLS" ,"end": "2019-03-15T09:00Z"},
        {"stop":"xx,xx", "dep": "TLS", "start": "2019-03-15T10:00Z", "arr": "CDG" ,"end": "2019-03-15T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-15T12:00Z", "arr": "FRA" ,"end": "2019-03-15T13:00Z"},
        {"stop":"xx,xx", "dep": "FRA", "start": "2019-03-16T14:00Z", "arr": "CDG" ,"end": "2019-03-16T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-16T16:00Z", "arr": "LHR" ,"end": "2019-03-16T17:00Z"},
        {"stop":"xx,xx", "dep": "LHR", "start": "2019-03-17T18:00Z", "arr": "CDG" ,"end": "2019-03-17T19:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'FRA', 'LHR', 'LHR' ],
        countries: [ 'DE', 'GB', 'GB' ],
        start: '2019-03-15T09:00+01:00',
        end: '2019-03-17T20:00+01:00',
        days: 3,
        summary: 'CDG-FRA-LHR-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(156 + (1.5 * 180 / 0.8746), 1);
    expect(rots[0].formula).toBe('1 x DE + 1.5 x GB');
});

//Memento Fiscal Exemple6
test("3 ON OTP & FRA", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-05-10T08:00Z", "arr": "AMS" ,"end": "2019-05-10T09:00Z"},
        {"stop":"xx,xx", "dep": "AMS", "start": "2019-05-10T10:00Z", "arr": "CDG" ,"end": "2019-05-10T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-05-10T12:00Z", "arr": "OTP" ,"end": "2019-05-10T13:00Z"},
        {"stop":"xx,xx", "dep": "OTP", "start": "2019-05-11T14:00Z", "arr": "CDG" ,"end": "2019-05-11T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-05-11T16:00Z", "arr": "FRA" ,"end": "2019-05-11T17:00Z"},
        {"stop":"xx,xx", "dep": "FRA", "start": "2019-05-12T18:00Z", "arr": "CDG" ,"end": "2019-05-12T19:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-05-12T20:00Z", "arr": "NCE" ,"end": "2019-05-12T20:30Z"},
        {"stop":"xx,xx", "dep": "NCE", "start": "2019-05-12T20:45Z", "arr": "CDG" ,"end": "2019-05-12T21:30Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'OTP', 'FRA', 'FRA' ],
        countries: [ 'RO', 'DE', 'DE' ],
        start: '2019-05-10T10:00+02:00',
        end: '2019-05-12T23:30+02:00',
        days: 3,
        summary: 'CDG-OTP-FRA-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(160 + (1.5 * 156));
    expect(rots[0].formula).toBe('1 x RO + 1.5 x DE');
});

//Memento Fiscal Exemple7
test("4 ON FDF", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-06-14T08:00Z", "arr": "FDF" ,"end": "2019-06-14T16:00Z"},
        {"stop":"xx,xx", "dep": "FDF", "start": "2019-06-16T19:00Z", "arr": "CDG" ,"end": "2019-06-17T05:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'FDF', 'FDF', 'FDF', 'FDF' ],
        countries: [ 'MQ', 'MQ', 'MQ', 'MQ' ],
        start: '2019-06-14T10:00+02:00',
        end: '2019-06-17T07:00+02:00',
        days: 4,
        summary: 'CDG-FDF-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(3.5 * 156);
    expect(rots[0].formula).toBe('3.5 x MQ');
});

//Memento Fiscal Exemple8
test("2ON SVO", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-22T08:00Z", "arr": "LHR" ,"end": "2019-01-22T09:00Z"},
        {"stop":"xx,xx", "dep": "LHR", "start": "2019-01-22T10:00Z", "arr": "CDG" ,"end": "2019-01-22T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-22T12:00Z", "arr": "SVO" ,"end": "2019-01-22T13:00Z"},
        {"stop":"xx,xx", "dep": "SVO", "start": "2019-01-23T14:00Z", "arr": "CDG" ,"end": "2019-01-23T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-01-23T16:00Z", "arr": "LHR" ,"end": "2019-01-23T17:00Z"},
        {"stop":"xx,xx", "dep": "LHR", "start": "2019-01-23T18:00Z", "arr": "CDG" ,"end": "2019-01-23T19:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SVO', 'SVO',],
        countries: [ 'RU', 'RU',],
        start: '2019-01-22T09:00+01:00',
        end: '2019-01-23T20:00+01:00',
        days: 2,
        summary: 'CDG-SVO-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(2 * 230);
    expect(rots[0].formula).toBe('2 x RU');
});

//Memento Fiscal Exemple9
test("3ON IST LHR", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-10T08:00Z", "arr": "IST" ,"end": "2019-02-10T09:00Z"},
        {"stop":"xx,xx", "dep": "IST", "start": "2019-02-11T10:00Z", "arr": "CDG" ,"end": "2019-02-11T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-11T12:00Z", "arr": "LHR" ,"end": "2019-02-11T13:00Z"},
        {"stop":"xx,xx", "dep": "LHR", "start": "2019-02-12T14:00Z", "arr": "CDG" ,"end": "2019-02-12T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-02-12T16:00Z", "arr": "ZRH" ,"end": "2019-02-12T17:00Z"},
        {"stop":"xx,xx", "dep": "ZRH", "start": "2019-02-12T18:00Z", "arr": "CDG" ,"end": "2019-02-12T19:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'IST', 'LHR', 'LHR'],
        countries: [ 'TR', 'GB', 'GB'],
        start: '2019-02-10T09:00+01:00',
        end: '2019-02-12T20:00+01:00',
        days: 3,
        summary: 'CDG-IST-LHR-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].indemnity).toBeCloseTo(165 + (2 * 180 / 0.8746), 1);
    expect(rots[0].formula).toBe('1 x TR + 2 x GB');
});

//Memento Fiscal Exemple9
test("4ON TLV ARL MAD", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-01T08:00Z", "arr": "LHR" ,"end": "2019-03-01T09:00Z"},
        {"stop":"xx,xx", "dep": "LHR", "start": "2019-03-01T10:00Z", "arr": "CDG" ,"end": "2019-03-01T11:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-01T12:00Z", "arr": "TLV" ,"end": "2019-03-01T13:00Z"},
        {"stop":"xx,xx", "dep": "TLV", "start": "2019-03-02T14:00Z", "arr": "CDG" ,"end": "2019-03-02T15:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-02T16:00Z", "arr": "ARN" ,"end": "2019-03-02T17:00Z"},
        {"stop":"xx,xx", "dep": "ARL", "start": "2019-03-03T15:00Z", "arr": "CDG" ,"end": "2019-03-03T16:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-03T17:00Z", "arr": "MAD" ,"end": "2019-03-03T18:00Z"},
        {"stop":"xx,xx", "dep": "MAD", "start": "2019-03-04T15:00Z", "arr": "CDG" ,"end": "2019-03-04T16:00Z"},
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-03-04T17:00Z", "arr": "IST" ,"end": "2019-03-04T18:00Z"},
        {"stop":"xx,xx", "dep": "IST", "start": "2019-03-04T19:00Z", "arr": "CDG" ,"end": "2019-03-04T20:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'TLV', 'ARN', 'MAD', 'MAD'],
        countries: [ 'IL', 'SE', 'ES', 'ES'],
        start: '2019-03-01T09:00+01:00',
        end: '2019-03-04T21:00+01:00',
        days: 4,
        summary: 'CDG-TLV-ARN-MAD-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('1 x IL + 1 x SE + 2 x ES');
    expect(rots[0].indemnity).toBeCloseTo(230 + (1997 / 10.3123) + (156 * 2), 1);
});

//Memento Fiscal Exemple11
test("4 ON SCL", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-04-15T08:00Z", "arr": "SCL" ,"end": "2019-04-15T21:00Z"},
        {"stop":"xx,xx", "dep": "SCL", "start": "2019-04-17T19:00Z", "arr": "CDG" ,"end": "2019-04-18T05:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'SCL', 'SCL', 'SCL', 'SCL' ],
        countries: [ 'CL', 'CL', 'CL', 'CL' ],
        start: '2019-04-15T10:00+02:00',
        end: '2019-04-18T07:00+02:00',
        days: 4,
        summary: 'CDG-SCL-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('4 x CL');
    expect(rots[0].indemnity).toBeCloseTo(4 * (217 / 1.1607), 1);
});

//Memento Fiscal Exemple12
test("5 ON BKK", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-05-10T08:00Z", "arr": "BKK" ,"end": "2019-05-10T21:00Z"},
        {"stop":"xx,xx", "dep": "BKK", "start": "2019-05-11T08:00Z", "arr": "PNH" ,"end": "2019-05-11T10:00Z"},
        {"stop":"xx,xx", "dep": "PNH", "start": "2019-05-11T13:00Z", "arr": "BKK" ,"end": "2019-05-11T16:00Z"},
        {"stop":"xx,xx", "dep": "BKK", "start": "2019-05-13T19:00Z", "arr": "CDG" ,"end": "2019-05-14T05:00Z"}
    ];
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'BKK', 'BKK', 'BKK', 'BKK', 'BKK' ],
        countries: [ 'TH', 'TH', 'TH', 'TH', 'TH' ],
        start: '2019-05-10T10:00+02:00',
        end: '2019-05-14T07:00+02:00',
        days: 5,
        summary: 'CDG-BKK-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('5 x TH');
    expect(rots[0].indemnity).toBeCloseTo(5 * (5000 / 34.836), 1);
});

//Memento Fiscal Exemple13
test("6 ON DXB HKG", () => {
    console.log = jest.fn();
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-07-03T15:00Z", "arr": "DXB" ,"end": "2019-07-03T21:00Z"},
        {"stop":"xx,xx", "dep": "DXB", "start": "2019-07-05T08:00Z", "arr": "HKG" ,"end": "2019-07-05T19:00Z"},
        {"stop":"xx,xx", "dep": "HKG", "start": "2019-07-07T19:00Z", "arr": "CDG" ,"end": "2019-07-08T05:00Z"}
    ];
    // 3 DXB
    // 4 DXB
    // 5 HKG
    // 6 HKG
    // 7 HKG (en vol donc nuit précédente)
    // 8 HKG (dernière nuitée)
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'DXB', 'DXB', 'DXB', 'HKG', 'HKG', 'HKG' ], //-> solution SNPL (utilise optimizeNightsRepartition)
        // nights: [ 'DXB', 'DXB', 'HKG', 'HKG', 'HKG', 'HKG' ], //-> solution SNPNC
        countries: [ 'AE', 'AE', 'AE', 'HK', 'HK', 'HK' ], //-> solution SNPNC
        start: '2019-07-03T17:00+02:00',
        end: '2019-07-08T07:00+02:00',
        days: 6,
        summary: 'CDG-DXB-HKG-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    expect(console.log.mock.calls[0][0].startsWith('Optimisation')).toBeTruthy();
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    //solution SNPNC
    expect(rots[0].formula).toBe('3 x AE + 3 x HK');
    expect(rots[0].indemnity).toBeCloseTo((3 * 300) + (3 * 2200/ 9.0167), 1);
    // solution SNPL
    // expect(rots[0].formula).toBe('3 x AE + 3 x HK');
    // expect(rots[0].indemnity).toBeCloseTo((3 * 300) + (3 * 2200/ 9.0167), 1);
});

//Memento Fiscal Exemple14
test("8 ON LAX PPT LAX", () => {
    const flights = [
        {"stop":"xx,xx", "dep": "CDG", "start": "2019-06-02T08:00Z", "arr": "LAX" ,"end": "2019-06-02T21:00Z"},
        {"stop":"xx,xx", "dep": "LAX", "start": "2019-06-04T20:00Z", "arr": "PPT" ,"end": "2019-06-05T17:00Z"},
        {"stop":"xx,xx", "dep": "PPT", "start": "2019-06-07T12:00Z", "arr": "LAX" ,"end": "2019-06-07T20:00Z"},
        {"stop":"xx,xx", "dep": "LAX", "start": "2019-06-08T21:00Z", "arr": "CDG" ,"end": "2019-06-09T05:00Z"}
    ];
    // 2 LAX
    // 3 LAX
    // 4 ??? LAX (SNPL) PPT (SNPNC) en vol => nuit précédente => pour moi, c'est LAX
    // 5 PPT
    // 6 PPT
    // 7 LAX
    // 8 LAX (en vol donc nuit précédente)
    // 9 LAX (nuit précédente)
    let rots = buildRots(flights, {"base": ["CDG", "ORY"], "tzConverter": iso2FR, "iataMap": iata2country});
    //console.log(rots);
    expect(rots.length).toBe(1);
    expect(rots[0]).toEqual({
        isComplete: '<>',
        nights: [ 'LAX', 'LAX', 'LAX', 'PPT', 'PPT', 'LAX', 'LAX', 'LAX' ],
        countries: [ 'US', 'US', 'US', 'PF', 'PF', 'US', 'US', 'US' ],
        start: '2019-06-02T10:00+02:00',
        end: '2019-06-09T07:00+02:00',
        days: 8,
        summary: 'CDG-LAX-PPT-LAX-CDG',
        dep: 'CDG',
        arr:'CDG'
    });
    rots = addIndemnities("2019", rots, taxData, iso2FR);
    expect(rots[0].formula).toBe('3 x US + 2 x PF + 3 x US');
    expect(rots[0].indemnity).toBeCloseTo((6 * 320 / 1.1607) + (2 * 120), 1);
});
