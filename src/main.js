import App from './App.svelte';
import {Workbox} from 'workbox-window';
import {swUpdated, wb} from './components/SWUpdate.svelte';

if ('serviceWorker' in navigator) {
    const workbox = new Workbox('./sw.js');
    wb.set(workbox);
    workbox.addEventListener('installed', (event) => {
        if (!event.isUpdate) {
            console.log('Service worker installed for the first time!');
        }else{
            console.log('Updated Service worker installed');
        }
    });
    workbox.addEventListener('activated', (event) => {
        // `event.isUpdate` will be true if another version of the service
        // worker was controlling the page when this version was registered.
        if (!event.isUpdate) {
          console.log('Service worker activated for the first time!');
      
          // If your service worker is configured to precache assets, those
          // assets should all be available now.
        }else{
            console.log('Updated Service worker activated');
        }
    });
    workbox.addEventListener('waiting', (event) => {
        console.log(`A new service worker has installed, but it can't activate` +
            ` until all tabs running the current version have fully unloaded.`);
        swUpdated.set(true);
    });
    workbox.register();
}

const app = new App({
    target: document.body
});

export default app;