<script>
    import Link from '../components/Link.svelte';
    import HelpMarkup from '../pages/Help.md';
    import ChangeLogModal from '../components/ChangeLogModal.svelte';
    import { htmlLogo, shareAppLink } from '../components/utils';
    import {wb} from '../stores';
    const version = "APP_VERSION";
    let swVersion = '';
    let modal;
    const updateVersion = (_wb) => (_wb) ? _wb.messageSW({type: 'GET_VERSION'}).then(v => swVersion = v) : '';
    $: updateVersion($wb);
    const reload = () => {
        window.location.hash = '#/';
        console.log('reload page');
        window.location.reload();
    };
</script>

<ChangeLogModal bind:this={modal} />
<main>
    <section class='markdown'>
        <h1>{@html htmlLogo} v{version} 
            <small on:click|once={() => $wb.update()}>/ ServiceWorker&#8239;: {swVersion}</small>
            {#if $wb}{#await $wb.active then ok}<small>/ mode déconnecté disponible</small>{/await}{/if}
            {#if navigator.standalone === true || 'process.env.NODE_ENV' === '"development"'}
                {#if (navigator.share || 'process.env.NODE_ENV' === '"development"')}<button class="btn-sm" on:click={shareAppLink}>Partager</button>{/if}
                <button class="btn-sm" on:click={reload}>Recharger</button>
            {/if}
            <button class="btn-sm" on:click={modal.show}>CHANGELOG</button>
        </h1>
        <HelpMarkup/>
    </section>
    <div class="footer">
        <p>Alert Icon via <Link href="https://commons.wikimedia.org/wiki/File:OOjs_UI_icon_alert_destructive.svg">Wikimedia Commons</Link></p>
        <p>Other Icons made by <Link href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</Link> from <Link href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</Link></p>
    </div>
</main>

<style>
    div.footer{
        font-size: xx-small;
        margin-top: 2rem;
    }
    h1 small {
        font-weight: 200;
        font-size: 0.8rem;
    }
    :global(section.markdown) {
        margin: 0 auto;
        max-width: 800px;
        text-align: justify;
    }
    :global(section.markdown a) {
        white-space: nowrap;
    }
    :global(section.markdown ul){
        list-style-type: square;
        padding-inline-start: 25px;
    }
    :global(section.markdown li){
        margin: 3px 0;
    }

</style>