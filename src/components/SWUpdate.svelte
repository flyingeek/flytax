<script context="module">
    import {writable} from 'svelte/store';
    import {swDismiss, wb, paySlips, ep5, route} from '../stores';
    export const swUpdated = writable(false);
    export const swRegistration = writable();
    export const showSkipWaitingPrompt = (isExternal) => {
        // if (isExternal && 'serviceWorker' in navigator && Object.keys(get(ep5)).length === 1 && Object.keys(get(paySlips)).length === 1) {
        //     navigator.serviceWorker.addEventListener('controllerchange', () => {
        //         window.location.reload();
        //     });
        //     try {
        //         get(swRegistration).waiting.postMessage({type: 'SKIP_WAITING'});
        //         console.warn('external waiting was received and no user data found => SKIP_WAITING => reload');
        //     } catch (e) {console.error(e);}
        // } else {
        //     swUpdated.set(true);
        //     swDismiss.set(false);
        // }
        swUpdated.set(true);
        swDismiss.set(false);
    };
</script>
<script>
    import { fade } from 'svelte/transition';
    let installLabel = 'Installer';
    $swDismiss = false;
    const install = (delay=0) => {
        if (delay) console.debug('automatic install ')
        // $swRegistration.waiting check is needed to the 'reload the page' fallback
        let refreshing;
        if ($wb && $swRegistration && $swRegistration.waiting) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                //console.debug('controller change')
                if (refreshing) return;
                refreshing = true;
                console.debug('SWUpdate: controllerchange reload');
                (delay) ? setTimeout(() => window.location.reload(), delay) : window.location.reload();
            });
            //This does not fire when Workbox mark event as isExternal
            $wb.addEventListener('controlling', () => {
                //console.debug('controlling')
                if (refreshing) return;
                refreshing = true;
                console.debug('SWUpdate: controlling reload');
                (delay) ? setTimeout(() => window.location.reload(), delay) : window.location.reload();
            });
            installLabel = "En cours...";
            $swRegistration.waiting.postMessage({type: 'SKIP_WAITING'});
        }else{ /* update probably done in another tab */
            console.debug('SWUpdate: no waiting reg reload');
            window.location.reload();
        }
    }
</script>
{#if ($swUpdated && !$swDismiss && Object.keys($ep5).length === 1 && Object.keys($paySlips).length === 1)}
    <div class="toast" transition:fade style="position: fixed; top: 0; right: 0;">   
        <div class="toast-header">
            <strong><span>👨🏻‍✈️</span>Mise à jour détectée</strong>
        </div>
        <div class="toast-body">
            <button on:click|preventDefault><span class="blinking">Installation...</span></button>
        </div>
    </div>
    {install(($route === '/') ? 3500 : 500) || ''}
{:else if $swUpdated && !$swDismiss}
    <div class="toast" transition:fade style="position: fixed; top: 0; right: 0;">   
        <div class="toast-header">
            <strong><span>👨🏻‍✈️</span>Mise à jour disponible</strong>
            <button type="button" class="close" aria-label="Close" on:click={() => $swDismiss=true}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            <button class="manual" on:click|once={() => install()}>{installLabel}</button>
        </div>
    </div>
{/if}

<style>
    .toast {
        opacity: 1;
        z-index: 20;
        max-width: 350px;
        overflow: hidden;
        font-size: .875rem;
        background-color: rgba(255,255,255,.85);
        background-clip: padding-box;
        border: 1px solid rgba(0,0,0,.1);
        box-shadow: 0 .25rem .75rem rgba(0,0,0,.1);
        -webkit-backdrop-filter: blur(10px);
        backdrop-filter: blur(10px);
        border-radius: .25rem;
    }
    .toast-header {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-align: center;
        align-items: center;
        padding: .25rem .75rem;
        color: #6c757d;
        background-color: rgba(255,255,255,.85);
        background-clip: padding-box;
        border-bottom: 1px solid rgba(0,0,0,.05);
    }
    .toast-header strong {
        margin-right: auto;
    }
    .toast-body {
        padding: .75rem;
        text-align: center;
    }
    .toast-body button{
        border-radius: 3px;
    }
    button.manual{
        color: var(--background-color);
        background-color: var(--blueaf);
    }
    button.close {
        float: right;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: .5;
        padding: 0;
        background-color: transparent;
        border: 0;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin-bottom: .25rem;
        margin-left: 0.5rem;
    }
    strong>span {
        padding-right: 1em;
    }

    .blinking{
        animation:blink 1s infinite;
    }
    @keyframes blink 
    {  
        0% { opacity: 1.0; }
        50% { opacity: 0.0; }
        100% { opacity: 1.0; }
    }


</style>