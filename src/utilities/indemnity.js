// Build-time validation ensures airportsData, countriesData and exrData stay
// consistent, but findAmount* still surfaces AmountError to handle gaps at runtime.
export class AmountError extends Error {}

export const findAmount = (countryData, isoDate) => {
    for (const [date, currency, amount] of countryData.a) {
        if (date.localeCompare(isoDate) <= 0) return [amount, currency];
    }
    if (countryData) {
        throw new AmountError(`Pas d'indemnité définie pour ${countryData.n} au ${isoDate}`);
    }
    throw new AmountError(`Indemnité manquante`);
};

export const findAmountEuros = (countryData, isoDate, exrData) => {
    const [amount, currency] = findAmount(countryData, isoDate);
    const exr = exrData[currency];
    if (!exr) throw new AmountError(`Taux de change inconnu pour ${currency}`);
    const rate = parseFloat(exr[2]);
    return parseFloat((parseFloat(amount) / rate).toFixed(2));
};
