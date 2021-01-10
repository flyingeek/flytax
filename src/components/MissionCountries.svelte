<script>
    import {localeRate, localeDateFormat, localeCurrency} from './utils';
    import {taxData} from '../stores';
    export let data;
    export let tableId = "Indemnities";

    function* getCountriesData(dat){
        const list = ["EU"]; // add forfait EU
        for (const rot of dat) {
            list.push(...rot.countries);
        }
        const sortedList = Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
        for (const key of sortedList) {
            for (const countryData of getData(key)){
                yield countryData;
            }
        };
    };

    function* getData(key) {
        const value = $taxData.countries[key];
        const amounts = (value.f === 1) ? $taxData.countries["EU"].a : value.a;
        for (const [validity, currency, amount] of amounts) {
            const [startRate, endRate, averageRate] = $taxData.exr[currency];
            yield {
                "name": (key === "EU") ? value.n + "¹" : value.n,
                "code": key,
                validity,
                amount,
                currency,
                startRate,
                endRate,
                averageRate,
                "euros": (parseFloat(amount) / averageRate).toFixed(2),
                "zone": (key === "EU") ? "" : (value.z === 1) ? "Moyen": "Long"
            };
        } 

    };
    $: countriesData = ($taxData) ? [...getCountriesData(data)] : [];
</script>

{#if countriesData.length > 1}
<table id={tableId} class="data">
    <thead>
        <tr><th colspan="9">Indemnités par pays {$taxData.year} </th></tr>
        <tr><th colspan="2">Pays</th><th>Validité</th><th>Montant</th><th>Taux</th><th>Taux</th><th>Taux moyen</th><th>Montant €</th><th>Zone</th></tr>
        <tr><td colspan="2"></td><td>(à compter du)</td><td></td><td>31/12/{parseInt($taxData.year, 10) - 1}</td><td>31/12/{$taxData.year}</td><td></td><td></td><td></td></tr>
    </thead>
    <tbody>
        {#each countriesData as c}
            <tr>
                <td>{c.code}</td>
                <td>{(c.name.length <= 21) ? c.name : c.name.substring(0, 20) + '…'}</td>
                <td>{localeDateFormat(c.validity)}</td>
                <td>{`${c.amount} ${c.currency}`}</td>
                <td>{localeRate(c.startRate)}</td>
                <td>{localeRate(c.endRate)}</td>
                <td>{localeRate(c.averageRate)}</td>
                <td>{localeCurrency(c.euros)}</td>
                <td>{c.zone}</td></tr>
        {/each}
    </tbody>
    <tfoot>
        <tr><td colspan="9">1. Le forfait Euro est appliqué dans ces pays: {$taxData.zoneForfaitEuro.join(', ')}</td></tr>
    </tfoot>
</table>
{/if}

<style>

/* Hides Taux début, Taux fin in portrait mode on iPad */
@media (max-width: 1024px) {
    thead th:nth-child(4), thead th:nth-child(5),
    td:nth-child(5), td:nth-child(6) {
        display: none;
    }
}
th, td {
    text-align: right;
}
thead tr:nth-child(2) th {
    border-bottom: none;
    padding-top: 0.5em;
    padding-bottom: 0;
}
thead td {
    border-top: none;
    font-weight: normal;
    font-size: x-small;
}
thead tr:nth-child(3) {
    height: 0.7em;
    line-height: 0.1em;
    padding-top: 0;
    padding-bottom: 0;
}
thead tr:nth-child(2) th:nth-child(1), tbody td:nth-child(2), td:nth-child(1) {
    text-align: left;
}
</style>