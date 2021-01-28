import {isPatchUpdate} from '../src/components/utils';
test("isPatchUpdate", () => {
    // noinspection JSCheckFunctionSignatures
    expect(isPatchUpdate("0.0.1", "0.0.2")).toBeTruthy();
    expect(isPatchUpdate("0.1.1", "0.1.2")).toBeTruthy();
    expect(isPatchUpdate("1.1.1", "1.1.2")).toBeTruthy();
    expect(isPatchUpdate("0.1.1", "0.0.2")).toBeFalsy();
    expect(isPatchUpdate("0.1.1", "1.2.2")).toBeFalsy();
});