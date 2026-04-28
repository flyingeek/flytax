// https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
// months must be 1-based (1→12)
const getDaysInMonth = (m, y) => {
    return m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);
};

export const lastDayInMonthISO = (mString, yString) => {
    const day = getDaysInMonth(parseInt(mString, 10), parseInt(yString, 10));
    // 28 ≤ day ≤ 31, no padding needed
    return `${yString}-${mString}-${day}`;
};

// Intervals between two ISO dates.
export const numberOfDays = (startISO, endISO) => {
    const diff = Date.parse(endISO.replace("24:00", "23:59")) - Date.parse(startISO.replace(/\d\d:\d\d/, "00:00"));
    return Math.floor(diff / 86400000);
};

export const diffHours = (startISO, endISO) => {
    return (Date.parse(endISO) - Date.parse(startISO)) / 3600000;
};

// Convert timezone:
//   2020-11-01T00:00Z      → 2020-11-01+01:00 for "Europe/Paris"
//   2020-11-01T00:00+01:00 → 2020-11-01+01:00 for "Europe/Paris"
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

export const iso2FR = iso2TZ.bind(null, "Europe/Paris");
export const iso2AST = iso2TZ.bind(null, "America/Puerto_Rico"); // Atlantic Standard Time

// Convert Paris local time to UTC ISO string.
//   dateStr "2025-03-19", timeStr "14:24" → "2025-03-19T13:24Z" (for UTC+1)
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
