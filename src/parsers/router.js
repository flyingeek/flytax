import {payParser} from "./payParser";
import {ep5Parser, ep5Parserf2, EP5MONTHS} from "./ep5Parser";
import {nightsAFParser} from "./nightsAFParser";

// Based on PDF text content, performs task(s)
// Return array of result
export const router = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const results = [];
    if (text.match(/BULLETIN DE PAIE_(AIR FRANCE|BASE|DP GN)/)) {
        try  {
            const result = payParser(text, fileName, fileOrder);
            if (result.errors) {
                for (const error of result.errors) {
                    results.push({"type": error.type, "msg": error.message, fileName, fileOrder, "content": text});
                }
            }
            results.push(result);
        } catch (err) {
            results.push({"type": "error", "msg":`${err.message}`, fileName, fileOrder, "content": err});
        }
    }else{
        const isNuiteesAF = text.indexOf(`ATTESTATION DE DECOMPTE DES NUITEES POUR L'ANNEE ${taxYear}`) !== -1;
        const isEP5f1 = text.indexOf('CARNET _DE _VOL _- _EP _5')!== -1;
        const isEP5f2 = text.indexOf(`_CARNET DE VOL -  EP5_`) !== -1;
        if(isEP5f1 || isEP5f2) {
            if(isNuiteesAF) {
                results.push(nightsAFParser(text, fileName, fileOrder, taxYear));
            }else if(isEP5f1){
                results.push(ep5Parser(text, fileName, fileOrder, taxYear, taxData, base, tzConverter));
            }else if(isEP5f2){
                results.push(ep5Parserf2(text, fileName, fileOrder, taxYear, taxData, base, tzConverter));
            }
        }else if(isNuiteesAF) {
            results.push(nightsAFParser(text, fileName, fileOrder, taxYear));
        }
    }
    if (results.length === 0) {
        if(text.indexOf("ATTESTATION DE DECOMPTE DES NUITEES POUR L'ANNEE ") !== -1) {
            results.push({"type": "nuitées", "error":`année ≠ ${taxYear}`, fileName, fileOrder, "content": text})
        } else if(text.indexOf('CARNET _DE _VOL _- _EP _5')=== -1){
            const pattern = String.raw`_EP\s?_4.+?_(${EP5MONTHS.join('|')})\s+?(20\d{2})`;
            const regex = new RegExp(pattern);
            let match;
            if (null !== (match = regex.exec(text))) {
                const monthIndex = EP5MONTHS.indexOf(match[1]);
                const month = (monthIndex + 1).toString(10).padStart(2, '0');
                const year = match[2];
                const previousTaxYear = (parseInt(taxYear, 10) - 1).toString();
                const nextTaxYear = (parseInt(taxYear, 10) + 1).toString();
                if (year === taxYear || (month === "01" && year === nextTaxYear) || (month === "12" && year === previousTaxYear)) {
                    results.push({"type": "ep4", "warning": `absence d'EP5`, fileName, fileOrder, "content": text});
                } else {
                    results.push({"type": "ep4", "date": `${year}-${month}`, fileName, fileOrder, "content": text});
                }
            }else{
                results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
            }
        }else{
            results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
        }
    }
    return results;
}
