<script>
    import {route, log, viewLog} from '../stores';
    import {htmlLogo} from '../components/utils';
    import TaxYearSelect from '../components/TaxYearSelect.svelte';
</script>
<nav>
    <a href="#/" class:active={$route=='/'}>{@html htmlLogo}<sup>beta</sup></a>
    <a href="#/mission" class:active={$route=='/mission'}>Frais De Mission</a>
    <a href="#/pay" class:active={$route=='/pay'}>Salaire</a>
    <a href="#/help" class:active={$route=='/help'}>Aide</a>
    <span class="flexspace"></span>
    {#if $log.length > 0}
        <a href="#/log" on:click|preventDefault={() => $viewLog = !$viewLog}>
            <svg><use xlink:href="#alert"/></svg><sup>{$log.length}</sup>
        </a>
    {/if}
    <TaxYearSelect/>
</nav>

<style>
    sup {
        background-color: var(--redaf);
        color: var(--background-color);
        padding: 1px 3px;
        border-radius: 3px;
        font-weight: normal;
        margin-left: 4px;
        font-size: xx-small;
    }
    nav {
        display: flex;
        /* justify-content: flex-end; */
        position: -webkit-sticky;
        position: sticky;
        top: 0;
        background-color: var(--navbar-background-color);
        --item-color: rgba(var(--blueaf_rgb), 0.5);
        --active-color: rgba(var(--blueaf_rgb), 0.9);
        z-index: 10;
    }
    a {
        display: block;
        padding: 10px;
        color: var(--item-color);
        text-decoration: none;
    }
    a.active {
        color: var(--active-color);
        border-bottom: 2px solid var(--redaf);
    }

    a:hover {
        text-decoration: none;
    }

    a:visited {
        color: var(--item-color);
    }
    a[href="#/"] {
        margin-right: 0;
        font-weight: 700;
    }
    a[href="#/log"] {
        padding-right: 2px;
    }
    :global(.flexspace) {
        display: inline-block;
        flex: 1;
    }
    :global(nav .select) {
        display: flex;
        align-items: center;
        margin-right: 10px;
    }
    :global(nav .select select) {
        background-color: var(--navbar-background-color);
        border: none;
    }
    a[href="#/log"] sup {
        top: -1em;
        position: relative;
        left: -0.5em;
    }
    svg{
        fill:var(--redaf);
        opacity: 1;
        width: 24px;
        height: 24px;
    }
</style>