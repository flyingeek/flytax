import Papa from 'papaparse';
import fs from 'fs';
import got from 'got';

const airportsPath = "./data/airports.json";
const gistURL = "https://github.com/mborsetti/airportsdata/raw/main/airportsdata/airports.csv";

let results = "TLN:FR";

const processRow = (row) => {
    const [icao, iata, name, city, subd, country, elevation, lat, lon, tz] = row.data;
    if (icao && icao !== "icao" && iata && city && tz) {
        let taxCountry = country;
        if (country === "JP" && city === "Tokyo") {
            taxCountry = "TY";
        } else if ((iata === 'EWR') || (country === "US" && city === "New York")) {
            taxCountry = "NY";
        }
        results += `${iata}:${taxCountry}`;
    }
};

const save = () => {
    fs.writeFile(airportsPath, JSON.stringify(results), (err) => {
        if (err) {
            throw err;
        } else {
            console.log(`Saved ${results.length / 6} airports! in ${airportsPath}`);
        }
    });
};

Papa.parse(got.stream(gistURL), { "step": processRow, "complete": save });
