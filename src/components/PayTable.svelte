<script>
    import {decimal2cents, cents2decimal} from '../parsers/payParser';
    import { taxYear } from '../stores';
    import {months, monthsfr, localeCurrency} from './utils';
    import DownloadTablePDF from './DownloadTablePDF.svelte';

    export let data;
    export let tableId="PayTable";
    const computeTotalImposable = (data) => {
        if (data["12"] && data["12"].cumul !== "0") {
            return cents2decimal(decimal2cents(data["12"].cumul));
        }
        let total = 0;
        for (const month of months) {
            total += (data[month]) ? decimal2cents(data[month].imposable) : 0;
        }
        return cents2decimal(total);
    };
    const computeTotalFrais = (data) => {
        let total = 0;
        for (const month of months) {
            total += (data[month]) ? sumFrais(month) : 0;
        }
        return cents2decimal(total);
    };
    const computeTotalDecouchersFPRO = (data) => {
        let total = 0;
        for (const month of months) {
            total += (data[month]) ? data[month].decouchers_fpro.map(decimal2cents).reduce((a, b) => a + b): 0;
        }
        return cents2decimal(total);
    };
    $: totalFrais = computeTotalFrais(data);
    const sumFrais = (month) => {
        return data[month].repas.concat(data[month].transport).map(decimal2cents).reduce((a, b) => a + b);
    };
    $: totalImposable = computeTotalImposable(data);
    $: totalDecouchersFPRO = computeTotalDecouchersFPRO(data);

</script>
{#if Object.keys(data).length > 1}
<DownloadTablePDF tableIds={[tableId]} filename={`revenus${$taxYear}.pdf`}/>
<table class="data" id={tableId}>
    <thead>
        <tr><th colspan="5">Détails des salaires {$taxYear}</th></tr>
        <tr><th>Mois</th><th>Montant imposable</th><th>Cumul imposable</th><th>Frais d'emploi ¹</th><th>Découchers F PRO ²</th></tr>
    </thead>
    <tbody>
        {#each months as month, i}
            <tr>
                <td>{monthsfr[i]}</td>
                <td>{(data[month]) ? localeCurrency(data[month].imposable) : ""}</td>
                <td>{(data[month]) ? localeCurrency(data[month].cumul) : ""}</td>
                <td>{(data[month]) ? localeCurrency(cents2decimal(sumFrais(month))) : ""}</td>
                <td>{(data[month]) ? localeCurrency(data[month].decouchers_fpro) : ""}</td>
            </tr>
        {/each}
        <tr>
            <th>Total</th>
            <th>{localeCurrency(totalImposable)}</th>
            <th></th>
            <th>{localeCurrency(totalFrais)}</th>
            <th>{localeCurrency(totalDecouchersFPRO)}</th>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5">1. Les Frais d'emploi commprennent les lignes IND.REPAS, INDEMNITE REPAS, IND. TRANSPORT, FRAIS REELS TRANSP du bulletin de paye.</td>
        </tr>
        <tr>
            <td colspan="5">2. Cette colonne doit être substituée par le décompte des frais réels engagés par AF pour les nuitées.</td>
        </tr>
    </tfoot>
</table>
{/if}

<style>
    tbody th { /* Total bottom line */
        font-family: monospace;
        font-size: 1.3rem;
    }
    td:not(:nth-child(1)), th:not(:nth-child(1)){
        text-align: right;
    }
    td:not(:nth-child(1)) {
        white-space: nowrap;
    }
    tbody > tr:nth-child(12) > td:nth-child(3){ /*cumul mois 12 */
        font-weight: bold;
    } 
</style>