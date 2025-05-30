import Papa from 'papaparse';
import fs from 'fs';
import got from 'got';

const airportsPath = "./data/airports.json";
const gistURL = "https://github.com/mborsetti/airportsdata/raw/main/airportsdata/airports.csv";

//init with manex airports not referenced in airports.csv
//not sure QQO is really the iata code of LGEL, could not find this information in Wikipedia
let results = "QYF:FRTLN:FRAZR:DZELG:DZBYK:CIBER:DEKRN:SEMJN:MGFYT:TDMWH:USQQO:GRILS:SVRGI:PFHOI:PFOSN:KRUBN:MNBYH:USALY:EGNLU:MXTFU:CNPJY:RUQIE:FRKIV:MDRMO:MDBUH:RONBJ:AO";

const processRow = (row) => {
    const [icao, iata, name, city, subd, country, elevation, lat, lon, tz] = row.data;
    if (icao && icao !== "icao" && iata && city && tz) {
        let taxCountry = country;
        if (country === "JP" && city === "Tokyo") {
            taxCountry = "TY";
        } else if ((iata === 'EWR') || (country === "US" && city === "New York")) {
            taxCountry = "NY";
        } else if (['YTZ', 'YKZ', 'YYZ'].includes(iata)) { // Toronto depuis 10/07/2024
            taxCountry = "VT";
        } else if (['CXH', 'YVR'].includes(iata)) { // Vancouver depuis 10/07/2024
            taxCountry = "VV";
        } else if (iata === 'LFW') { // Lome depuis 10/07/2024
          taxCountry = 'VL';
        } else if (["ABV", "LOS", "PHC"].includes(iata)) { // Abuja, Lagos, Port Harcourt depuis 16/05/2023
          taxCountry = 'NV'
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
            // ensure manex airports are defined, this is commented out as I don't want to include Global csv file in the repo
            // const airportsManex = '../lido-online/data/Global2501.csv';
            // const file = fs.createReadStream(airportsManex);
            // Papa.parse(file, {
            //     step: function(result) {
            //         let iata = result.data[2];
            //         if (result.data[0] === "FBFT") iata = "FRW";
            //         if (!iata || iata === "IATA") return;
            //         if (results.indexOf(iata + ':') < 0) {
            //             console.log(`missing ${iata} (${result.data[0]} ${result.data[1]})`);
            //         };
            //     }
            // });
        }
    });
};

Papa.parse(got.stream(gistURL), { "step": processRow, "complete": save });
