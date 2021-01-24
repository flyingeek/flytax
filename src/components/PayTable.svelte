<script>
    import {decimal2cents, cents2decimal} from '../parsers/payParser';
    import { taxYear, taxData, fraisDeMission, nuiteesInput, nuiteesAF} from '../stores';
    import {months, monthsfr, localeCurrency} from './utils';
    import DownloadTablePDF from './DownloadTablePDF.svelte';
    import {fade} from 'svelte/transition';

    export let data;
    export let tableId="PayTable";
    const computeTotalImposable = (data) => {
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
    const updateNuiteesInput = (real, estimated) => {
        if (real !== undefined) {
            $nuiteesInput = real;
        }else if (estimated){
            $nuiteesInput = estimated;
        }
    } 

    const sumFrais = (month) => {
        return data[month].repas.concat(data[month].transport).map(decimal2cents).reduce((a, b) => a + b);
    };

    $: totalFrais = computeTotalFrais(data);
    $: totalImposable = computeTotalImposable(data);
    $: cumulImposable12 = (data["12"] && data["12"].cumul !== "0") ? cents2decimal(decimal2cents(data["12"].cumul)) : undefined;
    $: abbattement = ($taxData && $taxData.maxForfait10) ? Math.min((cumulImposable12||totalImposable)*0.1, $taxData.maxForfait10) : 0;
    $: totalDecouchersFPRO = computeTotalDecouchersFPRO(data);
    $: nightsCostEstimate = (Math.ceil(parseFloat(totalDecouchersFPRO) * 3.31/100) * 100).toFixed(0);
    $: updateNuiteesInput($nuiteesAF, nightsCostEstimate);
    $: fraisReels = parseFloat($fraisDeMission) - parseFloat($nuiteesAF || $nuiteesInput || nightsCostEstimate) - parseFloat(totalFrais);


</script>
{#if Object.keys(data).length > 1}
<DownloadTablePDF tableIds={[tableId]} filename={`revenus${$taxYear}.pdf`}/>
{#if ($fraisDeMission > 0)}
<table class="data summary" id={tableId + 'Summary'}>
    <col class="col1" />
    <col class="col2" />
    <col class="col3" />
<thead>
    <tr>
        <th colspan="3">Comparatif {$taxYear}</th>
    </tr>
    <tr>
        <th>Nuitées AF</th>
        <th>Frais&nbsp;de&nbsp;Mission -&nbsp;Nuitées -&nbsp;Frais&nbsp;d'emploi</th>
        <th>Abattement de 10% plafonné</th>
    </tr>
    {#if $taxYear !== $taxData.year}
    <tr class="warning"><th colspan="3">Attention les montants sont basés sur les données fiscales de {$taxData.year}</th></tr>
    {/if}
</thead>
<tbody>
    <tr>
        <td>
            <input name="nuitees" type="number" disabled={!!$nuiteesAF} bind:value="{$nuiteesInput}" min="0" step="100" placeholder="{($nuiteesAF) ? $nuiteesAF : nightsCostEstimate}"/>
            {#if (!$nuiteesInput || $nuiteesInput == nightsCostEstimate)}
            <div class="estimate" transition:fade|local><small>estimation des nuitées à ±10%</small></div>
            {/if}
        </td>
        <td>{$fraisDeMission} - {parseFloat($nuiteesAF || $nuiteesInput || nightsCostEstimate).toFixed(0)} - {parseFloat(totalFrais).toFixed(0)} = {fraisReels.toFixed(0)} €</td>
        <td>{abbattement.toFixed(0)} €</td>
    </tr>
</tbody>
<tfoot>
    <tr>
        {#if (fraisReels >= abbattement)}
        <td colspan="3">Sans tenir compte de vos autres frais, vous serez déjà gagnant de <b>{(fraisReels - abbattement).toFixed(0)} €</b> en passant aux frais réels.</td>
        {:else}
        <td colspan="3">Il faudra que vos autres frais atteignent <b>{(abbattement - fraisReels).toFixed(0)} €</b> pour qu'une déclaration aux frais réels soit plus avantageuse.</td>
        {/if}
    </tr>
</tfoot>
</table>
{:else}
<p>Merci de charger vos EP4/EP5 pour afficher le comparatif</p>
{/if}
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
            <td colspan="5">1. Les Frais d'emploi commprennent les lignes IND.REPAS, INDEMNITE REPAS, IND. TRANSPORT, FRAIS REELS TRANSP, R. FRAIS DE TRANSPORT du bulletin de paye.</td>
        </tr>
        <tr>
            <td colspan="5">2. Cette colonne doit être substituée par le décompte des frais réels engagés par AF pour les nuitées.</td>
        </tr>
    </tfoot>
</table>
{:else}
    <div class="illustration">
        <picture>
            <img src="CONF_S_EXAMPLE_IMG" alt="exemple de résultat sur iPad"/>
        </picture>
    </div>
{/if}

<style>
    :global(picture img) {
        max-width: 100%;
        width:auto;
        height:auto;
    }
    :global(.illustration::after) {
        content: 'Exemple de résultat';
        display: block;
        padding: 2px 5px;
        background-color: var(--redaf);
        color: var(--background-color);
        opacity: 0.9;
        font-size: 1.5em;
        font-weight: 500;
        border-radius: 5px;
        top: calc(30 * calc(100% / 1032));
        position: absolute;
        width: 220px;
        left: 50%;
        margin-left: -110px;
    }
    @media all and (min-width: 1032px) {
        :global(picture img){
            max-width: 800px;
        }
        :global(.illustration::after) {
            font-size: 2em;
            width: 300px;
            margin-left: -150px;
        }
    }
    :global(.illustration) {
        margin: 1em auto 0 auto;
        width: 80%;
        position: relative;
    }
    table.data.summary {
        table-layout: fixed;
        position: relative;
    }
    :global(table.data.summary tfoot td) {
        font-size: initial;
    }
    .col1 {
        width: 130px;
    }
    .col2 {
        width: 50%;
    }
    .estimate{
        position: absolute;
        top: 0px;
        left: 0px;
    }
    .estimate small {
        border-radius: 2px;
        padding: 2px;
        display: block;
        color: var(--background-color);
        background-color: var(--green);
        font-size: small;
        width: 126px;
        text-align: center;
    }
    td input {
        margin-bottom: 0;
        width: 120px;
    }
    td input:disabled {
        color: var(--green);
        -webkit-text-fill-color: var(--green);
        opacity: 0.85; /*ios*/
    }
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