import {payParser} from "./payParser";
import {ep5Parser} from "./ep5Parser";
import {nightsAFParser} from "./nightsAFParser";

// Based on PDF text content, performs task(s)
// Return array of result
export const router = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const results = [];
    if (text.match(/BULLETIN DE PAIE_(AIR FRANCE|BASE)/)) {
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
        if(text.indexOf('CARNET _DE _VOL _- _EP _5')!== -1) {
            if(isNuiteesAF) {
                results.push(nightsAFParser(text, fileName, fileOrder, taxYear));
            }else{
                results.push(ep5Parser(text, fileName, fileOrder, taxYear, taxData, base, tzConverter));
            }
        }else if(isNuiteesAF) {
            results.push(nightsAFParser(text, fileName, fileOrder, taxYear));
        }
    }
    if (results.length === 0) {
        if(text.indexOf("ATTESTATION DE DECOMPTE DES NUITEES POUR L'ANNEE ") !== -1) {
            results.push({"type": "warning", "msg":`type [nuitées] mais année ≠ ${taxYear}`, fileName, fileOrder, "content": text})
        } else {
            results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
        }
    }
    return results;
}
