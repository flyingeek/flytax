/*
 * Generates data with indemnities per country per year
 * Data also includes exchange rates from BNF Webstat EN API
 * Register an app at http://developer.webstat.banque-france.fr to get a clientId for the Webstat EN API
 *
 * To hide clientId on GitHub, we use dotenv
 * You need to set your client id in a .env file at the root of this project using a line like:
 * BNF_CLIENT_ID=xxxxxxxxxxxx
 *
 * To generate a new dataset:
 * node src/makeData.js [year]
 * or
 * npm makeData [year]
 *
 * You must build airports.json first using:
 * npm makeAirports
 */
import {months} from "../src/components/utils.js";
import { readFile } from 'fs/promises';
const airports =JSON.parse(await readFile(new URL('../data/airports.json', import.meta.url)));
let bnf;
// bnf =JSON.parse(await readFile(new URL('./test/data/apibnf_2020-12-23.json', import.meta.url)));
import Papa from 'papaparse';
import { Table } from 'console-table-printer';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import got from 'got';
import iconv from 'iconv-lite';

const scriptArgs = process.argv.slice(2);
const year = (scriptArgs.length === 1) ? scriptArgs[0] : new Date().getFullYear().toString();
const isoStart = `${year}-01-01`;
const isoEnd = `${year}-12-31`;
const monthsfr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const dataPath = `./data/data${year}.json`;
const csvPath = `./data/flytax-baremes${year}.csv`;
const WebpaysURL = "https://www.economie.gouv.fr/dgfip/fichiers_taux_chancellerie/txt/Webpays";
const WebmissURL = "https://www.economie.gouv.fr/dgfip/fichiers_taux_chancellerie/txt/Webmiss";
const apiURL = `https://api.webstat.banque-france.fr/webstat-en/v1/data/EXR/EXR.M.*.EUR.SP00.E?client_id=${process.env.BNF_CLIENT_ID}&format=json&startPeriod=${parseInt(year, 10) - 1}-12-01&endPeriod=${year}-12-31`;
//pays du memento fiscal SNPL + Estonie, Lettonie, Lituanie.
//DOM:  Martinique, Guadeloupe, Guyanne, La Réunion et aussi Mayotte et Saint-Pierre et Miquelon, St Martin, St Barth
//      St Martin, St Barth ne sont plus des DOM depuis 2007 mais ils figurent toujours dans l'arrêté de 2006 mis à jour en 2020
const zoneMC = ["AL", "DZ", "AD", "BA", "BG", "DK", "HR", "HU", "MK", "MA", "NO", "RO", "GB", "SE", "CH", "CZ", "TN", "YU", "PL"];
const zoneEuroMC = ["DE", "AT", "BE", "CY", "ES", "FI", "FR", "GR", "IE", "IT", "LU", "MT", "NL", "PT", "SK", "SI"];
const zoneEuroLC = ["EE", "LV", "LT", "HR"]; // Estonie, Lettonie, Lituanie, Croatie (2023)
const zoneDOM = ["YT", "PM", "GP", "MQ", "GF", "RE"];
const zoneDOMLC = ["SX", "MF", "BL"]; //SXM est sur SX iso MF (St Martin) donc on ajoute SX et MF
// pour le calcul de l'indemnité Euro (FLYTAX n'utilise plus les données URSSAF mais uniquement l'arrêté de 2006):
// URSSAF https://www.urssaf.fr/portail/home/taux-et-baremes/frais-professionnels/indemnite-de-grand-deplacement/deplacements-en-metropole.html
//        https://www.urssaf.fr/portail/home/taux-et-baremes/frais-professionnels/indemnite-de-grand-deplacement/deplacements-en-outre-mer.html
// Indemnités Frais de mission (arrêté de 2006) https://www.legifrance.gouv.fr/loda/id/LEGIARTI000042212803
// Pour 2023: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000242360 (et notamment l'article 1 pour FR/DOM)
// Abattement fiscal maximum au forfait: https://www.service-public.fr/particuliers/vosdroits/F1989

// data adjustment per year
const specificities = {
    "2024": {
        "URSSAF": [["2023-09-22", {"Base": [90.00, 20.00], "Paris": [140.00, 20.00], "Province": [120.00, 20.00], "DOM": [120.00, 20.00]}],
            ["2023-01-01", {"Base": [70.00, 17.50], "Paris": [110.00, 17.50], "Province": [90.00, 17.50], "DOM": [70.00, 17.50]}]], // used to compute forfaitEU

        //"URSSAF": {"Paris": [74.30, 20.70], "Province": [55.10, 20.70], "DOM": 105.00}, // moins interressant que l'arrêté ?
        "FOM": [["2023-09-22","EUR","168"], ["2021-01-01","EUR","132"]], // forfait OM
        "MAXFORFAIT10": 14171
    },
    "2023": {
        "URSSAF": [["2023-09-22", {"Base": [90.00, 20.00], "Paris": [140.00, 20.00], "Province": [120.00, 20.00], "DOM": [120.00, 20.00]}],
            ["2023-01-01", {"Base": [70.00, 17.50], "Paris": [110.00, 17.50], "Province": [90.00, 17.50], "DOM": [70.00, 17.50]}]], // used to compute forfaitEU
        //"URSSAF": {"Paris": [74.30, 20.70], "Province": [55.10, 20.70], "DOM": 105.00}, // moins interressant que l'arrêté ?
        "FOM": [["2023-09-22","EUR","168"], ["2021-01-01","EUR","132"]], // forfait OM
        "MAXFORFAIT10": 14171
    },
    "2022": {
        "URSSAF": {"Base": [70.00, 17.50], "Paris": [110.00, 17.50], "Province": [90.00, 17.50], "DOM": [70.00, 17.50]}, // used to compute forfaitEU
        //"URSSAF": {"Paris": [69.50, 19.40], "Province": [51.60, 19.40], "DOM": 105.00}, // moins interressant que l'arrêté ?
        "FOM": [["2021-01-01","EUR","132"]], // forfait OM
        "MAXFORFAIT10": 13522
    },
    "2021": {
        "URSSAF": {"Base": [70.00, 17.50], "Paris": [110.00, 17.50], "Province": [90.00, 17.50], "DOM": [70.00, 17.50]}, // used to compute forfaitEU
        //"URSSAF": {"Paris": [69.50, 19.40], "Province": [51.60, 19.40], "DOM": 105.00}, // moins interressant que l'arrêté ?
        "FOM": [["2021-01-01","EUR","132"]], // forfait OM
        "MAXFORFAIT10": 12829
    },
    "2020": {
         // arrêté 2006 utilise 3 zones en metropole 70€/90€/110€ moyennne 90€
        "URSSAF": {"Base": [70.00, 17.50], "Paris": [110.00, 17.50], "Province": [90.00, 17.50], "DOM": [70.00, 17.50]}, // used to compute forfaitEU
        //"URSSAF": {"Paris": [68.50, 19.10], "Province": [50.80, 19.10], "DOM": 105.00}, // moins interressant que l'arrêté
        "FOM": [["2020-01-01","EUR","132"]], // forfait OM
        "MAXFORFAIT10": 12652
    },
    "2019": {
        // utilise arrêté de 2006
        "URSSAF": {"France": [60, 15.25], "DOM": 90.00},// used to compute forfaitEU
        //"URSSAF": {"Paris": [67.40, 18.80], "Province": [50.00, 18.80], "DOM": 90.00},// urssaf values not used anymore
        "MAXFORFAIT10": 12627
    },
    "2018": {
        "URSSAF": {"Paris": [66.50, 18.60], "Province": [49.40, 18.60], "DOM": 90.00}, // not used
        "MAXFORFAIT10": 12502
    },
    "2017": {
        "URSSAF": {"Paris": [65.80, 18.40], "Province": [48.90, 18.40], "DOM": 90.00}, // not used
        "MAXFORFAIT10": 12305,
        "FEU": [["2017-01-01","EUR","156"]], // forfait Euro (computed from 2019 and beyond)
        "FOM": [["2017-01-01","EUR","120"]], // forfait OM (PPT, Nouvelle Calédonie et Wallis et Futuna)
        "EURO": zoneEuroMC.concat(zoneEuroLC), // zone Euro pour calcul du forfait Euro
        "EU": zoneEuroMC.concat(zoneEuroLC, zoneDOM, zoneDOMLC), // forfait Euro
        "MC": zoneEuroMC.concat(zoneMC, zoneDOM, zoneDOMLC),
        "OM": ["WF", "NC", "PF"], // territoires pour le Forfait OM
        "replace": {
            "TI": "TL" // Code Timor oriental TI in webmiss but TL in airports
        },
        "webmissUndefinedCountries":  [ // Those will have an amount of 0 EUR
            "BT", // Bouthan
            "GL", // Groenland
            "GG", // Guernesey
            "JE", // Jersey
            "IM", // Île de Man
            "FK", // Îles Falkland
            "FO", // Féroé, îles
            "IO", // Indien (Territoire britannique de l'océan)
            "EH", // Sahara occidental
            "TC", // Îles Turques et Caïques
            "AS", // Samoa américaines
            "MP", // Îles Mariannes du Nord
            "GU", // Guam
            "UM", // Îles Mineures éloignées des États-Unis
            "VI", // Îles vierges des Etats-Unis
            "PR", // Porto Rico
            "BQ", // Bonaire, Saint-Eustache et Saba
            "MS", // Montserrat
            "VG", // Îles Vierges britanniques
            "CX", // Christmas, île
            "NF", // Île Norfolk
            "AQ"  //ANTARTIQUE
        ]
    }
};
const specificity = (key) => {
    if (specificities[year] && specificities[year][key]) {
        return specificities[year][key];
    }
    return specificities["2017"][key];
};

// countries not defined in WebPays but used in Webmiss
// or countries not defined in WebPays but used in airports.json
const countries = {
    "FR": {"n": "FRANCE"},
    "GP": {"n": "GUADELOUPE"},
    "MQ": {"n": "MARTINIQUE"},
    "GF": {"n": "GUYANE"},
    "RE": {"n": "RÉUNION"},
    "GI": {"n": "GIBRALTAR"},
    "SX": {"n": "SAINT-MARTIN"},
    "MF": {"n": "SAINT-MARTIN"},
    "BL": {"n": "SAINT-BARTHÉLEMY"},
    "CD": {"n": "RÉP. DU CONGO"},//bad formatting in Webpays
    "CF": {"n": "RÉP. CENTRAFICAINE"},//bad formatting in Webpays
    "CZ": {"n": "RÉP. TCHEQUE"},//bad formatting in Webpays
    "DO": {"n": "RÉP. DOMINICAINE"}, //bad formatting in Webpays
    "MH": {"n": "ILES MARSHALL"}, //bad formatting in Webpays
    "SB": {"n": "ILES SALOMON"}, //bad formatting in Webpays
    "SS": {"n": "SOUDAN DU SUD"}, // bad char in Webpays
    "LC": {"n": "SAINTE-LUCIE ET…"}, //bad formatting in Webpays
    "YE": {"n": "RÉP. DU YEMEN"}, //bad formatting in Webpays
    "EU": {"n": "EUROPE (FORFAIT)"}, // custom entry for f field
    "GL": {"n": "DK-Groenland"},// defined in airports
    "GG": {"n": "GB-Guernesey"},// defined in airports
    "JE": {"n": "GB-Jersey"},// defined in airports
    "IM": {"n": "GB-Île de Man"},// defined in airports
    "FK": {"n": "GB-Îles Falkland"},// defined in airports
    "FO": {"n": "DK-Féroé, îles"},// defined in airports
    "IO": {"n": "GB-Indien (Territoire britannique de l'océan)"},// defined in airports
    "EH": {"n": "MA-Sahara occidental"},// defined in airports
    "TC": {"n": "GB-Îles Turques et Caïques"},// defined in airports
    "AS": {"n": "US-Samoa américaines"},// defined in airports
    "MP": {"n": "US-Îles Mariannes du Nord"},// defined in airports
    "GU": {"n": "US-Guam"},// defined in airports
    "UM": {"n": "US-Îles Mineures éloignées des États-Unis"},// defined in airports
    "VI": {"n": "US-Îles vierges des Etats-Unis"},// defined in airports
    "PR": {"n": "US-Porto Rico"},// defined in airports
    "BQ": {"n": "NL-Bonaire, Saint-Eustache et Saba"},// defined in airports
    "MS": {"n": "GB-Montserrat"},// defined in airports
    "VG": {"n": "GB-Îles Vierges britanniques"},// defined in airports
    "CX": {"n": "AU-Christmas, île"},// defined in airports
    "NF": {"n": "AU-Île Norfolk"},// defined in airports
    "AQ": {"n": "ANTARTIQUE"}// defined in airports
};

const codeMC = specificity("MC");
const zoneForfaitEuro = specificity("EU").sort();
const zoneForfaitOM = specificity("OM"); // Territoires où s'applique le forfait OM
const zoneEURO = specificity("EURO"); // Pays zone Euro hors DOM (pour calcul forfait Euro)
let forfaitEU = specificity("FEU"); // default value
let euroData = []; // will contain data to build the euro csv/tsv
const forfaitOM = specificity('FOM');
const replace = specificity("replace"); // bogus country code in Webmiss
const exchangeRateSource = (currency) => (currency[3] !== false) ? 'BNF' : (year === '2021' ? 'Xe.com' : 'github');


const log = (v, color) => {
    if (typeof v === 'string' || v instanceof String) {
        if (color) {
            console.log(chalk.bold[color](v));
        } else {
            console.log(v);
        }
    } else {
        console.log(v);
    }
}


const processWebpays = (row) => {
    let [country, , name] = row.data;
    if (country && name) {
        country = country.trim();
        if (["BU", "EU", "MC", "PS", "XC"].indexOf(country) === -1) { // Those countries do not appear in airports.json
            name = name.trim();
            name = name.replace(/\s\([^)]+\)/, '').replace(/\s+/g, ' ');
            if (countries[country] === undefined) {
                countries[country] = {"n" : name};
            }
        }
    }
}

// returns false if no amounts match for date validity
const satisfyDateValidity = (amounts, date) => {
    return amounts.reduce(
        (acc, current) => acc + (current[0].localeCompare(date) <=0),
        0) > 0;
};


const processWebmiss = (row) => {
    let [country, d, currency, , g1] = row.data;
    if (country) {
        if (replace[country] !== undefined) {
            const replaced = replace[country];
            countries[replaced] = countries[country];
            country = replaced;
        }
        const isoDate = d.split('/').reverse().join('-');
        g1 = g1.substring(0, g1.length -4) + '.' + g1.substring(g1.length -4);
        g1 = g1.replace(/^0+|\.?0+$/g, '');
        const data = [isoDate, currency, g1];
        let storedCountry = countries[country];
        if (!storedCountry) {
            log('adding country' + country, "yellow");
            countries[country] = {"n" : country}; // best default value we can get
            storedCountry = countries[country];
        }
        const storedAmount = storedCountry.a;
        // We filter amounts to only keep relevant data based on year
        if (storedAmount) {
            if (isoDate.localeCompare(isoEnd) <= 0) { // skip future
                // alreadySatisfy is > 0 when at least one date in the past is present
                const alreadySatisfy = satisfyDateValidity(storedAmount, isoStart);
                if (isoDate.localeCompare(isoStart) >= 0 || !alreadySatisfy) {
                    storedAmount.push(data);
                }
            }
        } else {
            if (isoDate.localeCompare(isoEnd) <= 0) {  // skip future
                countries[country].a = [data];
            }
        }
    }
};


const validate = () => {
    const errors = [];
    for (const [key, value] of Object.entries(countries)) {
        if (!value.n) {
            errors.push('missing name for ' + key);
        }
        if (!value.a && value.f === undefined) {
            errors.push('missing amounts for ' + key);
            errors.push(countries[key]);
        }
    }
    const airportsCountries = new Set();
    for (let i=0; i < airports.length; i = i+6) {
        const country = airports.substring(i + 4, i + 6);
        airportsCountries.add(country);
    }
    for (const country of airportsCountries) {
        if (!countries[country]) {
            errors.push(`undefined country ${country} (used in airports.json)`);
        }else if (countries[country].f === undefined && countries[country].a === undefined){
            errors.push(`no amount for ${country} (used in airports.json)`);
        }else if (countries[country].f === undefined) {
            if (!satisfyDateValidity(countries[country].a, isoStart)) {
                errors.push(`no amount for ${country} (used in airports.json) satisfy to ${isoStart}`);
                errors.push(countries[country].a);
            }
        }
    }
    errors.map(v => log(v, "red"));
    return errors.length === 0;
}

const findUsedCurrencies = () => {
    const currencies = new Set();
    for (const country of Object.values(countries)) {
        if (country.a && country.f !== 1) {
            for (const def of country.a){
                currencies.add(def[1]);
            }
        }
    }
    return [...currencies];
}

const save = (data) => {
    fs.writeFile(dataPath, JSON.stringify(data), (err) => {
        if (err) {
            throw err;
        } else {
            log(`Saved ${dataPath}`, "green");
        }
    });
}

const display = ([countries, exr]) => {
    const table = new Table();
    const rows = [];
    for (const [key, value] of Object.entries(countries)) {
        if (key === "EU") continue;
        const amounts = (value.f === 1) ? countries["EU"].a : value.a || [];
        for (const indemnity of amounts) {
            const validity = indemnity[0].split('-').reverse().join('/');
            const currency = indemnity[1];
            try {
                const row = {
                    "Pays": (value.n.length <= 21) ? value.n : value.n.substring(0, 20) + '…',
                    "Code": key,
                    "Validité": validity,
                    "Montant": `${indemnity[2]} ${currency}`,
                    "Taux Début": exr[currency][0],
                    "Taux Fin": exr[currency][1],
                    "Taux": exr[currency][2],
                    "Montant €": (parseFloat(indemnity[2]) / exr[currency][2]).toFixed(2),
                    "Zone": (value.z === 1) ? "Moyen": "Long",
                    "Source": exchangeRateSource(exr[currency])
                }
                rows.push(row);
            } catch(err) {
                log(`Error processing country ${key}, currency ${currency}`, "red");
                //throw err;
            }
        }
    }
    table.addRows(rows.sort((a, b) => a.Code.localeCompare(b.Code)));
    table.printTable();
}

const makeCsv = ([countries, exr], {separator=',', decimalSeparator='.', encoding="ascii"} = {}) => {
    let rows = [];
    const previousYear = parseInt(year, 10) - 1;
    const newLine = '\n';
    let enclose;
    if (encoding === 'utf-8') {
        enclose = (v) => `"${v.replace(/"/g,"'")}"`;
    } else {
        enclose = (v) => `"${iconv.encode(v.replace(/[éèê]/g,'e').replace(/[ÉÈÊ]/g,'E').replace('…', '...').replace(/"/g,"'"), "ascii")}"`;
    }
    const decimal = (v) => {
        if (decimalSeparator === ".") return v;
        const replaced =  v.toString().replace('.', decimalSeparator);
        return (decimalSeparator === separator) ? enclose(replaced) : replaced;
    };
    let i = 0;
    for (const [key, value] of Object.entries(countries)) {
        const amounts = (value.f === 1) ? countries["EU"].a : value.a || [];
        for (const indemnity of amounts) {
            const validity = indemnity[0].split('-').reverse().join('/');
            const currency = indemnity[1];
            try {
                const zone = (v) => {
                    if (v.f === 1 && v.z === 1) return "E+M";
                    if (v.f === 1 && v.z !== 1) return "E+L";
                    if (v.z === 1) return "M";
                    return "L";
                };
                const row = {
                    "Code": enclose(key),
                    "Pays": enclose(value.n),
                    "Date": enclose(validity),
                    "Montant": decimal(indemnity[2]),
                    "Monnaie": enclose(currency),
                    ["Taux 31/12/" + previousYear]: decimal(exr[currency][0]),
                    ["Taux 31/12/" + year]: decimal(exr[currency][1]),
                    "Taux moyen": decimal(exr[currency][2]),
                    "Zone": enclose(zone(value)),
                    "Montant EUR": decimal((parseFloat(indemnity[2]) / exr[currency][2]).toFixed(2)),
                    "Source": enclose(exchangeRateSource(exr[currency]))
                }
                if (indemnity[2] !== "0") rows.push(row);
            } catch(err) {
                log(`Error processing country ${key}, currency ${currency}`, "red");
                throw err;
            }
        }
        i++;
    }
    const csvLines = [];
    for (const [i,row] of Object.entries(rows.sort((a, b) => a.Code.localeCompare(b.Code)))) {
        if (i==="0") csvLines.push(Object.keys(row).map(v => enclose(v)).join(separator));
        csvLines.push(Object.values(row).join(separator));
    };
    rows = [];
    const outputPath = (separator === '\t') ? csvPath.replace('.csv', '.tsv') : csvPath
    fs.writeFile(outputPath, csvLines.join(newLine), (err) => {
        if (err) {
            throw err;
        } else {
            log(`Saved ${outputPath}`, "green");
        }
    });
}
const makeEuroCsv = (csvData, average, {separator=',', decimalSeparator='.', encoding="ascii"} = {}) => {
    const newLine = '\n';
    let enclose;
    if (encoding === 'utf-8') {
        enclose = (v) => `"${v.replace(/"/g,"'")}"`;
    } else {
        enclose = (v) => `"${iconv.encode(v.replace(/[éèê]/g,'e').replace(/[ÉÈÊ]/g,'E').replace(/û/g, 'u').replace('…', '...').replace(/"/g,"'"), "ascii")}"`;
    }
    const decimal = (v) => {
        if (decimalSeparator === ".") return v;
        const replaced =  v.toString().replace('.', decimalSeparator);
        return (decimalSeparator === separator) ? enclose(replaced) : replaced;
    };

    const csvLines = [];
    const items = csvData.sort((a, b) => a[0].localeCompare(b[0]));
    for (let i = 0; i < items.length; i++) {
        //console.log(items[i]);
        if (i===0) csvLines.push(['Code', 'Pays'].concat(monthsfr, 'Moyenne').map(v => enclose(v)).join(separator));
        const line = [...items[i]];
        for (let j = 0; j < line.length; j++) {
            if (j===0 || j===1) {
                line[j] = enclose(line[j]);
            } else {
                line[j] = decimal(line[j]);
            }
        }
        csvLines.push(line.join(separator));
    };
    csvLines.push(new Array(13).fill('').concat(enclose('Moyenne'), decimal(average)).join(separator));

    const euroCsvPath = csvPath.replace('.csv', '-zone_euro.csv');
    const outputPath = (separator === '\t') ? euroCsvPath.replace('.csv', '.tsv') : euroCsvPath;
    fs.writeFile(outputPath, csvLines.join(newLine), (err) => {
        if (err) {
            throw err;
        } else {
            log(`Saved ${outputPath}`, "green");
        }
    });
}
// promisify https and Papa parse
const parseCsvStream = (url, options) => {
    const opt = Object.assign({}, options); // clone
    return new Promise((resolve, reject) => {
        if (opt.complete) {
            const oldFn = opt.complete;
            const newFn = (results) => {
                try {
                    const res = oldFn(results);
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            };
            opt.complete = newFn;
        } else {
            opt.complete = resolve;
        }
        if (opt.step) {
            const oldFn = opt.step;
            const newFn = (results) => {
                try {
                    oldFn(results);
                } catch (err) {
                    reject(err);
                }
            };
            opt.step = newFn;
        }
        try {
            Papa.parse(got.stream(url), opt);
        } catch (err) {
            reject(err);
        }
    })
};
const findAmount = (amounts, isoDate) => {
    for (const amount of amounts) {
        if (amount[0].localeCompare(isoDate) <= 0) {
            return [amount[2], amount[1]];
        }
    }
    throw new Error(`no matching amount for ${isoDate}`);
};
const findUrrsaf = (amounts, isoDate) => {
    for (const amount of amounts) {
        if (amount[0].localeCompare(isoDate) <= 0) {
            return amount[1];
        }
    }
    throw new Error(`no matching urssaf data for ${isoDate}`);
};
const computeForfaitEU = () => {
    if (["2017", "2018"].includes(year)) return forfaitEU;
    const results = [];
    const csv = [];
    for (const country of zoneEURO) {
        if (country === "FR") continue;
        const res = [];
        for (const month of months){
            const [value, currency] = findAmount(countries[country].a, `${year}-${month}-01`);
            if (currency !== "EUR") throw new Error(`currency not in EUR`);
            res.push(parseFloat(value));
        }
        const average = res.reduce((a, b) => a + b) / res.length;
        csv.push([country, countries[country].n].concat(...res.concat(average).map(v => v.toFixed(2))));
        results.push(average);
    }
    const urssafOrArray = specificity("URSSAF");
    let urssafArray = urssafOrArray;
    if (!Array.isArray(urssafOrArray)){
      urssafArray = [`${year}-01-01`, urssafOrArray];
    }
    const resFR = [];
    const resDOM = [];
    for (const month of months){
        const urssaf = findUrrsaf(urssafArray, `${year}-${month}-01`);
        if ("France" in urssaf) { /* arrete 2006 */
            const france = urssaf["France"][0] + (2 * urssaf["France"][1]);
            resFR.push(france);
        } else { /* urssaf ou arrete 2006 modifié en 2020 */
            const paris = urssaf["Paris"][0] + (2 * urssaf["Paris"][1]);
            const province = urssaf["Province"][0] + (2 * urssaf["Province"][1]);
            if ("Base" in urssaf) { /* arrete 2006 modifié en 2020 */
                const base = urssaf["Base"][0] + (2 * urssaf["Base"][1]);
                resFR.push((paris + province + base) / 3);
            }else{
                resFR.push((paris + province) / 2);
            }
        }
        if (Array.isArray(urssaf["DOM"])) {
            const dom = urssaf["DOM"][0] + (2 * urssaf["DOM"][1]);
            resDOM.push(dom);
        } else {
            resDOM.push(urssaf["DOM"]);
        }
    }
    const averageFR = resFR.reduce((a, b) => a + b) / resFR.length;
    results.push(averageFR);
    const averageDOM = resDOM.reduce((a, b) => a + b) / resDOM.length;
    results.push(averageDOM);

    csv.push(['FR', 'FRANCE'].concat(...(resFR.concat(averageFR)).map(e => e.toFixed(2))));
    csv.push(['FR', 'DOM'].concat(...(resDOM.concat(averageDOM)).map(e => e.toFixed(2))));
    const average = results.reduce((a, b) => a + b) / results.length;
    return [csv, [[`${year}-01-01`, "EUR", average.toFixed(0)]]];
};

const make = async () => {
    await parseCsvStream(WebpaysURL, {"step": processWebpays});
    await parseCsvStream(WebmissURL, {"step": processWebmiss});

    // in Webmiss there is no valid value for Kosovo prior to 2018-07-20
    const extraData = ['2017-01-01', 'EUR', '0'];
    if (countries["XK"].a) {
        countries["XK"].a.push(extraData);
    } else {
        countries["XK"].a = [extraData];
    }
    for (const country of specificity("webmissUndefinedCountries")) {
        if (typeof countries[country].a === "undefined") countries[country].a = [extraData]; // unknown webmiss data;
    }

    // forfait EU will still be the default value for years 2017/2018
    [euroData, forfaitEU] = computeForfaitEU();
    countries["EU"].a = forfaitEU; // must be set before validate() call

    // add MC zone
    for (const c of codeMC) {
        try {
            countries[c].z = 1;
        } catch (err) {
            log(`countries['${c}'] is undefined`, "red");
            throw err;
        }
    }
    // add EU forfait
    for (const c of zoneForfaitEuro) {
        try {
            countries[c].f = 1;
        } catch (err) {
            log(`countries['${c}'] is undefined`, "red");
            throw err;
        }
    }
    // add OM forfait
    for (const c of zoneForfaitOM) {
        try {
            countries[c].a = forfaitOM;
        } catch (err) {
            log(`countries['${c}'] is undefined`, "red");
            throw err;
        }
    }
    if (validate()) {
        const errors = [];
        const warnings = [];
        const currencies = findUsedCurrencies();
        const exr = {
            'EUR': Array(3).fill("1.0000"),
            'XAF': Array(3).fill("655.9570"),
            'XOF': Array(3).fill("655.9570")
        };
        // a ||= b; only is ES2021 and node 15
        //<=> a || (a = b);
        bnf || (bnf = await got(apiURL).json()); // We use || to be able to set a local json file at the beginning
        // "01-05-2020 00:00:00" => "2020-05-01"
        const date2iso = (d) => d.ObservationPeriod.periodFirstDate.substring(0, 10).split('-').reverse().join('-');
        for (const serie of bnf.seriesObs) {
            const key = serie.ObservationsSerie.seriesKey.split('.')[2];
            if (currencies.includes(key)) {
                let observations = serie.ObservationsSerie.observations;
                if (observations === undefined || observations.length === 0){
                    warnings.push(`missing exchange rate for ${key}`); // will be an error later if needed
                    continue;
                }
                const obsLength = observations.length;
                if (obsLength < 13) {
                    warnings.push(`Exchange rate for ${key} is from ${observations[0].ObservationPeriod.periodName} to ${observations[obsLength - 1].ObservationPeriod.periodName}`);
                }
                observations = observations.sort((a, b) => date2iso(a).localeCompare(date2iso(b))); //enforce sort by date order
                const start = observations[0].ObservationPeriod.value;
                const end = observations[obsLength - 1].ObservationPeriod.value; //in case year is incomplete we just look for last one
                const average = ((start + end) / 2).toFixed(4);
                exr[key] = [start.toFixed(4), end.toFixed(4), parseFloat(average).toFixed(4)];
            }
        }
        if (year === "2018"){
            warnings.push(`adding manual exchange rate for ISK`);
            exr['ISK'] = ["124.2750", "133.5067", "128.8909"];
            warnings.push(`adding manual exchange rate for LTL`);
            exr['LTL'] = ["3.4528", "3.4528", "3.4528"];
        }
        if (year === "2017") {
            warnings.push(`adding manual exchange rate for ISK`);
            exr['ISK'] = ["118.8006", "124.2750" , "121.5378"];
            warnings.push(`adding manual exchange rate for LTL`);
            exr['LTL'] = ["3.4528", "3.4528", "3.4528"];
        }
        if (year === "2021") {
            const data = JSON.parse(await readFile(new URL('../data/data2020.json', import.meta.url)));
            const addRate = (currency, value) => {
                warnings.push(`adding manual exchange rate for ${currency} 31-12-${year}: ${value}`);
                const startRate = data['exr'][currency][1];
                const endRate = parseFloat(value).toFixed(4);
                const averageRate = ((parseFloat(startRate) + parseFloat(value))/2).toFixed(4);
                exr[currency] = [startRate, endRate, averageRate, false];
                //console.log(exr[currency]);
            }
            //xe.com last rate of 2021
            addRate('VUV', "127.919"); //https://www.xe.com/fr/currencycharts/?from=EUR&to=VUV&view=1W
            addRate('BMD', "1.13703");
            addRate('BND', "1.53345");
            addRate('CVE', "110.27");
            addRate('DJF', "202.279");
            addRate('DZD', "157.826");
            addRate('FJD', "2.40775");
            addRate('GMD', "60.0286");
            addRate('JOD', "0.806156");
            addRate('LYD', "5.2412");
            addRate('MUR', "49.5493");
            addRate('TWD', "31.5175");
        }
        for (const currency of currencies) {
            if (!exr[currency]) {
              let date = `${year}-01-01`;
              try {
                // console.log(`fetch exchange rate for ${currency} from fawazahmed0/currency-api`);
                const startData = await got(`https://raw.githubusercontent.com/fawazahmed0/currency-api/1/${date}/currencies/eur/${currency.toLowerCase()}.min.json`).json();
                if (startData['date'] !== date) {
                  throw new Error('exchange rate date mismatch')
                }
                date = `${year}-12-31`;
                const endData = await got(`https://raw.githubusercontent.com/fawazahmed0/currency-api/1/${date}/currencies/eur/${currency.toLowerCase()}.min.json`).json();
                if (endData['date'] !== date) {
                  throw new Error('exchange rate date mismatch')
                }
                const startRate = parseFloat(startData[currency.toLowerCase()]).toFixed(4);
                const endRate = parseFloat(endData[currency.toLowerCase()]).toFixed(4);
                const averageRate = ((parseFloat(startRate) + parseFloat(endRate))/2).toFixed(4);
                exr[currency] = [startRate, endRate, averageRate, false];
                warnings.push(`adding api exchange rate for ${currency} ${year}: ${startRate} / ${endRate}`);
              } catch (error) {
                  errors.push(`missing exchange rate for ${currency} ${date}`);
              }
            }
        }

        display([countries, exr]);
        const forfaitEuro = forfaitEU[0][2];
        log(`Forfait EU: ${forfaitEuro} ${forfaitEU[0][1]}`, 'cyan');
        for (let fom of forfaitOM) {
          log(`Forfait OM ${fom[0]}: ${fom[2]} ${fom[1]}`, 'cyan');
        }
        log(`found ${Object.keys(countries).length} countries in ${WebpaysURL.split('/').pop()}`);

        if (errors.length === 0) {
            save({countries, exr, year, zoneForfaitEuro, 'maxForfait10': specificity('MAXFORFAIT10'), 'urssaf': specificity('URSSAF')});
            makeCsv([countries, exr]);
            makeCsv([countries, exr], {separator: '\t', decimalSeparator: ','});
            if (euroData.length > 0) {
                makeEuroCsv(euroData, forfaitEuro);
                makeEuroCsv(euroData, forfaitEuro, {separator: '\t', decimalSeparator: ','});
                const t = new Table();
                t.addRows(euroData);
                t.printTable();
            }
        } else {
            errors.map(v => log(v, "red"));
        }
        warnings.map(v => log(v, "yellow"));
    }
}

make();
