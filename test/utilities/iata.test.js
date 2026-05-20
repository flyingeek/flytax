import { iata2country, iata2countryWithTrainStations } from '../../src/utilities/iata';

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

test("iata2country returns the real airport for codes that collide with train stations", () => {
    // These codes are real IATA airports — the train-station override
    // lives in iata2countryWithTrainStations, not here, so
    // airline-agnostic callers see the real-world country.
    expect(iata2country("GST")).toBe("US"); // Gustavus, Alaska
    expect(iata2country("GNT")).toBe("US"); // Grants, New Mexico
    expect(iata2country("GMA")).toBe("CD"); // Gemena, DR Congo
    expect(iata2country("GRN")).toBe("US"); // Gordon, Nebraska
    expect(iata2country("GPL")).toBe("CR"); // Guapiles, Costa Rica
});

test("iata2countryWithTrainStations resolves train-station codes to FR", () => {
    expect(iata2countryWithTrainStations("GPM")).toBe("FR"); // Gare de Paris-Montparnasse
    expect(iata2countryWithTrainStations("GPL")).toBe("FR"); // Gare de Paris-Lyon (overrides Guapiles)
    expect(iata2countryWithTrainStations("GST")).toBe("FR"); // Gare de Strasbourg (overrides Gustavus)
    expect(iata2countryWithTrainStations("GNT")).toBe("FR"); // Gare de Nantes (overrides Grants)
});

test("iata2countryWithTrainStations falls through to iata2country for non-station codes", () => {
    expect(iata2countryWithTrainStations("CDG")).toBe("FR");
    expect(iata2countryWithTrainStations("JFK")).toBe("NY");
    expect(iata2countryWithTrainStations("XYZ")).toBe("XYZ");
});
