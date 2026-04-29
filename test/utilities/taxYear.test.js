import { isInTaxYearWindow, stampForTaxYear } from '../../src/utilities/taxYear';

test("isInTaxYearWindow accepts the full current year", () => {
    for (const m of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']) {
        expect(isInTaxYearWindow(m, '2025', '2025')).toBe(true);
    }
});

test("isInTaxYearWindow accepts the boundary months", () => {
    // December of the previous year carries into the current tax year
    expect(isInTaxYearWindow('12', '2024', '2025')).toBe(true);
    // January of the next year carries back into the current tax year
    expect(isInTaxYearWindow('01', '2026', '2025')).toBe(true);
});

test("isInTaxYearWindow rejects months outside the boundary", () => {
    // Other months of the previous year
    expect(isInTaxYearWindow('11', '2024', '2025')).toBe(false);
    expect(isInTaxYearWindow('06', '2024', '2025')).toBe(false);
    // Other months of the next year
    expect(isInTaxYearWindow('02', '2026', '2025')).toBe(false);
    expect(isInTaxYearWindow('06', '2026', '2025')).toBe(false);
    // Far years
    expect(isInTaxYearWindow('06', '2020', '2025')).toBe(false);
    expect(isInTaxYearWindow('12', '2020', '2025')).toBe(false);
});

test("stampForTaxYear stamps the boundary months with -00 and -13", () => {
    // December of the previous year → -00
    expect(stampForTaxYear('12', '2024', '2025')).toBe('2025-00');
    // January of the next year → -13
    expect(stampForTaxYear('01', '2026', '2025')).toBe('2025-13');
});

test("stampForTaxYear preserves regular months as `${year}-${month}`", () => {
    expect(stampForTaxYear('01', '2025', '2025')).toBe('2025-01');
    expect(stampForTaxYear('06', '2025', '2025')).toBe('2025-06');
    expect(stampForTaxYear('12', '2025', '2025')).toBe('2025-12');
});

test("stampForTaxYear preserves out-of-window dates verbatim", () => {
    // Even outside the tax-year window, the function returns the literal date.
    // Callers use isInTaxYearWindow separately to decide how to handle it.
    expect(stampForTaxYear('06', '2020', '2025')).toBe('2020-06');
    expect(stampForTaxYear('11', '2024', '2025')).toBe('2024-11'); // not -00, not in window
    expect(stampForTaxYear('02', '2026', '2025')).toBe('2026-02'); // not -13, not in window
});
