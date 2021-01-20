<script>
    import Link from '../components/Link.svelte';
    import HelpMarkup from '../pages/Help.md';
    import { htmlLogo } from '../components/utils';
    import {online} from '../stores';
    import {swDismiss} from '../components/SWUpdate.svelte';
    const version = "APP_VERSION";
    let sw = window.serviceWorker;
    let swRunning = true;

    if (!sw && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((reg) => {
            sw = reg;
            return reg;
        }).catch(err => swRunning = false);
    }
    const defaultLabel = 'Vérifier Mise à jour';
    let updateLabel = defaultLabel;

    const getStatus = (reg) => {
        if (!reg) return {'code': 0, 'msg': '🔺 unknown'};
        if (reg.installing) return {'code': 1, 'msg': "🔹 installing"};
        if (reg.waiting) return {'code': 2, 'msg': "🔸 waiting"};
        if (reg.active) return {'code': 3, 'msg': "🟢"};
    }
    $: status = getStatus(sw);

    const checkUpdate = () => {
    updateLabel = "Vérification... ";
    $swDismiss = false;
    sw.update().then((reg) => {
        if (getStatus(reg).code !== 3)
        {
            updateLabel = "";
            sw = sw; // force update
        } else {
            updateLabel = "À jour";
        }
    }).catch((err) => updateLabel = err);
}
</script>

<main>
    <section class='markdown'>
        <h1>{@html htmlLogo} v{version}
        {#if navigator && navigator.standalone && swRunning && $online}
            <small>
            {#if (status.code !== 0 && updateLabel === defaultLabel)}
                <a href="#/" on:click|preventDefault="{checkUpdate}">{updateLabel}</a>
            {:else}
                {updateLabel}
            {/if}
            </small>
        {/if}
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
        margin-left: 1em;
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