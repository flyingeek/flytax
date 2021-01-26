import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {StaleWhileRevalidate, CacheFirst} from 'workbox-strategies';
import {ExpirationPlugin} from 'workbox-expiration';

const deprecatedCaches = ['flytax-data', 'flytax-data2', 'flytax-warmup', 'flytax-img'];
const warmupCacheName = 'flytax-warmup2';
const dataCacheName = 'flytax-data3';
const iconsCacheName = 'flytax-icons';
const imageCacheName = 'flytax-img2';
const SW_VERSION = 'APP_VERSION';
let immediateClaimRequired = false;

precacheAndRoute(
    self.__WB_MANIFEST, {
//    "directoryIndex": null,
//    "ignoreURLParametersMatching": []
});

self.__WB_DISABLE_DEV_LOGS = true;
const thirdPartyUrls = [
    'CONF_PDFJS_JS',
    'CONF_PDFJS_WORKER_JS',
    'CONF_JSPDF_JS',
    'CONF_JSPDF_TABLE_JS'
];
const flytaxUrls = [
    'CONF_JSPDF_FONT_TTF',
    'CONF_ABRILFATFACE_WOFF2'.replace('../','./'), /* was relative to bundle.css */
    'CONF_ABRILFATFACE_WOFF'.replace('../','./')
];
const warmupUrls = thirdPartyUrls.concat(flytaxUrls);
const dataUrls = 'CONF_DATASET_URLS'.split(';');
const imageUrls = ['CONF_FM_EXAMPLE_IMG', 'CONF_S_EXAMPLE_IMG'];

registerRoute(
    /.+\/(pdf\.min\.js|pdf\.worker\.min\.js|jspdf\..+min\.js|HelveticaUTF8\.ttf|abril-fatface-v12-latin-ext_latin-regular\.woff2?)$/,
    new CacheFirst({
      cacheName: warmupCacheName,
    })
);
registerRoute(
  ({url}) => url.pathname.match(/\/data\/data[0-9]{4}\.json/),
  new CacheFirst({
    cacheName: dataCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 6
      })
    ]
  })
);
registerRoute(
  ({url}) => url.pathname.match(/\/img\//),
  new CacheFirst({
    cacheName: imageCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 6
      })
    ]
  })
);
registerRoute(
  ({url}) => url.pathname.match(/\/flytax-icons\/.+\.png/),
  new StaleWhileRevalidate({
    cacheName: iconsCacheName,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20
      })
    ]
  })
);
// from https://github.com/TalAter/cache.adderall
const addAll = function(cache, immutableRequests = [], mutableRequests = []) {
  // Verify arguments
  if (!(cache instanceof Cache) || !Array.isArray(immutableRequests) || !Array.isArray(mutableRequests)) {
    return Promise.reject();
  }

  let newImmutableRequests = [];

  // Go over immutable requests
  return Promise.all(
    immutableRequests.map(function(url) {
      return caches.match(url).then(function(response) {
        if (response) {
          return cache.put(url, response);
        } else {
          newImmutableRequests.push(url);
          return Promise.resolve();
        }
      });
    })
  // go over mutable requests, and immutable requests not found in any cache
  ).then(function() {
    return cache.addAll(newImmutableRequests.concat(mutableRequests));
  });
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.keys()
        .then(cacheNames => {
          // if(cacheNames.includes('flytax-warmup')) immediateClaimRequired = true; /* removed: bug did not exist */
          return Promise.resolve();
        })
        .then(() => caches.open(warmupCacheName))
        .then((cache) => addAll(cache, warmupUrls))
        .then(() => caches.open(dataCacheName))
        .then((cache) => addAll(cache, dataUrls))
        .then(() => caches.open(imageCacheName))
        .then((cache) => addAll(cache, imageUrls))
        .then(() => {
            if (immediateClaimRequired) {
              /* take control */
              self.skipWaiting();
            }
            return Promise.resolve();
        })
    )
});
/**
 * Check if we should keep the cache based on the name
 * @param {Array} cacheName
 * @returns {Boolean}
 */
const isOldCache = (cacheName) => {
  return deprecatedCaches.includes(cacheName);
};
/**
 * check entries of a cache to find 
 * old entry (not present in thirdPartyUrls or lidoUrls)
 * @param {Request} request 
 * @returns {Boolean} true if should be removed from cache
 */
const isOldRequest = (request) => {
  if (thirdPartyUrls.indexOf(request.url) !== -1) {
    return false;
  }
  for (const url of flytaxUrls) {
    if (url.startsWith("http")) {
      if (request.url === url) return false;
    } else {
      if (request.url.indexOf(url.replace(/^\./, '')) !== -1) return false;
    }
  }
  return true;
};

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return cacheNames.filter(isOldCache).map((cacheName) => caches.delete(cacheName));
    }).then(() => {
      return caches.open(warmupCacheName)
    }).then(function(cache) {
        return cache.keys().then(function(keys) {
          return Promise.all(keys.filter(isOldRequest).map(request => cache.delete(request)));
        });
    }).then(() => {
      if (immediateClaimRequired) {
        // claim and reload
        self.registration.unregister() 
        .then(() => self.clients.matchAll()) 
        .then((clients) => {
          clients.forEach(client => { 
            if (client.url && "navigate" in client){
              client.navigate(client.url)
            }
          });
        });
      }else{
        return self.clients.claim();
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
  }
});
