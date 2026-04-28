import { AmountError, findAmount, findAmountEuros } from '../../src/utilities/indemnity';

const FR = {n: "FRANCE", a: [["2010-01-01", "EUR", "156"]]};
const NY = {
        n: "NEW YORK",
        a: [
            ["2019-09-01", "USD", "450"],
            ["2019-01-01", "USD", "320"],
        ],
    };
const ZW = {n: "ZIMBABWE", a: [["2010-01-01", "ZWL", "1000000"]]};
const NO_AMOUNTS = {n: "NULL ISLAND", a: []};

const exr = {USD: ["1.1234", "1.1980", "1.1607"], EUR: ["1.0000", "1.0000", "1.0000"]};

test("AmountError is an Error", () => {
    expect(new AmountError("oops")).toBeInstanceOf(Error);
    expect(new AmountError("oops").message).toBe("oops");
});

test("findAmount returns [amount, currency] for the matching date", () => {
    expect(findAmount(FR, "2020-06-15")).toEqual(["156", "EUR"]);
});

test("findAmount picks the most recent amount whose date is ≤ isoDate", () => {
    expect(findAmount(NY, "2019-08-31")).toEqual(["320", "USD"]);
    expect(findAmount(NY, "2019-09-01")).toEqual(["450", "USD"]); // boundary: equal date matches
    expect(findAmount(NY, "2019-09-02")).toEqual(["450", "USD"]);
});

test("findAmount throws AmountError when no entry covers the date", () => {
    expect(() => findAmount(NY, "2018-12-31"))
        .toThrow(new AmountError("Pas d'indemnité définie pour NEW YORK au 2018-12-31"));

    expect(() => findAmount(NO_AMOUNTS, "2020-01-01"))
        .toThrow(new AmountError("Pas d'indemnité définie pour NULL ISLAND au 2020-01-01"));
});

test("findAmount throws AmountError when countryData is missing", () => {
    expect(() => findAmount(undefined, "2020-01-01"))
        .toThrow(new AmountError("Indemnité manquante"));
});

test("findAmountEuros converts the matched amount using the exr rate", () => {
    // exr[2] is the rate used: 320 USD ÷ 1.1607 ≈ 275.70
    expect(findAmountEuros(NY, "2019-08-31", exr)).toBeCloseTo(320 / 1.1607, 2);
    // EUR amounts pass through with rate 1.0
    expect(findAmountEuros(FR, "2020-06-15", exr)).toBeCloseTo(156, 2);
});

test("findAmountEuros throws AmountError when the currency has no exchange rate", () => {
    expect(() => findAmountEuros(ZW, "2020-01-01", exr))
        .toThrow(new AmountError("Taux de change inconnu pour ZWL"));
});
