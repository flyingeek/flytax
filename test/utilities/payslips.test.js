import { payslipSignature } from '../../src/utilities/payslips';

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
