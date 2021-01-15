import Papa from 'papaparse';
import fs from 'fs';
import got from 'got';

const airportsPath = "./data/airports.json";
const timezonesPath = "./data/timezones.json";
const gistURL = "https://github.com/mborsetti/airportsdata/raw/main/airportsdata/airports.csv";

let results = "";
let timezones = {};
let timezonesIndex = 0;
const processRow = (row) => {
    const [icao, iata, name, city, subd, country, elevation, lat, lon, tz] = row.data;
    if (icao && icao !== "icao" && iata && city && tz) {
        let taxCountry = country;
        if (country === "JP" && city === "Tokyo") {
            taxCountry = "TY";
        } else if ((iata === 'EWR') || (country === "US" && city === "New York")) {
            taxCountry = "NY";
        }
        let tzRef;
        if (tz in timezones) {
            tzRef = timezones[tz];
        } else {
            tzRef = timezonesIndex.toString(36).padStart(2, "0");
            timezones[tz] = tzRef;
            timezonesIndex++;
        }
        results += `${iata}:${taxCountry}${tzRef}`;
    }
};

const save = () => {
 const reversedTz = Object.assign({}, ...Object.entries(timezones).map(([a,b]) => ({ [b]: a })));

    fs.writeFile(airportsPath, JSON.stringify(results), (err) => {
        if (err) {
            throw err;
        } else {
            console.log(`Saved ${results.length / 8} airports! in ${airportsPath}`);
        }
    });
    fs.writeFile(timezonesPath, JSON.stringify(reversedTz),
        (err) => {
            if (err) {
                throw err;
            }else{
                console.log(`Saved ${Object.keys(reversedTz).length} timezones! in ${timezonesPath}`);
            }
    });
};

Papa.parse(got.stream(gistURL), { "step": processRow, "complete": save });
