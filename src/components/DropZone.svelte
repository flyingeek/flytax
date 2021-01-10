<script context="module">
    import loader from "./async-script-loader.js";
    import { Deferred } from "./utils.js";
    import { onMount} from "svelte";
    const pdfjsWorkerSrc = "CONF_PDFJS_WORKER_JS";
    let pdfWorker;
    let seqOrder = 0;
    const preloadFiles = [
        { type: "script", url: "CONF_PDFJS_JS" }
    ];

    const getPageText = async (pdf, pageNo, separator = "") => {
        const page = await pdf.getPage(pageNo);
        const tokenizedText = await page.getTextContent();
        return tokenizedText.items.map((token) => token.str).join(separator);
    };

    const getPDFText = async (source, separator = "") => {
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        const pdfPages = [];
        const pdf = await pdfjsLib.getDocument(source).promise;
        const maxPages = pdf.numPages;
        for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
            const pageText = await getPageText(pdf, pageNo, separator);
            pdfPages.push(pageText);
        }
        return pdfPages.join("\n");
    };
</script>

<script>
    import {taxYear, taxData, base, tzConverter, ep5, paySlips} from '../stores';
    import {router} from '../parsers/router';
    const acceptedType = 'application/pdf'; 
    let disabled = false; // locally during file processing
    let ready = new Deferred();
    let name = "file";
    let dropzoneHasFocus = false;

    function preload() {
        loader(
            preloadFiles,
            () => !!window["pdfjs-dist/build/pdf"],
            () => {
                const pdfjsLib = window["pdfjs-dist/build/pdf"];
                pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
                if (!pdfWorker || pdfWorker.destroyed) {
                    pdfWorker = new pdfjsLib.PDFWorker({verbosity: 0});
                }
                ready.resolve(true);
            }
        );
    }
    class Warning extends Error {};

    const getPDF = (file, fileName) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = (ev) => {
                if (!pdfWorker || pdfWorker.destroyed) {
                    const pdfjsLib = window["pdfjs-dist/build/pdf"];
                    pdfWorker = new pdfjsLib.PDFWorker({verbosity: 0});
                }
                getPDFText({ data: ev.target.result , verbosity: 0, worker: pdfWorker}, "_").then(
                    (text) => {
                        if (text) {
                            resolve(text);
                        } else {
                            const err = new Warning(`%c${fileName}\n%cabsence de texte dans le PDF`);
                            reject(err);
                        }
                    },
                    (err) => reject(err)
                );
            };
            reader.onerror = (err) => {
                reject(new Warning(`%c${fileName}\n%cfichier illisible !`));
            };
            reader.readAsArrayBuffer(file);
        });
    };
    async function processFiles(files, target) {
        disabled = true;
        await ready.promise.then(() => {
            const promises = [];
            const basename = (file) => file.name.split(/([\\/])/g).pop();
            let batchPaySlips = {};
            let batchEp5 = {};
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file) {
                    const fileName = basename(file);
                    promises.push(
                        getPDF(file, fileName).then((text) => {
                            const results = router(text, fileName, i + seqOrder, $taxYear, $taxData, $base, $tzConverter);
                            results.forEach(result => {
                                if (result.type === 'error') {
                                    console.log(`%c${fileName}\n%c${result.msg}`, 'font-family: monospace;', 'color: red;');
                                    //console.log(result);
                                    return;
                                } else if (result.type === 'warning') {
                                    console.log(`%c${fileName}\n%c${result.msg}`, 'font-family: monospace;', 'color: darkorange;');
                                    return;
                                } else {
                                    const [year, month] = result.date.split('-');
                                    if (year !== $taxYear) {
                                        console.log(`%c${fileName}\n%ctype [${result.type}] %cannée ${year} iso ${$taxYear}`, 'font-family: monospace;', 'color: black;', 'color: darkorange;');
                                        return;
                                    }
                                    if (result.type === "pay") {
                                        Object.assign(batchPaySlips, {[month]: result}); // this method of saving result does not refresh svelte
                                    }else if (result.type === "ep5") {
                                        Object.assign(batchEp5, {[month]: result}); // this method of saving result does not refresh svelte
                                    }
                                }
                            });
                        }).catch((err) => (err instanceof Warning) ? console.log(err.message, 'font-family: monospace;', 'color: red;') : console.error(err))
                    );
                }
            }
            seqOrder += files.length;
            const afterLoad = () => {
                disabled = false;
                if (target) target.value = null; // reset file input
                paySlips.update((theStore) => {
                    return Object.assign(theStore, batchPaySlips);
                });
                batchPaySlips = {};
                ep5.update((theStore) => {
                    return Object.assign(theStore, batchEp5);
                });
                batchEp5 = {};
            };
            Promise.all(promises)
                .then(() => {
                    afterLoad();
                }).catch((err) => {
                    //should never be there but...
                    afterLoad();
                    console.error(err);
                });
        });
    }
    async function processChange(event) {
        processFiles(event.target.files, event.target);
    }

    async function processDrop(event) {
        dropzoneHasFocus = false;
        disabled = true;
        const files = [];
        async function* getEntriesAsAsyncIterator(dirEntry) {
            const reader = dirEntry.createReader();
            const getNextBatch = () =>
                new Promise((resolve, reject) => {
                    reader.readEntries(resolve, reject);
                });
            let entries;  
            do {
                entries = await getNextBatch();
                for (const entry of entries) {
                    if (entry.isFile) yield entry;
                }
            } while (entries.length > 0);
        }
        async function fileAsPromise(entry) {
            return new Promise((resolve, reject) => {
                entry.file(resolve, reject);
            });
        }
        const entries = [...event.dataTransfer.items].map(item => item.webkitGetAsEntry());
        for (const entry of entries) {
            if (entry.isDirectory) {
                for await (const e of getEntriesAsAsyncIterator(entry)) {
                    const file = await fileAsPromise(e);
                    files.push(file);
                }
            } else {
                const file = await fileAsPromise(entry);
                files.push(file);
            }
        }
        if ((acceptedType !== undefined && acceptedType !== null)) {
            processFiles(files.filter(f => f.type === acceptedType));
        } else {
            processFiles(files);
        }
    }
    onMount(async () => preload())
</script>

<!-- <svelte:window on:load={preload}/> -->
<style>

:global(.dropzone) {
  border: 2px dashed var(--blueaf);
  border-radius: 5px;
  background: var(--dropzone-background-color);
  width: 80%;
  margin: 0 auto 2em auto;
  position: relative;
}
:global(.dropzone figure) {
    width: 60px;
    height: 60px;
    display: block;
    margin: 0 auto;
}
:global(.dropzone figure svg) {
    width: 100%;
    height: 100%;
    opacity: 0.5;
}
:global(.dropzone figure svg use) {
    width: 100%;
    height: 100%;
}
:global(.dropzone input[type=file]) {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
}
:global(.dropzone label) {
    z-index: -1;
}
:global(.dropzone.focus){
    border-color: var(--green);
}
:global(.dropzone.focus svg){
    fill:var(--green);
    opacity: 1;
}
:global(.dropzone.focus input[type=file]:disabled + label svg) {
    fill:var(--redaf);
    opacity: 1;
}
:global(.dropzone input[type=file]:hover) {
    cursor: pointer;
}
:global(.dropzone input[type=file]:disabled) {
    cursor: not-allowed;
}
:global( .dropzone div[slot]) {
    padding: 20px
}
:global(.dropzone div[slot=top]) {
    text-transform: uppercase;
    font-weight: 200;
    font-size: 1.5rem;
}
:global(.dropzone div[slot=top] strong) {
    font-weight: 200;
}
</style>
<div class="dropzone" class:focus={dropzoneHasFocus}>
    {#if false}<slot />{/if}
    <input
    id={name}
    {name}
    type="file"
    multiple
    accept="application/pdf"
    disabled={disabled || !$taxData}
    on:change={processChange}
    on:click|once={preload}
    on:drop|preventDefault={processDrop}
    on:dragenter={() => dropzoneHasFocus = true}
    on:dragleave={() => dropzoneHasFocus = false}
    />
    <label for={name}>
        <slot name="top"></slot>
        <figure>
            <svg><use xlink:href="#upload"/></svg>
        </figure>
        <slot name="bottom"></slot>
    </label>

</div>
