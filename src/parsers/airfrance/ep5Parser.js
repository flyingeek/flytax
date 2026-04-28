import {iata2country} from '../../utilities/iata';
import {decimalHours2iso} from '../../utilities/dates';
import {isInTaxYearWindow, stampForTaxYear} from '../../utilities/taxYear';
import {buildRots, addIndemnities} from '../../rotations';

//months as written in EP5
export const EP5MONTHS = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'];

export const ep5Parser = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const result = {"type": "ep5", fileName, fileOrder};
    let match;
    let pattern;
    let month;
    let year;
    // search EP5 Date like JANVIER 2020
    pattern = String.raw`\s(${EP5MONTHS.join('|')})\s+?(20\d{2})`;
    const regex = new RegExp(pattern);
    if (null !== (match = regex.exec(text))) {
        const monthIndex = EP5MONTHS.indexOf(match[1]);
        month = (monthIndex + 1).toString(10).padStart(2, '0');
        year = match[2];
    }else{
        throw new Error(`EP5 parser:  Date not found in ${fileName}`);
    }

    //search EP5 for flights
    result.date = stampForTaxYear(month, year, taxYear);
    if (!isInTaxYearWindow(month, year, taxYear)) return result;

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
        flights.push({stop, dep, "start": `${year}-${month}-${depDay}T${decimalHours2iso(depTime)}`, arr, "end": `${year}-${month}-${arrDay}T${decimalHours2iso(arrTime)}`});
    }
    // in case of multiple EP5 pages, ensure flights are sorted by start date
    const sortedFlights = flights.sort((a, b) => {
      const c = a.start.localeCompare(b.start);
      if (c === 0) {
        return a.end.localeCompare(b.end);
      }
      return c;
    });
    let rots = buildRots(sortedFlights, {base, tzConverter, "iataMap": iata2country, "airline": "AF"});
    rots = addIndemnities(taxYear, rots, taxData, tzConverter, fileName);
    result.rots = rots;
    return result;
};

export const ep5Parserf2 = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const result = {"type": "ep5", fileName, fileOrder};
    let match;
    let pattern;
    let month;
    let year;

    // search EP5 Date like JANVIER 2020
    pattern = String.raw`_(${EP5MONTHS.join('|')})\s+?(20\d{2})_`;
    const regex = new RegExp(pattern);
    if (null !== (match = regex.exec(text))) {
        const monthIndex = EP5MONTHS.indexOf(match[1]);
        month = (monthIndex + 1).toString(10).padStart(2, '0');
        year = match[2];
    }else{
        throw new Error(`EP5 parser:  Date not found in ${fileName}`);
    }

    //search EP5 for flights
    result.date = stampForTaxYear(month, year, taxYear);
    if (!isInTaxYearWindow(month, year, taxYear)) return result;
    //_OTP_3.08_1.83_OOA_01 | 04.07_L-21_CDG_1.25_01 | 07.15_0_GTAY
    pattern = /_(\S{3})_(?:[0-9.]+(?:_[0-9.]+)?_[^_]+|[^_]+_[0-9.]+)_(\d+)\s\|\s([0-9.]+)_(?:[^_]+_(\S{3})(?:_[0-9.]+)?_(\d+)\s\|\s([0-9.]+)_\d_(?:[A-Z]{4})|\sZZ_(\S{3})_(\d+)\s\|\s([0-9.]+))/g;
    //1 : escale départ
    //2 : jour départ
    //3 : heure decimale tu départ
    //4 : escale arrivée
    //5 : jour arrivée
    //6: heure decimale tu arrivée
    const flights = [];
    while (null !== (match = pattern.exec(text))) {
        let [,dep, depDay, depTime, arr, arrDay, arrTime, mepArr, mepArrDay, mepArrTime] = match;
        arr = (typeof arr === 'undefined') ? mepArr : arr;
        arrDay = (typeof arrDay === 'undefined') ? mepArrDay : arrDay;
        arrTime = (typeof arrTime === 'undefined') ? mepArrTime : arrTime;
        let arrMonthInt = parseInt(month, 10), arrYearInt = parseInt(year, 10);
        if (/^\d+$/.test(depDay) && /^\d+$/.test(arrDay) && parseInt(arrDay, 10) < parseInt(depDay, 10)){
          arrMonthInt += 1;
          if (arrMonthInt > 12) {
            arrMonthInt = 1;
            arrYearInt += 1;
          }
        }
        flights.push({"stop": "", dep, "start": `${year}-${month}-${depDay}T${decimalHours2iso(depTime)}`, arr, "end": `${arrYearInt}-${arrMonthInt.toString(10).padStart(2, '0')}-${arrDay}T${decimalHours2iso(arrTime)}`});
    }
    // in case of multiple EP5 pages, ensure flights are sorted by start date and end date
    const sortedFlights = flights.sort((a, b) => {
      const c = a.start.localeCompare(b.start);
      if (c === 0) {
        return a.end.localeCompare(b.end);
      }
      return c;
    });
    let rots = buildRots(sortedFlights, {base, tzConverter, "iataMap": iata2country, "airline": "AF"});
    rots = addIndemnities(taxYear, rots, taxData, tzConverter, fileName);
    result.rots = rots;
    return result;
};
