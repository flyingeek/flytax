// https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
// months must be 1-based (1→12)
const getDaysInMonth = (m, y) => {
    return m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);
};

/**
 * Last calendar day of a given month, as an ISO date string.
 *
 * @example
 *   lastDayInMonthISO("02", "2020")  // → "2020-02-29"
 *
 * @param {string} mString - Month as 2-digit string ("01"–"12").
 * @param {string} yString - 4-digit year.
 * @returns {string} ISO date "YYYY-MM-DD".
 */
export const lastDayInMonthISO = (mString, yString) => {
    const day = getDaysInMonth(parseInt(mString, 10), parseInt(yString, 10));
    // 28 ≤ day ≤ 31, no padding needed
    return `${yString}-${mString}-${day}`;
};

/**
 * Convert decimal-hour notation ("12,50" or "12.50" → 12 hours + 0.50 hour)
 * to the ISO 8601 time portion in UTC ("12:30Z").
 * The fractional part is interpreted as hundredths of an hour.
 *
 * @param {string} text
 * @returns {string} Time portion suffixed with `Z`, e.g. "12:30Z".
 */
export const decimalHours2iso = (text) => {
    const [hours, cs] = text.replace(',', '.').split('.');
    const minutes = (parseFloat(cs) * 0.6).toFixed(0).padStart(2, '0');
    return `${hours}:${minutes}Z`;
};

/**
 * Number of calendar-day boundaries crossed between two ISO timestamps.
 * Same calendar day → 0; the next calendar day → 1; etc. Tolerates the
 * non-standard `T24:00` form by treating it as `T23:59` of the same day.
 *
 * @param {string} startISO
 * @param {string} endISO
 * @returns {number}
 */
export const numberOfDays = (startISO, endISO) => {
    const diff = Date.parse(endISO.replace("24:00", "23:59")) - Date.parse(startISO.replace(/\d\d:\d\d/, "00:00"));
    return Math.floor(diff / 86400000);
};

/**
 * Difference between two ISO timestamps, in fractional hours.
 *
 * @param {string} startISO
 * @param {string} endISO
 * @returns {number}
 */
export const diffHours = (startISO, endISO) => {
    return (Date.parse(endISO) - Date.parse(startISO)) / 3600000;
};

/**
 * Re-express an ISO timestamp in a target IANA time zone, returning the
 * same instant as a local-time ISO string with explicit offset.
 *
 * Called with no `isoString` it acts as a probe and returns the time-zone
 * argument back — used by buildRots to verify browser support before
 * processing rotations.
 *
 * @example
 *   iso2TZ("Europe/Paris", "2020-11-01T00:00Z")  // → "2020-11-01T01:00+01:00"
 *   iso2TZ("Europe/Paris")                       // → "Europe/Paris"
 *
 * @param {string} timeZone - IANA time zone, e.g. "Europe/Paris".
 * @param {string} [isoString] - Source instant.
 * @param {number} [deltaDays=0] - Days to add before converting.
 * @returns {string}
 * @throws {Error} When the result cannot be parsed (unsupported time zone, etc.).
 */
export const iso2TZ = (timeZone, isoString, deltaDays = 0) => {
    if (isoString === undefined) return timeZone; // used in buildRots to check browser compatibility
    let event = new Date(Date.parse(isoString));
    if (deltaDays) event.setUTCDate(event.getUTCDate() + deltaDays);
    // British English uses day/month/year order and 24-hour time without AM/PM
    const loc = event.toLocaleString("en-GB", {timeZone});
    const re = /(\d\d)\/(\d\d)\/(\d\d\d\d), (\d\d):(\d\d):\d\d/;
    let match;
    if (null !== (match = re.exec(loc))) {
        const [, day, month, year, hour, minute] = match;
        let baseIsoString = `${year}-${month}-${day}T${hour}:${minute}`;
        const baseEvent = new Date(Date.parse(baseIsoString + "Z"));
        const delta = (baseEvent - event) / 3600000;
        let tzOffset = Math.trunc(delta);
        let minutes = Math.round((Math.abs(delta) - Math.abs(tzOffset)) * 60 / 100);
        if (tzOffset === 0) return baseIsoString + "Z";
        baseIsoString += (tzOffset >= 0) ? '+' : '-';
        baseIsoString += Math.abs(tzOffset).toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
        return baseIsoString;
    }
    throw new Error(`Can not convert ${isoString} to timeZone ${timeZone}`);
};

/** {@link iso2TZ} pre-bound to "Europe/Paris" — the AF and Transavia France base zone. */
export const iso2FR = iso2TZ.bind(null, "Europe/Paris");

/** {@link iso2TZ} pre-bound to "America/Puerto_Rico" — Atlantic Standard Time, used for the PTP base. */
export const iso2AST = iso2TZ.bind(null, "America/Puerto_Rico");

/**
 * Convert a Paris-local wall-clock time to a UTC ISO timestamp.
 * Inverse of {@link iso2FR} for typical inputs.
 *
 * @example
 *   fr2iso("2025-03-19", "14:24")  // → "2025-03-19T13:24Z" (UTC+1)
 *   fr2iso("2025-07-19", "14:24")  // → "2025-07-19T12:24Z" (UTC+2, DST)
 *
 * @param {string} dateStr - ISO date "YYYY-MM-DD".
 * @param {string} timeStr - 24-hour clock time "HH:MM".
 * @returns {string} UTC ISO timestamp suffixed with `Z`.
 */
export const fr2iso = (dateStr, timeStr) => {
    // Probe iso2FR at noon to get the UTC offset for this date (avoids DST edge cases).
    const probeLocal = iso2FR(`${dateStr}T12:00Z`);
    let offsetMinutes = 0;
    const offsetMatch = probeLocal.match(/([+-])(\d{2}):(\d{2})$/);
    if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        offsetMinutes = sign * (parseInt(offsetMatch[2], 10) * 60 + parseInt(offsetMatch[3], 10));
    }
    const localMs = Date.parse(`${dateStr}T${timeStr}Z`);
    const utcMs = localMs - offsetMinutes * 60000;
    const d = new Date(utcMs);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}Z`;
};
