import App from './App.svelte';
import {Workbox} from 'workbox-window';
import {showSkipWaitingPrompt, swRegistration} from './components/SWUpdate.svelte';
import {wb} from './stores';


let appError = false;
try {
    const app = new App({
        target: document.body
    });
}catch(err) {
    appError = true;
    try {
        var content = document.createElement("p");
        content.innerHTML =('Erreur: ' + err.message + '<br/><br/>'
            + 'FLYTAX a besoin de navigateurs récents: Safari 14 iOS/Mac, Firefox 86, Chrome 87 et Microsoft Edge 87 sont compatibles. <br /><br />'
            + 'Contactez moi sur l\'email AF (erdelord@...) en me donnant le message d\'erreur.'
        );
        document.body.appendChild(content);
    }catch(e){} /* catch all here we can not interrupt the startup sequence */ 
}finally{
    // we always register the serviceWorker to be able to unregister it
    // or to force skipWaiting and page reload
    // this way as soon as a new serviceWorker fix the problem, the page will load
    if ('serviceWorker' in navigator) {
        const workbox = new Workbox('./sw.js');
        wb.set(workbox);
        workbox.addEventListener('installed', (event) => {
            if (!event.isUpdate) {
                //console.log('Service worker installed for the first time!');
            }else{
                //console.log('Updated Service worker installed');
            }
            console.debug('Updated Service worker installed', event.isUpdate, event.isExternal)
        });
        workbox.addEventListener('activated', (event) => {
            // `event.isUpdate` will be true if another version of the service
            // worker was controlling the page when this version was registered.
            if (!event.isUpdate) {
                //console.log('Service worker activated for the first time!');
                // If your service worker is configured to precache assets, those
                // assets should all be available now.
            }else{
                //console.log('Updated Service worker activated');
            }
            console.debug('Updated Service worker activated ', event.isUpdate, event.isExternal)
        });
        workbox.addEventListener('waiting', (event) => {
            //console.log(`A new service worker has installed, but it can't activate` +
            //    ` until all tabs running the current version have fully unloaded.`);
            if (appError) {
                workbox.addEventListener('controlling ', () => {
                    window.location.reload();
                });
                workbox.messageSkipWaiting();
            }else{
                console.debug('Updated Service worker waiting', event.isUpdate, event.isExternal, event.wasWaitingBeforeRegister);
                showSkipWaitingPrompt(event.isExternal);
            }
        });
        workbox.register().then(reg => {
            if (appError && reg) reg.unregister();
            swRegistration.set(reg);
            //console.debug(reg);
        }, console.error);
    }
}

export default app;