<script>
    import HomePage from './pages/HomePage.svelte';
    import MissionPage from './pages/MissionPage.svelte';
    import PayPage from './pages/PayPage.svelte';
    import HelpPage from './pages/HelpPage.svelte';
    import LogWindow from './components/LogWindow.svelte';
    import {route, viewLog} from './stores';
    import NavBar from './components/Navbar.svelte';
    import SWUpdate from './components/SWUpdate.svelte';

</script>
    <SWUpdate/>
    <NavBar/>
    {#if $viewLog}<LogWindow />{/if}
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
</style>