import { writable, readable, derived} from 'svelte/store';
import {iso2FR, mergeRots} from './parsers/ep5Parser';

export const BASES = [
    {label: "Marseille", selected: false, value: ['MRS'], tzConverter: iso2FR},
    {label: "Nice", selected: false, value: ['NCE'], tzConverter: iso2FR},
    {label: "Paris", selected: true, value: ['CDG', 'ORY'], tzConverter: iso2FR},
    {label: "Toulouse", selected: false, value: ['TLS'], tzConverter: iso2FR}
].sort((a, b) => (a.label.localeCompare(b.label)));

export const DATASET = [
    {label: "2021", selected: false, url: "./data/data2020.json"},
    {label: "2020", selected: true, url: "./data/data2020.json"},
    {label: "2019", selected: false, url: "./data/data2019.json"},
    {label: "2018", selected: false, url: "./data/data2018.json"}
].sort((a, b) => (b.label.localeCompare(a.label)));

const defaultYear = DATASET.filter(option => option.selected).pop().label;

export const base = writable(BASES.filter(option => option.selected).pop().value);
export const tzConverter = writable(BASES.filter(option => option.selected).pop().tzConverter);

function resettable(resetValue) {
    const { subscribe, set, update } = writable(resetValue);
    return {
        subscribe,
        set,
        update,
        reset: () => set((typeof resetValue === 'object') ? {...resetValue} : Array.isArray(resetValue) ? [...resetValue] : resetValue)
    };
}

const patchLog = () => {
    const { subscribe, set, update } = writable(new Array());
    const push = (store, type, values) => store.push({type, values });
    let nativeConsoleLog, nativeConsoleError;
    if (typeof window !== "undefined" && console) { // patch only in browser
        nativeConsoleLog = console.log;
        nativeConsoleError = console.error;
    }
    const newConsoleLog = function () {
        update((theStore) => {
            push(theStore, 'log', [...arguments]);
            return theStore;
        });
        if (nativeConsoleLog && console) nativeConsoleLog.apply(console, arguments);
    };
    const newConsoleError = function () {
        update((theStore) => {
            push(theStore, 'error', [...arguments]);
            return theStore;
        });
        if (nativeConsoleError && console) nativeConsoleError.apply(console, arguments);
    };
    if (typeof window !== "undefined" && console) {
        console.log = newConsoleLog;
        console.error = newConsoleError;
    }
    return {
        subscribe,
        'log': newConsoleLog,
        'error': newConsoleError,
        'reset': () => set(new Array())
    }
}

export const log = patchLog();
export const ep5 = resettable({type: "ep5"});
export const paySlips = resettable({type: "pay"});
export const nuiteesInput = resettable();
export const nuiteesAF = resettable();

const empty = () => {
    ep5.reset();
    paySlips.reset();
    log.reset();
    nuiteesInput.reset();
    nuiteesAF.reset();
}

export const taxYear = writable(defaultYear);
export const taxData = derived(taxYear, ($taxYear, set) => {
    //set(undefined);
    empty();
    fetch(DATASET.filter(option => option.label === $taxYear).pop().url)
    .then(res => res.json())
    .then(data => set(data));
}, undefined);

export const pairings = derived(
    [ep5, taxYear, taxData, tzConverter],
    ([$ep5, $taxYear, $taxData, $tzConverter]) => {
        if ($taxData === undefined) return [];
        return mergeRots($ep5, $taxYear, $taxData, $tzConverter);
    }
);
export const fraisDeMission = derived(pairings, $pairings => Object.values($pairings).reduce((a, c) => a + c.indemnity, 0).toFixed(0));

export const online = readable({}, set => {
    const update_network_status = () => {
        set(navigator.onLine);
    };

    if (
        (typeof navigator !== "undefined") &&
        'onLine' in navigator
    ) {
        update_network_status();
        window.addEventListener('offline', update_network_status);
        window.addEventListener('online', update_network_status);
    } else {
        set(undefined);
    }

    return () => {
        if (
            (typeof navigator !== "undefined") &&
            'onLine' in navigator
        ) {
            window.removeEventListener('offline', update_network_status);
            window.removeEventListener('online', update_network_status);
        }
    };
});

export const swDismiss = writable(false);
let swLastUpdateDate = new Date();
export const checkSWUpdate = () => {
    if ('serviceWorker' in navigator) {
        if ((new Date() - swLastUpdateDate) > 900000) { /* 15mn */
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    reg.update();
                    swDismiss.set(false);
                    swLastUpdateDate = new Date();
                }
            }, console.error);
        }
    }
}

export const route = readable(null, set => {
    const hashchange = (e) => {
        set(window.location.hash.substr(1) || "/");
        checkSWUpdate();
    };
    hashchange();
    window.addEventListener('hashchange', hashchange);

    return () => {
        window.removeEventListener('hashchange', hashchange);
    };
});

