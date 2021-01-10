import {payParser} from "./payParser";
import {ep5Parser} from "./ep5Parser";

// Based on PDF text content, performs task(s)
// Return array of result
export const router = (text, fileName, fileOrder, taxYear, taxData, base, tzConverter) => {
    const results = [];
    if (text.indexOf('BULLETIN DE PAIE_AIR FRANCE')!== -1) {
        results.push(payParser(text, fileName, fileOrder));
    }else if(text.indexOf('CARNET _DE _VOL _- _EP _5')!== -1) {
        results.push(ep5Parser(text, fileName, fileOrder, taxYear, taxData, base, tzConverter));
    }
    if (results.length === 0) {
        results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
    }
    return results;
}
