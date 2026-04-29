import {payParser} from "./airfrance/payParser";
import {ep5Parser, ep5Parserf2} from "./airfrance/ep5Parser";
import {nightsAFParser} from "./airfrance/nightsParser";
import {ep4Parser} from "./airfrance/ep4Parser";

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
            const ep4Result = ep4Parser(text, fileName, fileOrder, taxYear);
            if (ep4Result) {
                results.push(ep4Result);
            } else {
                results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
            }
        }else{
            results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
        }
    }
    return results;
}
