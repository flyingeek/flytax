<script context="module">
    import {writable} from 'svelte/store';
    export const swDismiss = writable(false);
    export const swUpdated = writable(false);
    export const wb = writable();
    export const swRegistration = writable();
    export const showSkipWaitingPrompt = () => {
        swUpdated.set(true);
        swDismiss.set(false);
    };

</script>
<script>
    import { fade } from 'svelte/transition';
    let installLabel = 'Installer';
    $swDismiss = false;
    const install = () => {
        // $swRegistration.waiting check is needed to the 'reload the page' fallback
        if ($wb && $swRegistration && $swRegistration.waiting) {
            $wb.addEventListener('controlling', () => {
                window.location.reload();
            });
            installLabel = "En cours...";
            $swRegistration.waiting.postMessage({type: 'SKIP_WAITING'});
        }else{ /* update probably done in another tab */
            window.location.reload();
        }
    }
</script>

{#if $swUpdated && !$swDismiss}
<div class="toast" transition:fade style="position: fixed; top: 0; right: 0;">   
    <div class="toast-header">
        <strong><span>👨🏻‍✈️</span>Mise à jour disponible</strong>
        <button type="button" class="close" aria-label="Close" on:click={() => $swDismiss=true}>
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="toast-body">
        <button on:click|once={() => install()}>{installLabel}</button>
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
        color: var(--background-color);
        background-color: var(--blueaf);
        border-radius: 3px;
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

</style>