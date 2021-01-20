export class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject)=> {
            this.reject = reject
            this.resolve = resolve
        })
    }
}
export const htmlLogo = '<span class="logo">Fly<span>Tax</span></span>';
export const navigatorLocale = (typeof navigator !== "undefined" && navigator.languages) ? Intl.DateTimeFormat.supportedLocalesOf(Intl.NumberFormat.supportedLocalesOf(navigator.languages)).shift() : undefined;
export const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
export const months14 = ['00', ...months, '13'];
export const monthsfr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
export const localeFormat = (numberOrString, options={}) => {
    if (navigatorLocale !== undefined) {
        const res = new Intl.NumberFormat(navigatorLocale, options).format(numberOrString);
        if (options.style === 'currency') return res.replace(/\s/gu, '\u202f');
        return res;
    } else {
        const numberValue = (numberOrString.toFixed) ? numberOrString : parseFloat(numberOrString);
        if (options.style==='currency') {
            return numberValue.toFixed(options.maximumFractionDigits||2) + "\u202f" + options.currency;
        }else{
            return (options.maximumFractionDigits===undefined || options.maximumFractionDigits !==  options.minimumFractionDigits) ? numberValue.toString(): numberValue.toFixed(options.maximumFractionDigits);
        }
    }
}
export const localeCurrency = (value, digits=2) => localeFormat(value, {"style": "currency", "currency": "EUR", "minimumFractionDigits": digits});
export const localeRate = (value) => localeFormat(value, {"style": "decimal", "minimumFractionDigits": 4, "maximumFractionDigits": 4});
export const localeDateFormat = (isoString, options={}) => {
    if (navigatorLocale !== undefined) {
        const fakeUTCDate = new Date(Date.parse(isoString.substring(0, 10) + "T00:00Z"));
        const opts = Object.assign({"timezone": "UTC"}, options);
        return new Intl.DateTimeFormat(navigatorLocale, opts).format(fakeUTCDate);
    } else {
        return isoString.substring(0, 10);
    }
}
