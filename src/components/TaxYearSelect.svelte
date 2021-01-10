<script>
    import {taxYear, DATASET} from "../stores";
</script>
<label class="select">
<!-- svelte-ignore a11y-no-onchange -->
<select bind:value={$taxYear}>
    {#each Object.values(DATASET) as option}
        <option value={option.label} selected={$taxYear === option.label}>{option.label}</option>
    {/each}
</select>
</label>