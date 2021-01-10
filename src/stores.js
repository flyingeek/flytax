import { writable, readable} from 'svelte/store';
import {iso2FR} from './parsers/ep5Parser';

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
export const swDismiss = writable(false);

function resettable(resetValue) {
    const { subscribe, set, update } = writable(resetValue);
    return {
        subscribe,
        set,
        update,
        reset: () => set((typeof resetValue === 'object') ? {...resetValue} : Array.isArray(resetValue) ? [...resetValue] : resetValue)
    };
}

const createLog = () => {
    const { subscribe, set, update } = writable(new Array());
    const push = (store, type, values) => store.push({type, values });
    if (typeof window !== undefined) {
        const nativeConsoleLog = console.log;
        const nativeConsoleError = console.error;
        console.log = function () {
            update((theStore) => {
                push(theStore, 'log', [...arguments]);
                return theStore;
            });
            nativeConsoleLog.apply(console, arguments);
        };
        console.error = function () {
            update((theStore) => {
                push(theStore, 'error', [...arguments]);
                return theStore;
            });
            nativeConsoleError.apply(console, arguments);
        };
    }
    return {
        subscribe,
        'log': (v) => update((theStore) => {
            push(theStore, 'log', [v]);
            return theStore;
        }),
        'error': (v) => update((theStore) => {
            push(theStore, 'error', [v]);
            return theStore;
        }),
        'reset': () => set(new Array())
    }
}

export const log = createLog();
export const viewLog = writable(false);
export const ep5 = resettable({type: "ep5"});
export const paySlips = resettable({type: "pay"});

const empty = () => {
    ep5.reset();
    paySlips.reset();
    log.reset();
}

function createTaxData(defaultValue) {
    const { subscribe, set, reset } = resettable(defaultValue);

    return {
        subscribe,
        fetch: (year) => {
            set(defaultValue);
            empty();
            fetch(DATASET.filter(option => option.label === year).pop().url)
            .then(res => res.json())
            .then(data => set(data));
        },
        reset
    };
}
export const taxData = createTaxData();

function createTaxYear(defaultValue) {
    const { subscribe, set } = writable(defaultValue);
    taxData.fetch(defaultValue);
    return {
        subscribe,
        'set': (value) => {
            set(value);
            taxData.fetch(value);
        }
    };
}
export const taxYear = createTaxYear(defaultYear);

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

export const route = readable(null, set => {
    const hashchange = (e) => {
        set(window.location.hash.substr(1) || "/");
    };
    hashchange();
    window.addEventListener('hashchange', hashchange);

    return () => {
        window.removeEventListener('hashchange', hashchange);
    };
});

