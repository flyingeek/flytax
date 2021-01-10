<script>
    import { log, viewLog } from "../stores";
    import {onMount} from 'svelte';
    const text2html = (text) => text.replace(/\n/g, "<br/>");
    const renderText = (text) => `<p>${text2html(text)}</p>`;
    const renderStyledText = (logEvent) => {
        const styles = logEvent.values.slice(1);
        const message = logEvent.values[0];
        const markerCount = message.match(/%c/g).length;
        styles.length = markerCount;
        const results = [];
        const changeStyleColor = (text) => {
            return text
                .replace('color: darkorange;', 'color: var(--maximum-yellow-red);')
                .replace('color: red;', 'color: var(--redaf);')
                .replace('color: black;', 'color: var(--blueaf);')
        }
        for (const [i, text] of Object.entries(message.split("%c"))) {
            if (i > 0)
                results.push(
                    `<span style="${changeStyleColor(styles[i - 1])}">${text2html(text)}</span>`
                );
        }
        return `<p>${results.join("")}</p>`;
    };
    const describe = (value) => {
        if (value instanceof Error) {
            return value.message;
        } else if (
            Object.prototype.toString.call(value) === "[object String]"
        ) {
            return value.toString();
        } else if (value.toString) {
            return value.toString();
        } else {
            return "consulter la console du navigateur pour voir cet événement";
        }
    };
    const renderLogEvent = (logEvent) => {
        try {
            const results = [];
            if (!Array.isArray(logEvent.values) || logEvent.values.lenght === 0)
                return "";
            if (Object.prototype.toString.call(logEvent.values[0]) === "[object String]" && logEvent.values[0].includes("%c")) {
                results.push(renderStyledText(logEvent));
            } else {
                for (const value of logEvent.values) {
                    results.push(renderText(describe(value)));
                }
            }
            return `<li class="${logEvent.type}">${results.join("")}</li>`;
        } catch (err) {
            return `<li class="error"><p>Erreur dans la console: ${err.message}</p></li>`;
        }
    };
    const clear = () => {
        log.reset();
        $viewLog = false;
    }
    onMount(async () => {
        try {
            const element = document.querySelector(".window");
            element.scrollTop = element.scrollHeight;
        } catch (err) {console.error(err)};
    });
</script>

<style>
    .window-wrapper {
        width: 60ch;
        max-width: 100%;
        height: 50%;
        position: fixed;
        right: 0px;
        z-index: 15;
    }
    .window {
        height: 100%;
        background: var(--background-color);
        border: 3px solid var(--blueaf);
        border-top: none;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    .head {
        background: var(--blueaf);
        color: var(--background-color);
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        padding: 5px 3px 5px 12px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    .head button {
        margin: 0 0 0 20px;
        padding: 0.2em 0.3em;
    }

    :global(.console) {
        font-family: monospace;
        font-size: small;
        display: flex;
        flex-direction: column;
        min-height: min-content; /* needs vendor prefixes */
    }
    :global(.console ol){
        list-style: none;
        counter-reset: console-counter;
        padding-inline-start: 0px;
    }
    :global(.console ol li) {
        counter-increment: console-counter;
        position: relative;
    }
    :global(.console ol li::before) {
        content: counter(console-counter);
        font-weight: bold;
        font-size: 1rem;
        right: 7px;
        position: absolute;
        top: 0;
        color: rgba(var(--blueaf_rgb), 0.1);
    }
    :global(.console p, .console ol) {
        margin-block-end: 0px;
        margin-block-start: 0px;
    }
    :global(.console li) {
        /* log & error */
        padding: 5px 10px;
        border-bottom: 1px solid #eee;
    }
    :global(.console .error) {
        background-color: #ff000008;
        color: var(--redaf);
    }
</style>

<div class="window-wrapper">
    <div class="head">
        <div>Alertes reçues</div>
        <button on:click={clear}>Effacer</button>
        <span class="flexspace" />
        <button on:click={() => ($viewLog = false)}><b>Ｘ</b></button>
    </div>
    <div class="window">
        <div class="console"><ol>
            {#each $log as logEvent}
                {@html renderLogEvent(logEvent)}
            {/each}
        </ol></div>
    </div>
</div>
