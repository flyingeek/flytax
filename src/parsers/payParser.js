
// decimal is text string representing a float number with two decimals like "123.45"
//
// cents is a number used to compute sum of decimals without rounding problems
// decimal "123.45" is cents 12345
//

// convert a text number to a decimal (accepts "12345,67 or 12345.67 or 12 345.67)
// forces 2 precision digits
// returns a string 
export const decimal = (text) => {
    const number = text.replace(',', '.').replace(' ', '');
    const [left, right] = number.split(".");
    return left + '.' + (right||"00").padEnd(2, "0");
}
// decimal to cents
// returns a number
export const decimal2cents = (decimal) => {
    const [left, right] = decimal.split(".");
    return parseInt(left + (right||"00"), 10);
}

// cents to decimal
// returns a string
export const cents2decimal = (cents) => {
    const centsString = cents.toString(10);
    const length = centsString.length;
    switch (length) {
        case 2:
            return '0.' + centsString;
        case 1:
            return '0.0' + centsString;
        default:
            return centsString.slice(0, -2) + '.' + centsString.slice(-2);
    }
}

// collect first group of all matches
// returns Array of "decimal"
const matchAll = (text, re, bydefault) => {
    const results = [];
    let match;
    while(null !== (match = re.exec(text))) {
        results.push(decimal(match[1]));
    }
    const found = results.length;
    if (found > 0) {
        return results;
    } else if (bydefault === undefined) {
        throw new Error(`No match found for ${re}`);
    } else {
        return [bydefault];
    }
};

// returns first group of last match
// Throws if no match found
// returns string
const matchLast = (text, re, bydefault) => {
    let match;
    let lastMatch;
    while (null !== (match = re.exec(text))) {
        lastMatch = match;
    }
    if (lastMatch) return lastMatch[1];
    if (bydefault === undefined) {
        throw new Error(`No match found for ${re}`);
    } else {
        return bydefault;
    }
};

const sum = (decimals) => cents2decimal(decimals.map(decimal2cents).reduce((a, b) => a + b));
// Parse PaySlip
export const payParser = (text, fileName, fileOrder) => {
    //console.log(text);
    let result = {"type": "pay", fileName, fileOrder, errors: []};
    let re = /(?:IND\.REPAS_+|INDEMNITE REPAS_+)([\-0-9, ]+)/g;
    result.repas = matchAll(text, re, "0").map(decimal);
    re = /(?:IND\. TRANSPORT_+|FRAIS REELS TRANSP_+|R\. FRAIS DE TRANSPORT_+)([\-0-9, ]+)/g;
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
        result.errors.push({"type": "error", "msg":"Cumul Net imposable non trouvé"});
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