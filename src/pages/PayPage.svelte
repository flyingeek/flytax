<script>
    import DropZone from '../components/DropZone.svelte';
    import MonthStatus from "../components/MonthStatus.svelte";
    import PayTable from '../components/PayTable.svelte';
    import {paySlips, nuiteesInput, fraisDeMission, disableTransition, nuiteesAF} from '../stores';
    import {localeCurrency} from '../components/utils';
    import {fade} from 'svelte/transition';
</script>
<main>
    <div class="header">
        {#if ($nuiteesAF !== undefined)}
            <div class:no-transition={$disableTransition} in:fade >Frais de nuitées: {localeCurrency($nuiteesAF)}</div>
        {:else if ($nuiteesAF === undefined && $fraisDeMission > 0 && Object.keys($paySlips).length > 1)}
            <label class:no-transition={$disableTransition} in:fade for="nuitees">Frais de nuitées: <input name="nuitees" type="number" bind:value="{$nuiteesInput}" min="0" step="100"/></label>
        {/if}
    </div>
    <DropZone>
        <div slot="top">
            Déposez vos <strong>bulletins</strong> dans la zone ou Cliquez
        </div>
        <div slot="bottom">
            <MonthStatus data={$paySlips} name="Bulletins de salaire"/>
        </div>
    </DropZone>
    <PayTable data={$paySlips}/>
</main>
<style>
    .header{min-height: 50px}
</style>