<script>
    import DropZone from '../components/DropZone.svelte';
    import MonthStatus from "../components/MonthStatus.svelte";
    import PayTable from '../components/PayTable.svelte';
    import {paySlips} from '../stores';
</script>
<main>
    <div class="wrapper">
        <div class="header">
        </div>
        <DropZone>
            <div slot="top">
                Déposez vos <strong>bulletins</strong> dans la zone ou Cliquez
            </div>
            <div slot="bottom">
                <MonthStatus data={$paySlips} name="Bulletins de salaire">, attestation de nuitées si disponible</MonthStatus>
            </div>
        </DropZone>
        <PayTable data={$paySlips}/>
    </div>
</main>
<style>
    .header{min-height: 50px}
    .wrapper{max-width:1200px; margin: 0 auto;}
</style>