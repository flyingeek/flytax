<script>
    import Link from '../components/Link.svelte';
    import HelpMarkup from '../pages/Help.md';
    import { htmlLogo } from '../components/utils';
    import {wb} from '../components/SWUpdate.svelte';
    const version = "APP_VERSION";
    let swVersion;
    if ($wb) $wb.messageSW({type: 'GET_VERSION'}).then(v => swVersion = v);
</script>

<main>
    <section class='markdown'>
        <h1>{@html htmlLogo} v{version} <small>/ ServiceWorker&#8239;: {swVersion}</small></h1>
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