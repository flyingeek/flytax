import App from './App.svelte';
import {Workbox} from 'workbox-window';
import {showSkipWaitingPrompt, wb, swRegistration} from './components/SWUpdate.svelte';


let appError = false;
try {
    //throw new Error();
    const app = new App({
        target: document.body
    });
}catch(err) {
    appError = true;
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
        });
        workbox.addEventListener('waiting', (event) => {
            //console.log(`A new service worker has installed, but it can't activate` +
            //    ` until all tabs running the current version have fully unloaded.`);
            if (appError) {
                workbox.addEventListener('controlling', () => {
                    window.location.reload();
                });
                workbox.messageSkipWaiting();
            }else{
                showSkipWaitingPrompt();
            }
        });
        workbox.register().then(reg => {
            if (appError && reg) reg.unregister();
            if (reg) swRegistration.set(reg);
        }, console.error);
    }
}

export default app;