// decimal is a text string representing a float number with two decimals like "123.45"
//
// cents is a number used to compute sums of decimals without rounding problems
// decimal "123.45" is cents 12345

// Convert a text number to a decimal (accepts "12345,67" or "12345.67" or "12 345.67").
// Forces 2 precision digits. Returns a string.
export const decimal = (text) => {
    const number = text.replace(',', '.').replace(' ', '');
    const [left, right] = number.split(".");
    return left + '.' + (right || "00").padEnd(2, "0");
};

// decimal → cents. Returns a number.
export const decimal2cents = (decimal) => {
    const [left, right] = decimal.split(".");
    return parseInt(left + (right || "00"), 10);
};

// cents → decimal. Returns a string.
export const cents2decimal = (cents) => {
    const centsString = cents.toString(10);
    switch (centsString.length) {
        case 2:  return '0.' + centsString;
        case 1:  return '0.0' + centsString;
        default: return centsString.slice(0, -2) + '.' + centsString.slice(-2);
    }
};

export const sum = (decimals) => cents2decimal(decimals.map(decimal2cents).reduce((a, b) => a + b));
