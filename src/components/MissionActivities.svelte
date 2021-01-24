<script>
    import {localeCurrency} from './utils';
    import MissionCountries from "./MissionCountries.svelte";
    import DownloadTablePDF from './DownloadTablePDF.svelte';
    import {taxYear, taxData, pairings, fraisDeMission} from '../stores';
    import {REFNOTE1} from '../parsers/ep5Parser';
    export let tableId = "MissionTable";
    const tableIndemnitiesId = tableId + "Indemnities";
</script>

{#if $pairings.length > 0}
    <DownloadTablePDF tableIds={[tableId, tableIndemnitiesId]} filename={`fraisdemission${$taxYear}.pdf`}/>
    <table id="{tableId}" class="data">
        <thead>
            <tr><th colspan="5">Frais de Mission {$taxYear} : <strong>{$fraisDeMission} €</strong></th></tr>
            {#if $taxYear !== $taxData.year}
                <tr class="warning"><th colspan="5">Attention les montants sont basés sur les données fiscales de {$taxData.year}</th></tr>
            {/if}
            <tr><th>Date</th><th>Type</th><th>Description</th><th>Formule</th><th>Montant</th></tr>
        </thead>
        <tbody>
            {#each $pairings as rot}
                <tr>
                    <td>{rot.start.substring(8,10)}/{rot.start.substring(5,7)}</td>
                    <td>{rot.days.toString().padStart(2, ' ')} ON</td>
                    <td>{rot.summary}</td>
                    <!-- Do not change markup below without editing DownloadTablePDF.svelte -->
                    <td title="{rot.currencyFormula}"><details><summary>{rot.formula}</summary>{rot.currencyFormula}</details></td>
                    <td>{localeCurrency(rot.indemnity)}</td>
                </tr>
            {/each}
        </tbody>
        <tfoot>
            {#if $pairings.reduce((a,c) => a | c.formula.includes(REFNOTE1), false)}
                <tr><td colspan="5">1. formule tronquée pour respecter l'année fiscale</td></tr>
            {/if}
        </tfoot>
    </table>
    <MissionCountries tableId={tableIndemnitiesId}/>
{:else}
<div class="illustration">
    <picture>
        <img src="CONF_FM_EXAMPLE_IMG" alt="exemple de résultat sur iPad"/>
    </picture>
</div>
{/if}


<style>

td:nth-child(5), th:nth-child(5){
    text-align: right;
    white-space: nowrap;
}
tr.warning th{
    color: white;
    background-color: var(--red-af);
    text-align: center;
}
details[open] summary{
    margin-bottom: 2px;
}
/* Table title*/
:global(table.data thead tr:nth-child(1) th) {
    text-align: center;
    font-size: large;
    border: none;
    text-transform: uppercase;
    font-weight: 300;
    background-color: var(--table-background-color);
}
:global(table.data tfoot tr, tfoot td){
    border: none;
    font-size: small;
}
:global(table.data tbody td) {
    font-family: monospace;
    font-size: 1.3rem;
}
:global(table.data) {
    margin-top: 3em;
    color: var(--table-color);
}
:global(table.data th, table.data td) {
    border-color: var(--table-border-color);
}

:global( tbody tr:nth-child(even), thead tr:nth-child(2), thead tr:nth-child(3)) {
    background-color: var(--table-highlight-color);
}
:global(tbody tr:nth-child(odd)) {
    background-color: var(--table-background-color);
}
:global(summary:focus){
    outline: none;
}
:global(table.data.print) {
    color: black;
}
:global(table.data.print tfoot tr) {
    background-color: white;
}
:global(table.data.print thead tr:nth-child(1) th) {
    background-color: white;
}
:global(table.data.print tbody tr:nth-child(odd)) {
    background-color: white;
}
:global(table.data.print tbody tr:nth-child(even), table.data.print thead tr:nth-child(2), table.data.print thead tr:nth-child(3)) {
    background-color: var(--light-grey);
}
:global(table.data.print th, table.data.print td) {
    border-color: #ccc;
}
</style>
