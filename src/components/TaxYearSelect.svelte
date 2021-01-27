<script>
    import {taxYear, DATASET, taxData, swDismiss} from "../stores";
    const change = () => {
        $taxData; //force preload
        $swDismiss = false; // show popup update again
    };
</script>
<label class="select">
<!-- svelte-ignore a11y-no-onchange -->
<select bind:value={$taxYear} on:change|preventDefault={change}>
    {#each Object.values(DATASET) as option}
        <option value={option.label} selected={$taxYear === option.label}>{option.label}</option>
    {/each}
</select>
</label>