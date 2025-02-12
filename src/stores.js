import { writable, readable, derived } from 'svelte/store';
import {iso2FR, iso2AST, mergeRots} from './parsers/ep5Parser';

export const BASES = [
    {label: "Marseille", selected: false, value: ['MRS'], tzConverter: iso2FR},
    {label: "Nice", selected: false, value: ['NCE'], tzConverter: iso2FR},
    {label: "Paris", selected: true, value: ['CDG', 'ORY'], tzConverter: iso2FR},
    {label: "Toulouse", selected: false, value: ['TLS'], tzConverter: iso2FR},
    {label: "Pointe-à-Pitre", selected: false, value: ['PTP'], tzConverter: iso2AST}
].sort((a, b) => (a.label.localeCompare(b.label)));

export const DATASET = [
    {label: "2025", selected: false, url: `./data/data2024.json`},
    {label: "2024", selected: true, url: `./data/data2024.json`},
    {label: "2023", selected: false, url: `./data/data2023b.json`}, // see save method in makeData
    {label: "2022", selected: false, url: "./data/data2022.json"},
    {label: "2021", selected: false, url: "./data/data2021.json"},
    {label: "2020", selected: false, url: "./data/data2020.json"},
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
function isRegisterEmpty () {
    return Object.keys(this).length === 2;
}
export const ep5 = resettable({type: "ep5", isEmpty: isRegisterEmpty});
export const paySlips = resettable({type: "pay", isEmpty: isRegisterEmpty});
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
export const wb = writable();

let swLastUpdateDate = new Date();
export const checkSWUpdate = () => {
    if ('serviceWorker' in navigator) {
        const timeout = ('process.env.NODE_ENV' !== '"development"') ? 1800000 /* 30 mn */ : 2000;
        if ((new Date() - swLastUpdateDate) > timeout) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    if (!reg.waiting) {
                      reg.update();
                    } else {
                      reg.waiting.postMessage('SKIP_WAITING');
                    }
                    swDismiss.set(false);
                    swLastUpdateDate = new Date();
                }
            }, console.error);
        }
    }
}

export const handleVisibilityChange = () =>{
    if (document && document.visibilityState && document.visibilityState === 'visible') {
        checkSWUpdate();
    }
}
export const route = readable(null, set => {
    const hashchange = () => {
        set(window.location.hash.substr(1) || '/');
        checkSWUpdate();
    };
    hashchange();
    window.addEventListener('hashchange', hashchange);

    return () => {
        window.removeEventListener('hashchange', hashchange);
    };
});
