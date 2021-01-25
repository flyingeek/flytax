<script>
    import HomePage from './pages/HomePage.svelte';
    import MissionPage from './pages/MissionPage.svelte';
    import PayPage from './pages/PayPage.svelte';
    import HelpPage from './pages/HelpPage.svelte';
    import LogWindow from './components/LogWindow.svelte';
    import {route, handleVisibilityChange} from './stores';
    import NavBar from './components/Navbar.svelte';
    import SWUpdate from './components/SWUpdate.svelte';
    import {onMount} from 'svelte';

    onMount(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange, false);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
</script>

<svg style="display: none;">
    <symbol id="upload" viewBox="0 0 20 17">
            <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
    </symbol>
    <symbol id="alert" viewBox="0 0 24 24">
            <path id="point" d="M11 16h2v2h-2z"/>
            <path id="stroke" d="M13.516 10h-3l.484 5h2z"/>
            <path id="triangle" d="M12.017 5.974l7.519 13.026h-15.04l7.521-13.026m0-2.474c-.544 0-1.088.357-1.5 1.071l-7.985 13.831c-.825 1.429-.15 2.598 1.5 2.598h15.968c1.65 0 2.325-1.169 1.5-2.599l-7.983-13.829c-.413-.715-.956-1.072-1.5-1.072z"/>
    </symbol>
    <symbol id="share" viewBox="0 0 50 50">
        <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"/>
        <path d="M24 7h2v21h-2z"/>
        <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"/>
    </symbol>
</svg>

<SWUpdate />
<NavBar/>
<LogWindow />

{#if $route === '/'}
<HomePage/>
{:else if $route === '/mission'}
<MissionPage/>
{:else if $route === '/pay'}
<PayPage/>
{:else if $route === '/help'}
<HelpPage/>
{:else}
<!-- redirect -->
{ window.location.hash = '#/'}
{/if}

<style>
    :global(html, body) {
        height: 100%;
        min-height: 100%;
        width: 100%;
        position: relative;
        --blueaf: #002157; /* --royal-blue-dark */
        --blueaf_rgb: 9,34,84; /* rgba(var(--blueaf_rgb), 0.5) is valid */
        --redaf:#FA3C35; /* --tart-orange */
        --blood-red: #6B0504;
        --green: #2CA58D; /* #28a745 */;
        --snow: #FFFBFF;
        --minion-yellow: #ECD444;
        --light-grey: #eee; /* used to print tables */
        --maximum-yellow-red: #FCBF49;
        /*--light-blue: rgb(213,226,242);/*#4EA5D9*/
        /* --pink: #e83e8c; */
        /*--white: #ffFBff;*/
        /* Other colors found on coolors.co */
        /*--bisque: #F1DABF;*/
        /*--maximum-yellow-red: #FCBF49;*/
        /*--saffron: #EAC435;*/
        /*--mustard: #FFE156;*/
        /*--orange-yellow: #F3B700;*/
        /*--bitter-lemon: #C2E812;*/
        /*--june-bud: #C5D86D;*/
        /*--emerald: #23CE6B;*/
        /*--electric-blue: #87F1FF;*/
        /*--dark-turquoise: #52DEE5;*/
        /*--medium-turquoise: #75C9C8;*/
        /*--star-command-blue: #0077B6;*/
        /*--light-slate-gray: #698996;*/
        /*--sea-green-crayola: #00FDDC;*/
        --color: var(--blueaf);
        --white: white; /* for button like label */
        --background-color: var(--snow);
        --navbar-background-color: var(--minion-yellow);
        --dropzone-background-color: var(--background-color);
        --table-background-color: var(--background-color);
        --table-color: var(--color);
        --table-highlight-color: #00215730; /* blueaf 30% alpha */
        --table-border-color: #ccc;
        color: var(--color);
    }
    :global(body) {
        background-color: var(--background-color);
        margin: 0;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    }
    :global(main) {
        text-align: center;
        padding: 1em 1em 40px 1em;
    }

    /*********/
    /* LINKS */
    /*********/
    :global(a) {
        color: var(--redaf);
        text-decoration: none;
    }
    :global(a:hover) {
        text-decoration: underline;
    }
    :global(a:visited) {
        color: var(--blood-red);
    }
    :global(a[href^="#"]:visited) {
        color: var(--redaf);
    }
    :global(a[href^=http]::after) {
        content: "⬀";
    }

    /*********/
    /* FORMS */
    /*********/
    :global(label) {
        display: block;
    }
    :global(input, button, select, textarea) {
        font-family: inherit;
        font-size: inherit;
        -webkit-padding: 0.4em 0;
        padding: 0.4em;
        margin: 0 0 0.5em 0;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 2px;
    }

    :global(input:disabled) {
        color: #ccc;
    }

    :global(button) {
        color: #333;
        background-color: #f4f4f4;
        outline: none;
        cursor: pointer;
    }

    :global(button:disabled) {
        color: #999;
        cursor: not-allowed;
    }

    :global(button:not(:disabled):active ){
        background-color: #ddd;
    }

    :global(button:focus) {
        border-color: #666;
    }
    :global(.select select){
        color: var(--color);
    }
    :global(.select) {
        display: inline-block;
    }
    :global(.select select){
        -webkit-padding: 0.2em 0;
        padding: 0.2em;
        margin: 0 0 0 0.2em;
    }
    /**********/
    /* TABLES */
    /**********/
    :global(table) {
        border-collapse: collapse;
        width: 100%;
    }
    :global(th, td) {
        padding: 0.25rem;
        text-align: left;
        border: 1px solid #ccc;
    }
    /*******/
    /* SVG */
    /*******/
    :global(svg) {
        fill: var(--color);
    }

    :global(svg[fill=none]) {
        fill: none;
    }
    /********/
    /* LOGO */
    /********/
    :global(span.logo){
        color: var(--blueaf);
        text-transform: uppercase;
    }
    :global(span.logo > span){
        color: var(--redaf);
    }
    :global(.no-transition){
        animation: none !important;
    }
    /*********/
    /* FONTS */
    /*********/
    /* https://google-webfonts-helper.herokuapp.com/fonts/abril-fatface?subsets=latin,latin-ext */
    /* abril-fatface-regular - latin-ext_latin */
    @font-face {
    font-family: 'Abril Fatface';
    font-style: normal;
    font-weight: 400;
    src: local(''),
        url('CONF_ABRILFATFACE_WOFF2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
        url('CONF_ABRILFATFACE_WOFF') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
    }
</style>