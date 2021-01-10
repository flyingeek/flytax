<script>
    //import {online} from '../stores';
    import Link from '../components/Link.svelte'
    import { htmlLogo } from '../components/utils';
    const version = "APP_VERSION";
</script>
<main>
    <!-- {#if $online !== undefined}<p>Browser is {($online) ? 'online': 'offline'}</p>{/if} -->
    <p>La page d'assistance arrive bientôt !</p>

    <p>{@html htmlLogo} v{version}</p>

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
</style>