import { decimal, decimal2cents, cents2decimal, sum } from '../../src/utilities/numbers';

test("decimal normalizes a textual amount to a 2-digit decimal string", () => {
    // Dot-decimal pass-through, padded to 2 digits
    expect(decimal("123.45")).toBe("123.45");
    expect(decimal("123.4")).toBe("123.40");
    expect(decimal("123")).toBe("123.00");

    // Comma decimal separator
    expect(decimal("123,45")).toBe("123.45");

    // Thousands separator (space) is stripped
    expect(decimal("12 345.67")).toBe("12345.67");
    expect(decimal("12 345,67")).toBe("12345.67");

    // Negative values
    expect(decimal("-12.5")).toBe("-12.50");

    // Zero
    expect(decimal("0")).toBe("0.00");
});

test("decimal2cents converts a decimal string to integer cents", () => {
    expect(decimal2cents("123.45")).toBe(12345);
    expect(decimal2cents("0.05")).toBe(5);
    expect(decimal2cents("1.00")).toBe(100);
    expect(decimal2cents("-12.50")).toBe(-1250);
});

test("cents2decimal converts integer cents to a decimal string", () => {
    expect(cents2decimal(12345)).toBe("123.45");
    expect(cents2decimal(100)).toBe("1.00");

    // Pads small values
    expect(cents2decimal(5)).toBe("0.05");
    expect(cents2decimal(50)).toBe("0.50");
});

test("decimal2cents and cents2decimal round-trip", () => {
    for (const value of ["0.00", "1.00", "12.34", "999.99", "100000.00"]) {
        expect(cents2decimal(decimal2cents(value))).toBe(value);
    }
});

test("sum adds decimal strings without floating-point drift", () => {
    expect(sum(["1.00", "2.50"])).toBe("3.50");
    expect(sum(["0.01", "0.02", "0.03"])).toBe("0.06");

    // 0.1 + 0.2 = 0.30000000000000004 in floating-point; sum avoids that
    expect(sum(["0.10", "0.20"])).toBe("0.30");

    expect(sum(["100.00"])).toBe("100.00");
});
