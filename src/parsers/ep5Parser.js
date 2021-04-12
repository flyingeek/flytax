import airportsData from "../../data/airports.json";
import {localeFormat, months14} from "../components/utils";

export const WITHIN_BASE_TEXT = "rotation sur base";
export const NIGHT_OVERFLOW_TEXT = "Erreur: nuitées > nb de jours";
export const CONTINUATION_MARK = "...";
export const REFNOTE1 = "\u202f¹";
export const FORMULA_ERROR = "!ERREUR!"
//months as written in EP5
const EP5MONTHS = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'];

//converts EP5 time hh,dd to hh:mmZ
//returns a string
export const ep5Time2iso = (text) => {
    const [hours, cs] = text.split(",");
    const minutes = (parseFloat(cs) * 0.6).toFixed(0).padStart(2, '0');
    return `${hours}:${minutes}Z`;
}

//https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
//months must be 1 based (1->12)
const getDaysInMonth = (m, y) => {
    return m===2 ? y & 3 || !(y%25) && y & 15 ? 28 : 29 : 30 + (m+(m>>3)&1);
}

export const lastDayInMonthISO = (mString, yString) => {
    const day = getDaysInMonth(parseInt(mString, 10), parseInt(yString, 10));
    // 28<=day<=31, so no paddding needed
    return `${yString}-${mString}-${day}`;
}

//return intervals between to ISO dates, in hours and in days
export const numberOfDays = (startISO, endISO) => {
    const diff = Date.parse(endISO.replace("24:00", "23:59")) - Date.parse(startISO.replace(/\d\d:\d\d/, "00:00"));
    return Math.floor(diff/ 86400000);
};
export const diffHours = (startISO, endISO) => {
    return (Date.parse(endISO) - Date.parse(startISO)) / 3600000;
};

// Converts timezone
// 2020-11-01T00:00Z -> 2020-11-01+01:00 for "Europe/Paris"
// 2020-11-01T00:00+01:00 -> 2020-11-01+01:00 for "Europe/Paris"
export const iso2TZ = (timeZone, isoString, deltaDays=0) => {
    if (isoString === undefined) return timeZone; // This is used in buildRots to check browser compatibility
    let event = new Date(Date.parse(isoString));
    if (deltaDays) event.setUTCDate(event.getUTCDate() + deltaDays);
    // British English uses day/month/year order and 24-hour time without AM/PM
    const loc = event.toLocaleString("en-GB", {timeZone});
    const re = /(\d\d)\/(\d\d)\/(\d\d\d\d), (\d\d):(\d\d):\d\d/
    let match;
    if (null !== (match = re.exec(loc))) {
        const [, day, month, year, hour, minute] = match;
        let baseIsoString = `${year}-${month}-${day}T${hour}:${minute}`;
        const baseEvent = new Date(Date.parse(baseIsoString + "Z"));
        const delta = (baseEvent - event)/3600000;
        let tzOffset = Math.trunc(delta);
        let minutes = Math.round((Math.abs(delta) - Math.abs(tzOffset))*60/100);
        if (tzOffset === 0) {
            return baseIsoString + "Z";
        }
        baseIsoString += (tzOffset >= 0) ? '+' : '-';
        baseIsoString += Math.abs(tzOffset).toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
        return baseIsoString;
    } else {
        throw new Error(`Can not convert ${isoString} to timeZone ${timeZone}`);
    }
}
export const iso2FR = iso2TZ.bind(null, "Europe/Paris");

const rotSummary = (rot) => {
    // construct a summary (nights not repeated)
    // [YVR, YVR, PPT, PPT, YVR, YVR] => [YVR, PPT, YVR]
    const stopovers = rot.nights.reduce((accumulator, current) => {
        if (current !== accumulator[accumulator.length - 1]) {
            accumulator.push(current); // add a new entry
        }
        return accumulator;
    }, []);
    return [rot.dep, ...stopovers, rot.arr].join('-')
            .replace('-'+ CONTINUATION_MARK, CONTINUATION_MARK)
            .replace(CONTINUATION_MARK +'-', CONTINUATION_MARK);
}

export const buildRots = (flights, {tzConverter, base, iataMap}) => {
    // Using parsed flights build up rots & places of stay
    
    //verify browser compatibility
    const converterTZ = tzConverter();
    try {
        new Date().toLocaleString("en-GB", {"timeZone": converterTZ, "timeZoneName": "short"});
    } catch (e) {
        throw new Error(`Date.toLocaleString("en-GB", {"timeZone": "${converterTZ}"}) not supported`);
    }
    const isBase = (iata) => (base.indexOf(iata)!== -1);
    let rots = [];
    let rot = null;
    let rotFlights;
    let rotStays;
    
    for (const [i, flightGMT] of flights.entries()) {
        const year = flightGMT.start.substring(0,4);
        const month = flightGMT.start.substring(5, 7);
        const flight = Object.assign({}, flightGMT);
        if (tzConverter) {
            Object.assign(flight, {"start": tzConverter(flightGMT.start), "end": tzConverter(flightGMT.end)});
        }
        if (rot === null) { //reset to a new rot
            rotFlights = [];
            rotStays = [];
            rot = {"isComplete": "<>", "nights": [], "start": flight.start};
        }
        if (i === 0 && ((isBase(flight.dep) && flight.stop === "0,00" && flightGMT.start.substring(8, 10) === "01") || !isBase(flight.dep))) {
            rot.isComplete = '>';
            if (!isBase(flight.dep)) { //stopovers from first day of month
                rot.start = `${year}-${month}-01T00:00Z`;
                if (tzConverter) rot.start = tzConverter(rot.start);
                const days = numberOfDays(rot.start, flight.start) + 1;
                for (let j=0; j<days-1; j++) {
                    rot.nights.push(flight.dep);
                    rotStays.push(flight.dep)
                }
            }
            // extra stopover for the flight
            if (isBase(flight.dep)) {
                // do not push flight.arr (already counted on previous month)
            }else if (isBase(flight.arr)) {
                rot.nights.push(flight.dep);
            }else if (numberOfDays(flight.start, flight.end)>0){
                rot.nights.push(flight.dep);
            }
            //other cases will be covered below
        }
        const nextFlight = (flights[i + 1]) ? Object.assign({}, flights[i + 1]) : undefined;
        if(tzConverter && nextFlight) {
            Object.assign(nextFlight, {"start": tzConverter(flights[i + 1].start), "end": tzConverter(flights[i + 1].end)});
        }
        if (nextFlight !== undefined) {
            const standbyHours = diffHours(flight.end, nextFlight.start);
            // on compte une nuit par jour civil en escale
            let standbyDays = 0;
            //First line was needed by 10 ON YVR PPT YVR in rots.test
            //To check if isBase test was needed, added 7ON SVO in straddling.test and it is.
            standbyDays += (numberOfDays(rot.start, flight.start) === 0 && isBase(flight.dep)) ? numberOfDays(flight.start, flight.end) : 0; // for flights straddling day on first day
            standbyDays += numberOfDays(flight.end, nextFlight.start);
            standbyDays += numberOfDays(nextFlight.start, nextFlight.end); // for flights like LAX-PPT
            standbyDays = Math.max(standbyDays, 1); // for single day rot
            if (standbyHours >= 7 && !isBase(flight.arr)) {
                //console.log(numberOfDays(flight.end, nextFlight.start), standbyHours, localDays, flight.arr);
                //escale hors base de plus de 7h
                for (let j=0; j<standbyDays; j++) {
                    rot.nights.push(flight.arr);
                }
                for (let j=0; j <numberOfDays(flight.end, nextFlight.start); j++){
                    rotStays.push(flight.arr);
                }
                rotFlights.push(flightGMT);
                continue; //do not push new rot yet
            } else if (isBase(flight.arr) && isBase(nextFlight.dep) && standbyHours >= 12) {
                // Arrivée base, départ Base avec standby > 12h
                // will push new rot
            } else {
                rotFlights.push(flightGMT);
                continue; //do not push new rot yet
            }
        } else {
            // last flight of the month ending Base
            if (isBase(flight.arr)) {
                if (flight.end.substring(5,7) !== month) {
                    // flight is accross civil month
                    if (flightGMT.end.substring(11) === "24:00Z") {
                        // uncomplete rot not ending at Base
                        rot.isComplete = '<';
                        // if flight continues after 24z, next day will be counted next month
                        // so we need to adjust nights by omitting one
                        rot.days = numberOfDays(rot.start, flight.end);
                    }
                }
                // last flight, will push new rot
            } else {
                // last flight of the month NOT ending Base
                rot.isComplete = '<';
                const lastDay = lastDayInMonthISO(month, year) + "T24:00Z";
                if (tzConverter) {
                    rot.end = tzConverter(lastDay);
                } else {
                    rot.end = lastDay;
                }
                const days = numberOfDays(flight.end, rot.end) + 1;
                for (let j=0; j<days; j++) {
                    rot.nights.push(flight.arr);
                    if (j>0) rotStays.push(flight.arr);
                }
                if (rot.end.substring(5,7) !== month) {
                    // also adjust night count if flight.end is on current month
                    if (flight.end.substring(5,7) === month){
                        rot.nights.pop();
                    }
                    rot.days = numberOfDays(rot.start, rot.end); //omit one
                }
                // last flight, will push new rot
            }
        }
        rotFlights.push(flightGMT);
        if (rot.isComplete !== '<>') {
            rot.flights = rotFlights; // needed for merge
            rot.base = base;
        }
        // some defaults if not already set
        // a ||= b; only is ES2021 and node 15 <=> a || (a = b);
        rot.end || (rot.end = flight.end);
        rot.days|| (rot.days = numberOfDays(rot.start, rot.end) + 1); // 0 days <=> 1ON

        // construct a summary (nights not repeated)
        let dep = base[0];
        let arr = base[0];
        if (!rot.isComplete.startsWith('<')) {
            dep = CONTINUATION_MARK;
        } else if (rotFlights.length > 0) {
            dep = rotFlights[0].dep;
        }
        if (!rot.isComplete.endsWith('>')) {
            arr = CONTINUATION_MARK;
        } else if (rotFlights.length > 0) {
            arr = rotFlights[rotFlights.length - 1].arr;
        }
        rot.dep = dep;
        rot.arr = arr;
        rot.summary = rotSummary(rot);
        // adjust number of nights to match number of days
        const nightsCount = rot.nights.length;
        const missing = rot.days - nightsCount;
        const fillingNight = (rot.nights.length > 0) ? rot.nights[nightsCount - 1] : (dep !== CONTINUATION_MARK) ? dep : (arr !== CONTINUATION_MARK) ? arr : base[0];
        for (let j=0; j<missing; j++) {
            rot.nights.push(fillingNight);
        }
        const nightInFlight = (numberOfDays(flight.start, flight.end) === 1 || flightGMT.start.endsWith('T00:00Z'));
        const mayNeedOptimization = (missing === 1 && nightInFlight);
        if (mayNeedOptimization && rot.isComplete === '<>') {
            // We have to check if we can have a better night repartition
            [rot.nights,] = optimizeNightsRepartition(rot, rotStays);
        }
        
        //outOfBase is > 0 if rot have at least one stopover out of base
        //If not outOfBase, indemnities are zero so we reset nights
        const outOfBase = rotFlights.reduce((a, c) => a + ((!isBase(c.dep) || !isBase(c.arr)) ? 1 : 0), 0);
        if (outOfBase === 0) rot.nights = [];

        // add countries
        if (iataMap) rot.countries = rot.nights.map((iata) => iataMap(iata));
        //push rot and continue
        rots.push(rot);
        rot = null;
    }
    return rots
};

export const optimizeNightsRepartition = (rot, stays) => {
    const nights = rot.nights;
    const countries = rot.countries; // optional
    if (Array.isArray(stays)) {
        const stayTuples = stays.reduce((accumulator, current) => {
            const index = accumulator.length - 1;
            if (index > -1 && current === accumulator[index][0]) {
                accumulator[index][1] += 1;
            }else{
                accumulator.push([current, 1]); // add a new entry
            }
            return accumulator;
        }, []);
        const nightTuples = nights.reduce((accumulator, current) => {
            const index = accumulator.length - 1;
            if (index > -1 && current === accumulator[index][0]) {
                accumulator[index][1] += 1;
            }else{
                accumulator.push([current, 1]); // add a new entry
            }
            return accumulator;
        }, []);
        // We look for rots with 2 stays and with indentical stay length
        // and with a diff of two nights
        if (stayTuples.length === 2 && stayTuples[0][1] === stayTuples[1][1] && nightTuples.length === 2 && (nightTuples[1][1] - nightTuples[0][1] === 2)){
            const optimized = [].concat(nights[0], ...nights.slice(0,-1));
            let optimizedCountries = countries; 
            if (countries!== undefined) {
                optimizedCountries = [].concat(countries[0], ...countries.slice(0,-1));
            }
            console.log(`Optimisation des nuits sur ${rot.summary} du ${rot.start.substring(0,10).split('-').reverse().join('/')}\n(conformément à l'exemple 13 du mémento fiscal)\n${nights} -> ${optimized}`);
            return [optimized, optimizedCountries];
        }
    }
    return [nights, countries];   
};

export const iata2country = (iata) => {
    const index = airportsData.indexOf(iata + ':');
    return (index >= 0) ? airportsData.substring(index + 4, index + 6): iata;
}

// Also we ensure at build time there is no possible errors
// due to inconsistency between airportsData, countriesData and exrData,
// we are still handling AmountError in findAmount* functions.
class AmountError extends Error {};

export const findAmountEuros = (countryData, isoDate, exrData) => {
    const [amount, currency] = findAmount(countryData, isoDate);
    const exr = exrData[currency];
    if (exr) {
        const rate = parseFloat(exr[2]);
        const euros = parseFloat((parseFloat(amount) / rate).toFixed(2));
        return euros;
    } else {
        throw new AmountError(`Taux de change inconnu pour ${currency}`);
    }
};

export const findAmount = (countryData, isoDate) => {
    for (const [date, currency, amount] of countryData.a) {
        if (date.localeCompare(isoDate) <= 0) {
            return [amount, currency];
        }
    }
    if (countryData) {
        throw new AmountError(`Pas d'indemnité définie pour ${countryData.n} au ${isoDate}`);
    } else {
        throw new AmountError(`Indemnité manquante`);
    }
};

export const addIndemnities = (taxYear, rots, taxData, tzConverter) => {
    const results = [];
    const countriesData = taxData.countries;
    const exrData = taxData.exr;
    const MC_REMOVAL = 0.5;
    const nextYear = (parseInt(taxYear, 10) + 1).toString();
    const previousYear = (parseInt(taxYear, 10) - 1).toString();
    for (const rot of rots) {
        let hasError = false;
        const indemnities = [];
        // check if we count all nights of if we have to substract 0.5
        let toRemove = MC_REMOVAL; // by default remove 0.5 night

        // Sum up the indemnities day by day in the rot
        let total = 0; // default is zero if it fails

        if (rot.nights.length === 0) {
            rot.formula = WITHIN_BASE_TEXT;
        } else if  (rot.nights.length > rot.days || rot.countries.length > rot.days) {
            rot.formula = NIGHT_OVERFLOW_TEXT;
            hasError = true;
        } else {
            // if at least one of the stopover is LC, count all nights
            for (const country of rot.countries) {
                const data = countriesData[country];
                if (data && data.z !== 1) {
                    toRemove = 0;
                    break;
                }
            }
            let taxStopCount = rot.countries.length; // taxStopCount is used to detect fiscal year truncate
            const taxStops = rot.countries.reduce((accumulator, current) => {
                const index = accumulator.length - 1;
                if (index > -1 && current === accumulator[index][1]) {
                    accumulator[index][0] += 1; // increase previous count
                }else{
                    accumulator.push([1, current]); // add a new entry
                }
                return accumulator;
            }, []);
            let validTaxStops = []; // used to recompute the formula after filtering stops to the current taxYear
            let validTaxStopCount = 0; // validTaxStopCount is compared at the end with taxStopCount
            // Apply removal to taxStops if needed
            if (toRemove !== 0 && taxStops.length > 0){
                taxStops[taxStops.length - 1][0] -= toRemove; //performs removal
                taxStopCount -= toRemove;
            }

            // we need to find the date for each day of the rot
            // to cover the case where daily tax amount change
            let deltaDays = 0;
            for (const [count, country] of taxStops) {
                let validCount = count;
                let data = countriesData[country];
                if (data && data.f === 1) data = countriesData["EU"]
                let amount = 0; // default is zero in case of error
                const countryIndemnities = []; // contains the extended formula with euro amounts
                if(data) {
                    try {
                        const stopIndemnities = []; // we need to reverse them after the loop
                        // detects if we need to apply MC_REMOVAL (3 > 2.5)
                        const doRemove = Math.ceil(count) > count;
                        //The forloop is constructed so that when i=0 we are on the last days
                        //This is simpler to filter data for taxYear
                        for (let i=0; i<Math.ceil(count); i++){
                            const delta = (deltaDays - i) + Math.ceil(count) - i - 1;
                            const isoDate = tzConverter(rot.start, delta);
                            const year = isoDate.substring(0,4);
                            if (year === taxYear) {
                                const euros = findAmountEuros(data, isoDate.substring(0, 10), exrData);
                                amount += (i===0 && doRemove) ? MC_REMOVAL * euros : euros;
                                stopIndemnities.push([(i===0 && doRemove) ? MC_REMOVAL : 1, findAmount(data, isoDate.substring(0, 10)).join('')]);
                            }else if (year === nextYear && rot.isComplete === '>') {
                                //pass
                            }else if (year === previousYear && rot.isComplete === '<') {
                                //pass
                            }else{
                                validCount -= (i===0 && doRemove) ? MC_REMOVAL : 1;
                            }
                            deltaDays += 1;
                        }
                        validTaxStopCount += validCount;
                        if (validCount >= 0) validTaxStops.push([validCount, country]);
                        if(stopIndemnities.length > 0) countryIndemnities.push(...stopIndemnities.reverse());
                    } catch (err) {
                        hasError = true;
                        if (err instanceof AmountError) {
                            console.error(err.message);
                        } else {
                            console.error(err);
                        }
                    }
                } else {
                    hasError = true;
                    if (country.length === 2) {
                        console.error(`Données pays manquantes pour ${country}`);
                    } else {
                        console.error(`Code IATA inconnu ${country}`);
                    }
                }
                if(countryIndemnities.length > 0) {
                    indemnities.push(countryIndemnities.reduce((accumulator, current) => {
                        const index = accumulator.length - 1;
                        if (index > -1 && current[1] === accumulator[index][1]) {
                            accumulator[index][0] += current[0]; // increase previous count
                        }else{
                            accumulator.push(current); // add a new entry
                        }
                        return accumulator;
                    }, []));
                }
                total += amount;
            }
            validTaxStops = validTaxStops.reduce((a, c) => {
                if (c[0] > 0) {
                    return a.concat([[localeFormat(c[0], {"style": "decimal", "minFractionDigits": 0, "maxFractionDigits": 1}), c[1]]]);
                }
                return a;
            }, []);
            rot.formula = validTaxStops.map(a => a.join(" x ")).join(' + ');
            rot.formula += (!hasError && taxStopCount !== validTaxStopCount) ? REFNOTE1 : "";
            rot.formula += (hasError || taxStopCount < rot.days -MC_REMOVAL ) ? ` ${FORMULA_ERROR}` : "";
            // indemnities = [[[times, amount1Stop1],[times, amount2Stop1]], [[times, amount1Stop2]])
            const stops = [];
            for (const stop of indemnities) {
                const stopLocalized = stop.reduce((a, c) => {
                    return a.concat([[localeFormat(c[0], {"style": "decimal", "minFractionDigits": 0, "maxFractionDigits": 1}), c[1]]]);
                }, []);
                const stopFormula = stopLocalized.map(a => a.join(' x ')).join(' + ');
                (stop.length > 1) ? stops.push(`(${stopFormula})`) : stops.push(stopFormula);
            }
            rot.currencyFormula = stops.join(' + ');
            if(validTaxStops.length <= 0 && taxStops.length !== 0 && !hasError) continue; // taxStops=0 => indemnity=0 and is valid for base only rots
        }
        rot.indemnity = (hasError) ? 0 : parseFloat(total.toFixed(2));
        rot.error = hasError;
        results.push(rot);
    }
    return results;
}
// ep5 iterable
export function* ep5Iterator(data){
    for (const m of months14) {
        const monthData = data[m];
        if (monthData) {
            yield* monthData.rots;
        }
    }
};
// in tests we use array to pass rots
export function* testIterator(data) {
    for (const a of data) {
        yield* a;
    }
};

export const mergeFlights = (flights1, flights2) => {
    const f1 = [...flights1];
    const f2 = [...flights2];
    if (f2.length>0) {
        if (f2[0].stop==='0,00' && f1.length>0) {
            const flight2 = f2.shift();
            const flight1 = {...f1.pop()};
            flight1.end = flight2.end;
            return f1.concat(flight1, [...f2]);
        }
    }
    return f1.concat(f2);
};
//merge Rot without needing to copy the EP5 structure
export const mergeRots = (data, taxYear, taxData, tzConverter) => {
    const currentIt = Array.isArray(data) ? testIterator(data) : ep5Iterator(data);
    const nextIt = Array.isArray(data) ? testIterator(data) : ep5Iterator(data);
    nextIt.next();
    const mergedRots = [];
    for (const rot of currentIt) {
        const next = nextIt.next().value;
        if (next && rot.isComplete === '<' && next.isComplete === '>' && rot.end.substring(0, 7) === next.end.substring(0, 7)) {
            const [merged] = buildRots(mergeFlights(rot.flights, next.flights), {base:rot.base, tzConverter, "iataMap": iata2country});
            const [mergedWithIndemnities] = addIndemnities(taxYear,[merged], taxData, tzConverter);
            mergedRots.push(mergedWithIndemnities);
            // skip next
            currentIt.next();
            nextIt.next();
        } else {
            mergedRots.push(rot);
        }
    } 
    return mergedRots;
};

export const ep5Parser = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const result = {"type": "ep5", fileName, fileOrder};
    const previousTaxYear = (parseInt(taxYear, 10) - 1).toString();
    const nextTaxYear = (parseInt(taxYear, 10) + 1).toString();
    let match;
    let pattern;
    let month;
    let year;
    // search EP5 Date like JANVIER 2020
    pattern = /\s(JANVIER|FEVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DECEMBRE)\s+?(20\d{2})/;
    if (null !== (match = pattern.exec(text))) {
        const monthIndex = EP5MONTHS.indexOf(match[1]);
        if ( monthIndex !== -1) {
            month = (monthIndex + 1).toString(10).padStart(2, '0');
            year = match[2];
        } else {
            throw new Error('EP5 parser: Invalid month ' + match[1] + `in ${fileName}`);
        }
    }else{
        throw new Error(`EP5 parser:  Date not found in ${fileName}`);
    }
    
    //search EP5 for flights
    if (month === "01" && year === nextTaxYear) {
        result.date = `${taxYear}-13`;
    }else if (month === "12" && year === previousTaxYear) {
        result.date = `${taxYear}-00`;
    } else {
        result.date = `${year}-${month}`;
    }

    //0,00 T-77W  GSQY 0 PEK  01 00,00 CDG  01 04,03
    //Ce pattern ne prend pas les simus
    //1 : temps d'arrêt précédent 0,00 si à cheval sur mois precedent
    //2 : type avion ou espace si mep
    //3 : immatriculation
    //4 : type activité (0)
    //5 : escale départ
    //6 : jour départ
    //7 : heure decimale tu départ (00,00 si début de mois)
    //8 : escale arrivée
    //9 : jour arrivée
    //10: heure decimale tu arrivée  (24,00 si fin de mois et à cheval)
    pattern = /([0-9,]+)\s(?:.{5})\s{2}(?:\S{4})\s(?:.+?)\s(\S{3})\s+(\d+)\s+([0-9,]+)\s+(\S{3})\s+(\d+)\s+([0-9,]+)/g;
    const flights = [];
    while (null !== (match = pattern.exec(text))) {
        const [, stop, dep, depDay, depTime, arr, arrDay, arrTime] = match;
        flights.push({stop, dep, "start": `${year}-${month}-${depDay}T${ep5Time2iso(depTime)}`, arr, "end": `${year}-${month}-${arrDay}T${ep5Time2iso(arrTime)}`});
    }
    // in case of multiple EP5 pages, ensure flights are sorted by start date
    const sortedFlights = flights.sort((a, b) => a.start.localeCompare(b.start))
    let rots = buildRots(sortedFlights, {base, tzConverter, "iataMap": iata2country});
    rots = addIndemnities(taxYear, rots, taxData, tzConverter);
    result.rots = rots;
    return result;
};