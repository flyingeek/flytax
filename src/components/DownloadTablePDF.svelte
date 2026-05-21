<script context="module">
    import loader from "./async-script-loader.js";
    import { Deferred } from "./utils.js";
    const preloadFiles = [
        { type: "script", url: "CONF_JSPDF_JS" , async: false, defer: false }
    ];
    const preloadFiles2 = [
        { type: "script", url: "CONF_JSPDF_TABLE_JS", async: false, defer: false }
    ];
</script>
<script>
    import { onMount} from 'svelte';
    let ready = new Deferred();
    let disabled = false;
    export let label = "Télécharger en PDF";
    export let filename = "table.pdf";
    export let tableIds = ['#my-table'];
    function preload() {
        loader(
            preloadFiles,
            () => !!window["jspdf"],
            () => {
                loader(preloadFiles2, () => !!window['jspdfext'], () => {
                    window['jspdfext'] = "autotable";
                    const fontName = "CONF_JSPDF_FONT_TTF".split('/').pop();
                    if (!window['jspdffont']) {
                        fetch("CONF_JSPDF_FONT_TTF")
                        .then( async (res) => {
                            if (res.ok) {
                                try{ 
                                    const blob = await res.blob();
                                    const reader = new FileReader();
                                    reader.onload = function(event){
                                        window['jspdffont'] = event.target.result;
                                        const callAddFont = function () {
                                            this.addFileToVFS(fontName, window['jspdffont']);
                                            this.addFont(fontName, fontName.split('.').shift(), 'normal');
                                        };
                                        window["jspdf"].jsPDF.API.events.push(['addFonts', callAddFont]);
                                        disabled = false;
                                        ready.resolve(true);
                                    };
                                    reader.onerror = () => {
                                        disabled = true;
                                        ready.reject(`failed to read the downloaded font ${fontName}`);
                                    }
                                    reader.readAsBinaryString(blob);
                                } catch (err) {
                                    disabled = true;
                                    ready.reject(err);
                                }
                            } else {
                                disabled = true;
                                ready.reject(`error loading ${fontName}: ${res.statusText}`);
                            }
                        }, err => { /* handles fetch error like no network */
                            disabled = true;
                            ready.reject(err);
                        });
                    }else{
                        disabled = false;
                        ready.resolve(true);
                    }
                });
            }
        );
    }

    const download = async (e) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        disabled = true;
        try {
            await ready.promise;
            if (tableIds.includes('MissionTable')) {
                const table = document.getElementById(`MissionTable`);
                const elements = table.querySelectorAll(`summary`);
                elements.forEach(e => {
                    e.parentNode.parentNode.innerText = e.innerText;
                });
            }
            // PayTable footnotes use <ol> + <details> reveals. autoTable
            // flattens both: list-item numbering and line breaks are
            // lost, and `includeHiddenHtml: true` includes the details
            // body anyway. Replace the <ol> with a flat <div> of
            // numbered <p>s (details stripped) during PDF generation
            // and restore the original afterwards.
            const paytableOlBackups = [];
            if (tableIds.includes('PayTable')) {
                const table = document.getElementById('PayTable');
                table.querySelectorAll('ol.footnotes').forEach(ol => {
                    const placeholder = document.createComment('paytable-ol');
                    ol.parentNode.insertBefore(placeholder, ol);
                    // autoTable flattens block-level elements (<p>, <li>)
                    // when extracting cell text, so use explicit <br><br>
                    // separators between items — those it respects.
                    const flatHTML = [...ol.children].map((li, i) => {
                        const clone = li.cloneNode(true);
                        clone.querySelectorAll('details').forEach(d => d.remove());
                        return `${i + 1}. ${clone.innerHTML.trim()}`;
                    }).join('<br><br>');
                    const flat = document.createElement('div');
                    flat.innerHTML = flatHTML;
                    ol.parentNode.replaceChild(flat, ol);
                    paytableOlBackups.push({original: ol, flat, placeholder});
                });
            }
            for (const tableId of tableIds) {
                const table = document.getElementById(tableId);
                table.classList.add("print");
            }
            const doc = new jspdf.jsPDF({orientation: "landscape"});
            for (const [i, tableId] of tableIds.entries()) {
                doc.autoTable({ 
                    html: '#' + tableId,
                    styles: { font: 'HelveticaUTF8'},
                    useCss: true, showHead: 'firstPage',
                    showFoot: 'lastPage',
                    pageBreak: (i === 0) ? 'auto': 'avoid',
                    includeHiddenHtml: true
                });
            }
            // doc.save(e.target.download);
            // only "application/octet-stream" works on ipad
            const filename = e.target.download;
            const blob = new Blob( [doc.output('arraybuffer', {filename})], { type: "application/octet-stream" });
            if (e.target.href.startsWith('blob:')) URL.revokeObjectURL(e.target.href);
            e.target.href = URL.createObjectURL(blob);
            if (tableIds.includes('MissionTable')) {
                const table = document.getElementById(`MissionTable`);
                const elements = table.querySelectorAll(`td[title]`);
                elements.forEach(e => {
                    e.innerHTML = `<details><summary>${e.innerText}</summary>${e.title}</details>`;
                });
            }
            paytableOlBackups.forEach(({original, flat, placeholder}) => {
                flat.parentNode.replaceChild(original, flat);
                placeholder.parentNode.removeChild(placeholder);
            });
            for (const tableId of tableIds) {
                const table = document.getElementById(tableId);
                table.classList.remove("print");
            }
        }catch(err){
            console.error(err);
        }
        disabled = false;
    };
    onMount(async () => {
        preload();
    });
</script>
<a href="." class:disabled on:click={download} download={filename}>{label}</a>

<style>
    :global(a[download]) {
        padding: 10px;
        background-color: var(--blueaf);
        display: inline-block;
        color: var(--white);
        border-radius: 5px;
        text-decoration: none;
    }
    a[download].disabled {
        display: none;
    }
</style>