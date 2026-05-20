import {
    decimalHours2iso, diffHours, fr2iso, hhmmToMin, iso2AST, iso2FR, iso2TZ,
    lastDayInMonthISO, minToHHMM, numberOfDays, offsetDay, tzOffset,
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

test("fr2iso uses the actual time's offset on DST switchover days", () => {
    // Spring forward: 30 Mar 2025, clocks jump 02:00 → 03:00 local.
    // Pre-switch (00:02): still UTC+1 (winter). Post-switch (14:24): UTC+2.
    expect(fr2iso("2025-03-30", "00:02")).toBe("2025-03-29T23:02Z");
    expect(fr2iso("2025-03-30", "14:24")).toBe("2025-03-30T12:24Z");
    expect(iso2FR(fr2iso("2025-03-30", "00:02"))).toBe("2025-03-30T00:02+01:00");
    expect(iso2FR(fr2iso("2025-03-30", "14:24"))).toBe("2025-03-30T14:24+02:00");

    // Fall back: 26 Oct 2025, clocks fall 03:00 → 02:00 local.
    // Pre-switch (00:30): still UTC+2 (DST). Post-switch (14:24): UTC+1.
    expect(fr2iso("2025-10-26", "00:30")).toBe("2025-10-25T22:30Z");
    expect(fr2iso("2025-10-26", "14:24")).toBe("2025-10-26T13:24Z");
    expect(iso2FR(fr2iso("2025-10-26", "00:30"))).toBe("2025-10-26T00:30+02:00");
    expect(iso2FR(fr2iso("2025-10-26", "14:24"))).toBe("2025-10-26T14:24+01:00");
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

test("offsetDay returns the same day for an offset of 0", () => {
    expect(offsetDay("2025", "03", "19", 0))
        .toEqual({year: "2025", month: "03", day: "19"});
});

test("offsetDay advances within the same month", () => {
    expect(offsetDay("2025", "03", "19", 1))
        .toEqual({year: "2025", month: "03", day: "20"});
    expect(offsetDay("2025", "03", "19", 5))
        .toEqual({year: "2025", month: "03", day: "24"});
});

test("offsetDay rolls into the next month and year", () => {
    expect(offsetDay("2025", "03", "31", 1))
        .toEqual({year: "2025", month: "04", day: "01"});
    expect(offsetDay("2025", "12", "31", 32))
        .toEqual({year: "2026", month: "02", day: "01"});
});

test("offsetDay walks backwards with a negative offset", () => {
    expect(offsetDay("2025", "01", "01", -1))
        .toEqual({year: "2024", month: "12", day: "31"});
    expect(offsetDay("2025", "03", "01", -1))
        .toEqual({year: "2025", month: "02", day: "28"});
});

test("offsetDay handles leap years", () => {
    expect(offsetDay("2024", "02", "28", 1))
        .toEqual({year: "2024", month: "02", day: "29"});
    expect(offsetDay("2024", "02", "29", 1))
        .toEqual({year: "2024", month: "03", day: "01"});
    expect(offsetDay("2025", "02", "28", 1))
        .toEqual({year: "2025", month: "03", day: "01"});
});

test("hhmmToMin converts an HH:MM clock string to minutes since midnight", () => {
    expect(hhmmToMin("00:00")).toBe(0);
    expect(hhmmToMin("00:30")).toBe(30);
    expect(hhmmToMin("01:00")).toBe(60);
    expect(hhmmToMin("14:30")).toBe(14 * 60 + 30);
    expect(hhmmToMin("23:59")).toBe(23 * 60 + 59);
});

test("minToHHMM converts minutes since midnight back to an HH:MM clock string", () => {
    expect(minToHHMM(0)).toBe("00:00");
    expect(minToHHMM(30)).toBe("00:30");
    expect(minToHHMM(60)).toBe("01:00");
    expect(minToHHMM(14 * 60 + 30)).toBe("14:30");
    expect(minToHHMM(23 * 60 + 59)).toBe("23:59");
});

test("hhmmToMin and minToHHMM round-trip", () => {
    for (const s of ["00:00", "07:29", "12:00", "14:24", "21:31", "23:59"]) {
        expect(minToHHMM(hhmmToMin(s))).toBe(s);
    }
});
