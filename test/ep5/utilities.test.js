import {ep5Time2iso, lastDayInMonthISO, numberOfDays, diffHours, iso2TZ, iso2FR} from '../../src/parsers/ep5Parser';
test("ep5Time2iso", () => {
    // noinspection JSCheckFunctionSignatures
    expect(ep5Time2iso("00,00")).toBe('00:00Z');
    expect(ep5Time2iso("00,50")).toBe('00:30Z');
    expect(ep5Time2iso("24,00")).toBe('24:00Z');
});

test("lastDayInMonthISO", () => {
    expect(lastDayInMonthISO("02", "2019")).toBe("2019-02-28");
    expect(lastDayInMonthISO("02", "2020")).toBe("2020-02-29");
});

test("diffDays & DiffHours UTC", () => {
    //same day count for 0
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-29T23:00Z")).toBe(0);
    //following day count for 1
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-30T23:00Z")).toBe(1);
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-30T05:00Z")).toBe(1);
    //24:00Z test count as 23:59Z
    expect(numberOfDays("2020-02-29T24:00Z", "2020-02-30T00:01Z")).toBe(1);
    expect(numberOfDays("2020-02-29T24:00Z", "2020-02-29T23:59Z")).toBe(0);

    expect(diffHours("2020-02-29T22:00Z", "2020-02-29T23:00Z")).toBe(1);
    expect(diffHours("2020-02-29T22:00Z", "2020-02-30T23:30Z")).toBe(25.5);
});

test("diffDays & DiffHours Paris", () => {
    //same day count for 0
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-29T23:00+01:00")).toBe(0);
    //following day count for 1
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-30T23:00+01:00")).toBe(1);
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-30T05:00+01:00")).toBe(1);
    //24:00Z test count as 23:59Z
    expect(numberOfDays("2020-02-29T24:00+01:00", "2020-02-30T00:01+01:00")).toBe(1);
    expect(numberOfDays("2020-02-29T24:00+01:00", "2020-02-29T23:59+01:00")).toBe(0);

    expect(diffHours("2020-02-29T22:00+01:00", "2020-02-29T23:00+01:00")).toBe(1);
    expect(diffHours("2020-02-29T22:00+01:00", "2020-02-30T23:30+01:00")).toBe(25.5);
});

test("iso2TZ", () => {
    // daylight savings off same day
    expect(iso2TZ("Europe/Paris", "2020-11-01T00:00Z")).toBe("2020-11-01T01:00+01:00");
    expect(iso2TZ("Europe/Paris", "2020-11-01T01:00+01:00")).toBe("2020-11-01T01:00+01:00");
    // daylight saving on following day
    expect(iso2TZ("Europe/Paris", "2020-07-01T23:00Z")).toBe("2020-07-02T01:00+02:00");
    expect(iso2TZ("Europe/Paris", "2020-07-02T01:00+02:00")).toBe("2020-07-02T01:00+02:00");
    // workaroud to know the timezone of the converter
    expect(iso2TZ("Europe/Paris")).toBe("Europe/Paris");
});

test("iso2TZ add", () => {
    // daylight savings off same day
    expect(iso2TZ("Europe/Paris", "2020-11-01T00:00Z", 1)).toBe("2020-11-02T01:00+01:00");
    expect(iso2TZ("Europe/Paris", "2020-11-01T01:00+01:00", 1)).toBe("2020-11-02T01:00+01:00");
    // daylight saving on following day
    expect(iso2TZ("Europe/Paris", "2020-07-01T23:00Z",1)).toBe("2020-07-03T01:00+02:00");
    expect(iso2TZ("Europe/Paris", "2020-07-02T01:00+02:00",1)).toBe("2020-07-03T01:00+02:00");
});

test("iso2FR", () => {
    // daylight savings off same day
    expect(iso2FR("2020-11-01T00:00Z")).toBe("2020-11-01T01:00+01:00");
    expect(iso2FR("2020-11-01T01:00+01:00")).toBe("2020-11-01T01:00+01:00");
    // daylight saving on following day
    expect(iso2FR("2020-07-01T23:00Z")).toBe("2020-07-02T01:00+02:00");
    expect(iso2FR("2020-07-02T01:00+02:00")).toBe("2020-07-02T01:00+02:00");
});

test("iso2FR add", () => {
    // daylight savings off same day
    expect(iso2FR("2020-11-01T00:00Z", 1)).toBe("2020-11-02T01:00+01:00");
    expect(iso2FR("2020-11-01T01:00+01:00", 1)).toBe("2020-11-02T01:00+01:00");
    // daylight saving on following day
    expect(iso2FR("2020-07-01T23:00Z",1)).toBe("2020-07-03T01:00+02:00");
    expect(iso2FR("2020-07-02T01:00+02:00",1)).toBe("2020-07-03T01:00+02:00");
    // workaroud to know the timezone of the converter
    expect(iso2FR()).toBe("Europe/Paris");
});