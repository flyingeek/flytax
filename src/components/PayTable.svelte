<script>
    import { fade } from 'svelte/transition';
    import { fraisDeMission, fraisHebergement, fraisHebergementInput, pairings, taxData, taxYear } from '../stores';
    import { iso2FR } from '../utilities/dates';
    import { cents2decimal, decimal2cents } from '../utilities/numbers';
    import { groupByMonth } from '../utilities/payslips';
    import DownloadTablePDF from './DownloadTablePDF.svelte';
    import { localeCurrency, months, monthsfr } from './utils';

    export let data;
    export let tableId="PayTable";

    /**
     * Sum decimal-string fields across a list of bulletins, in cents.
     *
     * @example
     *   sumOver(items, b => [b.imposable])                 // total imposable in cents
     *   sumOver(items, b => [...b.repas, ...b.transport])  // frais d'emploi in cents
     *   sumOver(items, b => b.decouchers_fpro)             // découchers in cents
     *
     * @param {Array<object>} bulletins
     * @param {(bulletin: object) => Array<string>} getValues
     * @returns {number}
     */
    const sumOver = (bulletins, getValues) => bulletins
            .flatMap(getValues)
            .reduce((acc, d) => acc + decimal2cents(d), 0);

    /**
     * The YTD cumul across `bulletins`, as a decimal string.
     *
     * Each payslip's `cumul` field reports its own airline's YTD only,
     * so in the case of payslips from different airlines — which carry
     * separate YTD totals — the correct year-end figure is the **sum of
     * each airline's largest reported cumul**.
     *
     * Returns undefined when no bulletin reports a usable cumul.
     *
     * @example
     *   // Single airline, full year:  max(cumul) = December cumul
     *   cumulOf([
     *     {airline: 'AF', cumul: '40000.00'},  // earlier month
     *     {airline: 'AF', cumul: '56644.85'},  // December
     *   ])  // → "56644.85"
     *
     *   // Multiple airlines: each airline's largest cumul, summed
     *   cumulOf([
     *     {airline: 'TO', cumul: '12000.00'},  // TO's last cumul (e.g. May)
     *     {airline: 'AF', cumul: '44000.00'},  // AF's last cumul (e.g. December)
     *   ])  // → "56000.00"
     *
     *   cumulOf([{airline: 'AF', cumul: '0'}])  // → undefined
     *   cumulOf([])                              // → undefined
     *
     * @param {Array<{airline: string, cumul: string}>} bulletins
     * @returns {string | undefined}
     */
    const cumulOf = (bulletins) => {
        const maxByAirline = {};

        for (const b of bulletins) {
            maxByAirline[b.airline] = Math.max(maxByAirline[b.airline] ?? 0, decimal2cents(b.cumul));
        }

        const cents = Object.values(maxByAirline).reduce((sum, c) => sum + c, 0);

        return cents > 0
            ? cents2decimal(cents)
            : undefined;
    };

    const sortBulletins = (bulletins) => bulletins.slice().sort((a, b) =>
        a.paymentDate.localeCompare(b.paymentDate)
        || a.airline.localeCompare(b.airline)
        || decimal2cents(a.cumul) - decimal2cents(b.cumul));

    const updateFraisHebergementInput = (real, estimated) => {
        if (real !== undefined) {
            $fraisHebergementInput = real;
        }else if (estimated){
            $fraisHebergementInput = estimated;
        }
    }

    const roadTrips = (pairings, taxYear) => {
        if (!pairings || !taxYear) return '';
        const results = {'count': pairings.length, 'OUT': new Map(), 'IN': new Map()};
        for (const rot of pairings) {
            if (iso2FR(rot.start).substring(0,4) === taxYear) {
                results.OUT.set(rot.dep, (results.OUT.get(rot.dep)||0) + 1);
            }
            if (iso2FR(rot.end).substring(0,4) === taxYear) {
                results.IN.set(rot.arr, (results.IN.get(rot.arr)||0) + 1);
            }
        }
        const to = Array.from(results.OUT).map(([iata, c]) => `${c} trajet${(c>1) ? 's' : ''} vers ${iata}`);
        const from = Array.from(results.IN).map(([iata, c]) => `${c} trajet${(c>1) ? 's' : ''} depuis ${iata}`);
        if (results.count === 0) {
            return '';
        }else if (results.count === 1) {
            return `À titre d'information, pour les frais de transport, la rotation représente ${to.join(', ')} et ${from.join(', ')}.`;
        }
        return `À titre d'information, pour les frais de transport, les ${results.count} rotations représentent ${to.join(', ')} et ${from.join(', ')}.`;
    }

    $: byMonth = groupByMonth(data.items);
    $: totalFrais = cents2decimal(sumOver(data.items, b => [...b.repas, ...b.transport]));
    $: totalImposable = cents2decimal(sumOver(data.items, b => [b.imposable]));
    // Prefer the bulletin-reported cumul over summing imposable amounts;
    // fall back to totalImposable when no cumul is loaded.
    $: cumulImposable = cumulOf(data.items);
    $: abbattement = ($taxData && $taxData.maxForfait10) ? Math.min((cumulImposable||totalImposable)*0.1, $taxData.maxForfait10) : 0;
    $: totalDecouchersFPRO = cents2decimal(sumOver(data.items, b => b.decouchers_fpro));
    $: estimateRatio = ( parseInt($taxYear, 10)  >= 2021) ? 2.7 : 3.31;
    $: nightsCostEstimate = (Math.ceil(parseFloat(totalDecouchersFPRO) * estimateRatio/100) * 100).toFixed(0);
    $: updateFraisHebergementInput($fraisHebergement, nightsCostEstimate);
    $: fraisReels = parseFloat($fraisDeMission) - parseFloat($fraisHebergement || $fraisHebergementInput || nightsCostEstimate) - parseFloat(totalFrais);
    $: roadTripInformation = roadTrips($pairings, $taxYear);

</script>
{#if !data.isEmpty()}
<DownloadTablePDF tableIds={[tableId]} filename={`revenus${$taxYear}.pdf`}/>
{#if ($fraisDeMission > 0)}
<table class="data summary" id={tableId + 'Summary'}>
    <col class="col1" />
    <col class="col2" />
    <col class="col3" />
<thead>
    <tr>
        <th colspan="3">
            Comparatif {$taxYear}
            {#if (!$fraisHebergementInput || $fraisHebergementInput == nightsCostEstimate)}
                <div class="estimate" transition:fade|local><small>basé sur une estimation des nuitées à ±20%</small></div>
            {/if}
        </th>
    </tr>
    <tr>
        <th>Nuitées AF</th>
        <th>Frais&nbsp;de&nbsp;Mission -&nbsp;Nuitées -&nbsp;Frais&nbsp;d’emploi</th>
        <th>Abattement de 10% plafonné</th>
    </tr>
    {#if $taxYear !== $taxData.year}
    <tr class="warning"><th colspan="3">Attention les montants sont basés sur les données fiscales de {$taxData.year}</th></tr>
    {/if}
</thead>
<tbody>
    <tr>
        <td>
            <input name="nuitees" type="number" disabled={!!$fraisHebergement} bind:value="{$fraisHebergementInput}" min="0" step="100" placeholder="{($fraisHebergement) ? $fraisHebergement : nightsCostEstimate}"/>
        </td>
        <td>{$fraisDeMission} - {parseFloat($fraisHebergement || $fraisHebergementInput || nightsCostEstimate).toFixed(0)} - {parseFloat(totalFrais).toFixed(0)} = {fraisReels.toFixed(0)} €</td>
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
    <tr>
        <td colspan="3">{roadTripInformation}</td>
    </tr>
</tfoot>
</table>
{:else}
<p>Merci de charger vos EP4/EP5 pour afficher le comparatif</p>
{/if}
<table class="data" id={tableId}>
    <thead>
        <tr><th colspan="6">Détails des salaires {$taxYear}</th></tr>
        <tr><th>Mois</th><th>Compagnie</th><th>Montant imposable</th><th>Cumul imposable</th><th>Frais d’emploi ¹</th><th>Découchers F PRO ²</th></tr>
    </thead>
    <tbody>
        {#each months as month, i}
            {@const bulletins = sortBulletins(byMonth[month] ?? [])}
            {@const rows = bulletins.length ? bulletins : [null]}
            {#each rows as b, j}
                <tr class:december={month === '12'} class:month-alt={i % 2 === 1}>
                    {#if j === 0}
                        <td rowspan={rows.length}>{monthsfr[i]}</td>
                    {/if}
                    <td class="airline">{#if b}<span class="airline-tag">{b.airline}</span>{/if}</td>
                    <td>{b ? localeCurrency(b.imposable) : ""}</td>
                    <td>{b && decimal2cents(b.cumul) > 0 ? localeCurrency(b.cumul) : ""}</td>
                    <td>{b ? localeCurrency(cents2decimal(sumOver([b], x => [...x.repas, ...x.transport]))) : ""}</td>
                    <td>{b ? localeCurrency(cents2decimal(sumOver([b], x => x.decouchers_fpro))) : ""}</td>
                </tr>
            {/each}
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th colspan="2">Total</th>
            <th>{localeCurrency(totalImposable)}</th>
            <th></th>
            <th>{localeCurrency(totalFrais)}</th>
            <th>{localeCurrency(totalDecouchersFPRO)}</th>
        </tr>
        <tr>
            <td colspan="6">1. Les Frais d’emploi comprennent les lignes IND.REPAS, INDEMNITE REPAS, IR.FIN ANNEE DOUBL, IND. TRANSPORT, IND. TRANSPORT EXO, FRAIS REELS TRANSP, R. FRAIS DE TRANSPORT, IR EXONEREES, IR NON EXONEREES du bulletin de paye.</td>
        </tr>
        <tr>
            <td colspan="6">2. Cette colonne reprend la ligne I.DECOUCHERS F.PRO, elle est utilisée pour l’estimation. Pour les impôts, c’est uniquement l’attestation des nuitées AF qui doit être prise en compte.</td>
        </tr>
    </tfoot>
</table>
{:else}
    <div class="illustration">
        <picture>
            <!-- <source srcset="CONF_S_EXAMPLE_WEBP" type="image/webp"> -->
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
        background-color: var(--green);
        color: var(--background-color);
        opacity: 0.9;
        font-size: 1.2em;
        border-radius: 5px;
        top: calc(34 * calc(100% / 1032));
        position: absolute;
        width: 220px;
        left: 50%;
        margin-left: -110px;
        text-transform: uppercase;
        font-weight: 200;
    }
    @media all and (min-width: 1032px) {
        :global(picture img){
            max-width: 800px;
        }
        :global(.illustration::after) {
            font-size: 1.5rem;
            width: 300px;
            margin-left: -150px;
        }
    }
    :global(.illustration) {
        margin: 50px auto 0 auto;
        width: 80%;
        position: relative;
    }
    table.data.summary {
        table-layout: fixed;
    }
    :global(table.data.summary tfoot td) {
        font-size: initial;
    }
    .col1 {
        width: 140px;
    }
    .col2 {
        width: 50%;
    }
    :global(table.data.summary thead th:first-child) {
        position: relative;
    }
    @media all and (min-width: 770px) {
        .estimate small { width: 240px !important;}
    }
    .estimate{
        position: absolute;
        bottom: 0px;
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
        width: 130px;
    }
    td input:disabled {
        color: var(--green);
        -webkit-text-fill-color: var(--green);
        opacity: 0.85; /*ios*/
    }
    tfoot th { /* Total bottom line */
        font-family: monospace;
        font-size: 1.3rem;
    }
    td:nth-last-child(-n+4):not([colspan]), th:nth-last-child(-n+4):not([colspan]) {
        text-align: right;
    }
    td:nth-last-child(-n+4):not([colspan]) {
        white-space: nowrap;
    }
    tbody > tr {
        background-color: var(--table-background-color);
    }
    tbody > tr.month-alt {
        background-color: var(--table-highlight-color);
    }
    td.airline {
        text-align: center;
        width: 1%;
        white-space: nowrap;
    }
    .airline-tag {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 3px;
        background-color: rgba(0, 0, 0, 0.06);
        font-family: monospace;
        font-size: 0.9em;
    }
    tbody > tr.december > td:nth-last-child(3) { /* cumul mois 12 */
        font-weight: bold;
    }
</style>
