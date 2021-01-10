<script>
    import DropZone from '../components/DropZone.svelte';
    import MonthStatus from "../components/MonthStatus.svelte";
    import MissionActivities from '../components/MissionActivities.svelte';
    import {ep5, base, tzConverter, BASES} from '../stores';

    const baseChange = (e) => {
        // we can change base on a month to month basis, so do not empty
        const option = BASES.filter(option => option.label === e.target.value).pop();
        $base = option.value;
        $tzConverter = option.tzConverter;
    };
</script>
<main>
    <div class='header'>
        <label class="select">Indiquez votre base
            <!-- svelte-ignore a11y-no-onchange -->
            <select on:change={baseChange}>
                {#each Object.values(BASES) as option}
                    <option value={option.label} selected={$base.join('') === option.value.join('')}>{option.label}</option>
                {/each}
            </select>
        </label>
    </div>
    
    <DropZone>
        <div slot="top">
            Déposez vos <strong>EP5</strong> dans la zone ou Cliquez
        </div>
        <div slot="bottom">
        <MonthStatus data={$ep5} name="EP5" />
        </div>
    </DropZone>
    <MissionActivities />
</main>
<style>
    .header{min-height: 50px}
</style>