import {
    decimalHours2iso, diffHours, fr2iso, iso2AST, iso2FR, iso2TZ,
    lastDayInMonthISO, numberOfDays, tzOffset,
} from '../../src/utilities/dates';

test("lastDayInMonthISO", () => {
    expect(lastDayInMonthISO("01", "2019")).toBe("2019-01-31");
    expect(lastDayInMonthISO("02", "2019")).toBe("2019-02-28");
    expect(lastDayInMonthISO("02", "2020")).toBe("2020-02-29"); // leap year
    expect(lastDayInMonthISO("04", "2020")).toBe("2020-04-30");
    expect(lastDayInMonthISO("12", "2020")).toBe("2020-12-31");
});

test("decimalHours2iso converts decimal-hour notation to a Z-suffixed time", () => {
    // Comma separator
    expect(decimalHours2iso("00,00")).toBe("00:00Z");
    expect(decimalHours2iso("00,50")).toBe("00:30Z");
    expect(decimalHours2iso("24,00")).toBe("24:00Z");

    // Dot separator
    expect(decimalHours2iso("00.00")).toBe("00:00Z");
    expect(decimalHours2iso("00.50")).toBe("00:30Z");
    expect(decimalHours2iso("24.00")).toBe("24:00Z");
});

test("numberOfDays", () => {
    // Same calendar day → 0
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-29T23:00Z")).toBe(0);
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-29T23:00+01:00")).toBe(0);

    // Next calendar day → 1
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-30T23:00Z")).toBe(1);
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-30T23:00+01:00")).toBe(1);
    expect(numberOfDays("2020-02-29T22:00Z", "2020-02-30T05:00Z")).toBe(1);
    expect(numberOfDays("2020-02-29T22:00+01:00", "2020-02-30T05:00+01:00")).toBe(1);

    // 24:00 counts as 23:59 of the same day
    expect(numberOfDays("2020-02-29T24:00Z", "2020-02-30T00:01Z")).toBe(1);
    expect(numberOfDays("2020-02-29T24:00+01:00", "2020-02-30T00:01+01:00")).toBe(1);
    expect(numberOfDays("2020-02-29T24:00Z", "2020-02-29T23:59Z")).toBe(0);
    expect(numberOfDays("2020-02-29T24:00+01:00", "2020-02-29T23:59+01:00")).toBe(0);
});

test("diffHours", () => {
    // Whole-hour difference
    expect(diffHours("2020-02-29T22:00Z", "2020-02-29T23:00Z")).toBe(1);
    expect(diffHours("2020-02-29T22:00+01:00", "2020-02-29T23:00+01:00")).toBe(1);

    // Fractional hours across a day boundary
    expect(diffHours("2020-02-29T22:00Z", "2020-02-30T23:30Z")).toBe(25.5);
    expect(diffHours("2020-02-29T22:00+01:00", "2020-02-30T23:30+01:00")).toBe(25.5);
});

test("iso2TZ", () => {
    // Standard time (no DST)
    expect(iso2TZ("Europe/Paris", "2020-11-01T00:00Z")).toBe("2020-11-01T01:00+01:00");
    expect(iso2TZ("Europe/Paris", "2020-11-01T01:00+01:00")).toBe("2020-11-01T01:00+01:00");
    // Daylight saving
    expect(iso2TZ("Europe/Paris", "2020-07-01T23:00Z")).toBe("2020-07-02T01:00+02:00");
    expect(iso2TZ("Europe/Paris", "2020-07-02T01:00+02:00")).toBe("2020-07-02T01:00+02:00");
    // Probe form: returns the time zone when no isoString is passed
    expect(iso2TZ("Europe/Paris")).toBe("Europe/Paris");
});

test("iso2TZ deltaDays", () => {
    // Standard time (no DST)
    expect(iso2TZ("Europe/Paris", "2020-11-01T00:00Z", 1)).toBe("2020-11-02T01:00+01:00");
    expect(iso2TZ("Europe/Paris", "2020-11-01T01:00+01:00", 1)).toBe("2020-11-02T01:00+01:00");
    // Daylight saving
    expect(iso2TZ("Europe/Paris", "2020-07-01T23:00Z", 1)).toBe("2020-07-03T01:00+02:00");
    expect(iso2TZ("Europe/Paris", "2020-07-02T01:00+02:00", 1)).toBe("2020-07-03T01:00+02:00");
});

test("iso2FR", () => {
    // Standard time (no DST)
    expect(iso2FR("2020-11-01T00:00Z")).toBe("2020-11-01T01:00+01:00");
    expect(iso2FR("2020-11-01T01:00+01:00")).toBe("2020-11-01T01:00+01:00");
    // Daylight saving
    expect(iso2FR("2020-07-01T23:00Z")).toBe("2020-07-02T01:00+02:00");
    expect(iso2FR("2020-07-02T01:00+02:00")).toBe("2020-07-02T01:00+02:00");
    // Probe form
    expect(iso2FR()).toBe("Europe/Paris");
});

test("iso2FR deltaDays", () => {
    // Standard time (no DST)
    expect(iso2FR("2020-11-01T00:00Z", 1)).toBe("2020-11-02T01:00+01:00");
    expect(iso2FR("2020-11-01T01:00+01:00", 1)).toBe("2020-11-02T01:00+01:00");
    // Daylight saving
    expect(iso2FR("2020-07-01T23:00Z", 1)).toBe("2020-07-03T01:00+02:00");
    expect(iso2FR("2020-07-02T01:00+02:00", 1)).toBe("2020-07-03T01:00+02:00");
});

test("iso2AST", () => {
    // Atlantic Standard Time has no DST — always UTC-4
    expect(iso2AST("2020-01-15T12:00Z")).toBe("2020-01-15T08:00-04:00");
    expect(iso2AST("2020-07-15T12:00Z")).toBe("2020-07-15T08:00-04:00");
    // Probe form
    expect(iso2AST()).toBe("America/Puerto_Rico");
});

test("fr2iso", () => {
    // Standard time (UTC+1): local 14:24 → 13:24Z
    expect(fr2iso("2025-03-19", "14:24")).toBe("2025-03-19T13:24Z");
    // Daylight saving (UTC+2): local 14:24 → 12:24Z
    expect(fr2iso("2025-07-19", "14:24")).toBe("2025-07-19T12:24Z");
    // Round-trip with iso2FR
    expect(iso2FR(fr2iso("2025-03-19", "14:24"))).toBe("2025-03-19T14:24+01:00");
    expect(iso2FR(fr2iso("2025-07-19", "14:24"))).toBe("2025-07-19T14:24+02:00");
});

test("tzOffset extracts the offset from iso2FR (Paris, no DST in November)", () => {
    expect(tzOffset(iso2FR)).toBe("+01:00");
});

test("tzOffset extracts the offset from iso2AST (PTP, year-round AST)", () => {
    expect(tzOffset(iso2AST)).toBe("-04:00");
});

test("tzOffset works with a custom converter function", () => {
    const utcConverter = (iso) => iso.replace("Z", "+00:00");

    expect(tzOffset(utcConverter)).toBe("+00:00");
});

test("tzOffset falls back to '+01:00' when no converter is provided", () => {
    expect(tzOffset(undefined)).toBe("+01:00");
    expect(tzOffset(null)).toBe("+01:00");
});
