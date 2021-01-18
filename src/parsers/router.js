import {payParser} from "./payParser";
import {ep5Parser} from "./ep5Parser";

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
    }else if(text.indexOf('CARNET _DE _VOL _- _EP _5')!== -1) {
        results.push(ep5Parser(text, fileName, fileOrder, taxYear, taxData, base, tzConverter));
    }
    if (results.length === 0) {
        results.push({"type": "error", "msg":"fichier non reconnu", fileName, fileOrder, "content": text});
    }
    return results;
}
