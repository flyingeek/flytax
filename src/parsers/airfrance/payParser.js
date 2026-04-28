import {decimal, sum} from '../../utilities/numbers';
import {matchAll, matchLast} from '../../utilities/regex';

// Parse PaySlip
export const payParser = (text, fileName, fileOrder) => {
    let result = {"type": "pay", fileName, fileOrder, errors: []};
    let re = /(?:IND\.REPAS_+|INDEMNITE REPAS_+|IR\.FIN ANNEE DOUBL_+|IR EXONEREES_+|IR NON EXONEREES_+)([\-0-9, ]+)/g;
    result.repas = matchAll(text, re, "0").map(decimal);
    // optional quantity and rate before ammount
    re = /(?:IND\. TRANSPORT EXO_+|IND\. TRANSPORT_+|FRAIS REELS TRANSP_+|R\. FRAIS DE TRANSPORT_+)(?:[\-0-9, ]+_[\-0-9, ]+_)?([\-0-9, ]+)/g;
    result.transport = matchAll(text, re, "0").map(decimal);
    re = /(?:_I.DECOUCHERS F.PRO_+)([\-0-9, ]+)/g;
    result.decouchers_fpro = matchAll(text, re, "0").map(decimal);
    try {
        const net = matchAll(text, /_Mensuel_[\-0-9, ]+_{1,2}([\-0-9, ]+)_/g);
        result.imposable = sum(net.map(decimal));
        if (net.length > 1) result.errors.push({"type": "warning", "message":"Plusieurs bulletins de salaire trouvés"});
    } catch (err) {
        result.errors.push({"type": "error", "message":"Net imposable non trouvé"});
        result.imposable = "0";
    }
    try {
        result.cumul = decimal(matchLast(text, /_Annuel_[\-0-9, ]+_{1,2}([\-0-9, ]+)_/g));
    } catch (err) {
        result.errors.push({"type": "error", "message":"Cumul Net imposable non trouvé"});
        result.cumul = "0";
    }
    try {
        result.date = matchLast(text, /PERIODE DU \d{2}\/(\d{2}\/\d{4})/g).split('/').reverse().join('-');
        if(result.date.endsWith("00")) throw new Error(`Date invalide: ${result.date}`);
    } catch (err) {
        throw new Error(`Date non trouvée`);
    }
    return result;
}
