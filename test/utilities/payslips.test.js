import { findIn, groupByMonth, loadedMonths, payslipSignature } from '../../src/utilities/payslips';

// payslipSignature

test("payslipSignature combines airline, paymentDate, and imposable", () => {
    expect(payslipSignature({
        airline: 'AF',
        paymentDate: '2025-11-30',
        imposable: '8811.55',
    })).toBe('AF|2025-11-30|8811.55');
});

test("payslipSignature ignores fields outside its identity contract", () => {
    const a = payslipSignature({
        airline: 'AF',
        paymentDate: '2025-11-30',
        imposable: '8811.55',
        date: '2025-11',
        fileName: 'af-payslip.pdf',
        fileOrder: 0,
        cumul: '56644.85',
        errors: [],
        repas: ['526.36'],
    });
    const b = payslipSignature({
        airline: 'AF',
        paymentDate: '2025-11-30',
        imposable: '8811.55',
        date: '2025-11',
        fileName: 'renamed.pdf',
        fileOrder: 7,
        cumul: '99999.99',
        errors: [{type: 'error', message: 'boom'}],
        repas: [],
    });

    expect(a).toBe(b);
});

test("payslipSignature distinguishes different airlines for the same payment date and amount", () => {
    const af = payslipSignature({airline: 'AF', paymentDate: '2026-04-30', imposable: '4500.00'});
    const to = payslipSignature({airline: 'TO', paymentDate: '2026-04-30', imposable: '4500.00'});

    expect(af).not.toBe(to);
});

test("payslipSignature distinguishes different payment dates within the same period", () => {
    const a = payslipSignature({airline: 'AF', paymentDate: '2026-04-15', imposable: '4500.00'});
    const b = payslipSignature({airline: 'AF', paymentDate: '2026-04-22', imposable: '4500.00'});

    expect(a).not.toBe(b);
});

test("payslipSignature distinguishes different imposable amounts", () => {
    const a = payslipSignature({airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.55'});
    const b = payslipSignature({airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.56'});

    expect(a).not.toBe(b);
});


// groupByMonth

test("groupByMonth groups payslips by their period month", () => {
    const nov = {date: '2025-11', airline: 'AF', imposable: '8000.00'};
    const dec = {date: '2025-12', airline: 'AF', imposable: '9000.00'};
    const novBis = {date: '2025-11', airline: 'TO', imposable: '500.00'};

    expect(groupByMonth([nov, dec, novBis])).toEqual({
        '11': [nov, novBis],
        '12': [dec],
    });
});

test("groupByMonth preserves insertion order within each month", () => {
    const a = {date: '2025-11', imposable: '1000.00'};
    const b = {date: '2025-11', imposable: '2000.00'};
    const c = {date: '2025-11', imposable: '3000.00'};

    expect(groupByMonth([a, b, c])).toEqual({'11': [a, b, c]});
    expect(groupByMonth([b, a, c])).toEqual({'11': [b, a, c]});
});

test("groupByMonth returns an empty object for an empty array", () => {
    expect(groupByMonth([])).toEqual({});
});


// findIn

test("findIn returns the existing payslip whose signature matches the candidate", () => {
    const a = {airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.55'};
    const b = {airline: 'AF', paymentDate: '2025-12-31', imposable: '9000.00'};
    const candidate = {...a, fileName: 'reupload.pdf'};

    expect(findIn([a, b], candidate)).toBe(a);
});

test("findIn returns undefined when no signature matches", () => {
    const a = {airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.55'};
    const candidate = {airline: 'AF', paymentDate: '2025-12-31', imposable: '9000.00'};

    expect(findIn([a], candidate)).toBeUndefined();
});

test("findIn returns undefined for an empty array", () => {
    const candidate = {airline: 'AF', paymentDate: '2025-11-30', imposable: '8811.55'};

    expect(findIn([], candidate)).toBeUndefined();
});


// loadedMonths

test("loadedMonths returns the set of period months represented in items", () => {
    expect(loadedMonths([
        {date: '2025-11'},
        {date: '2025-12'},
        {date: '2025-11'},
    ])).toEqual(new Set(['11', '12']));
});

test("loadedMonths returns an empty Set for an empty array", () => {
    expect(loadedMonths([])).toEqual(new Set());
});

test("loadedMonths deduplicates months that appear multiple times", () => {
    const items = Array.from({length: 5}, () => ({date: '2025-04'}));

    expect(loadedMonths(items)).toEqual(new Set(['04']));
});

test("loadedMonths reads from a custom field via the optional getter", () => {
    // Rotations carry their stamped tax-year month on `taxDate` rather
    // than `date`, including boundary stamps "00" / "13".
    expect(loadedMonths([
        {taxDate: '2025-00'},
        {taxDate: '2025-06'},
        {taxDate: '2025-13'},
    ], (r) => r.taxDate)).toEqual(new Set(['00', '06', '13']));
});

test("loadedMonths getter is consulted per item", () => {
    // Sanity-check that the getter actually runs against each item rather
    // than being baked into a closure over the first one.
    const items = [{a: '2025-01'}, {a: '2025-02'}, {a: '2025-03'}];

    expect(loadedMonths(items, (item) => item.a)).toEqual(new Set(['01', '02', '03']));
});
