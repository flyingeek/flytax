import {matchFirst} from '../../utilities/regex';

// Parse Attestation de décompte des nuitées AF
export const nightsAFParser = (text, fileName, fileOrder, taxYear) => {
    let result = {"type": "nights", fileName, fileOrder, errors: []};
    let total;
    try {
        total = matchFirst(text, /compte s'élève à\s?:\s([\-0-9,. ]+)\sEuros/);
        total = parseFloat(total.replace(/\s+/g, '').replace(',', '.'));
    }catch(err) {
        result.errors.push({"type": "error", "message":"Montant des nuitées AF non trouvé"})
    }
    result.total = total;
    result.date = taxYear;
    return result;
};
