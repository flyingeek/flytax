import { iata2country } from '../../src/utilities/iata';

test("iata2country returns the country for known airports", () => {
    expect(iata2country("CDG")).toBe("FR");
    expect(iata2country("ORY")).toBe("FR");
    expect(iata2country("SFO")).toBe("US");
    expect(iata2country("LHR")).toBe("GB");
    expect(iata2country("SVO")).toBe("RU");

    // Some cities have their own country code for tax purposes
    expect(iata2country("PPT")).toBe("PF");
    expect(iata2country("JFK")).toBe("NY");
});

test("iata2country falls back to the input for unknown codes", () => {
    expect(iata2country("XYZ")).toBe("XYZ");
    expect(iata2country("???")).toBe("???");
});
