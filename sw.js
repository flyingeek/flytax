!function(){"use strict";try{self["workbox:precaching:5.1.4"]&&_()}catch(e){}const e=[],t={get:()=>e,add(t){e.push(...t)}};try{self["workbox:core:5.1.4"]&&_()}catch(e){}const s={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},n=e=>[s.prefix,e,s.suffix].filter((e=>e&&e.length>0)).join("-"),a=e=>e||n(s.precache),r=e=>e||n(s.runtime),i=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class c extends Error{constructor(e,t){super(i(e,t)),this.name=e,this.details=t}}const o=new Set;const h=(e,t)=>e.filter((e=>t in e)),l=async({request:e,mode:t,plugins:s=[]})=>{const n=h(s,"cacheKeyWillBeUsed");let a=e;for(const e of n)a=await e.cacheKeyWillBeUsed.call(e,{mode:t,request:a}),"string"==typeof a&&(a=new Request(a));return a},u=async({cacheName:e,request:t,event:s,matchOptions:n,plugins:a=[]})=>{const r=await self.caches.open(e),i=await l({plugins:a,request:t,mode:"read"});let c=await r.match(i,n);for(const t of a)if("cachedResponseWillBeUsed"in t){const a=t.cachedResponseWillBeUsed;c=await a.call(t,{cacheName:e,event:s,matchOptions:n,cachedResponse:c,request:i})}return c},d=async({cacheName:e,request:t,response:s,event:n,plugins:a=[],matchOptions:r})=>{const i=await l({plugins:a,request:t,mode:"write"});if(!s)throw new c("cache-put-with-no-response",{url:(d=i.url,new URL(String(d),location.href).href.replace(new RegExp(`^${location.origin}`),""))});var d;const p=await(async({request:e,response:t,event:s,plugins:n=[]})=>{let a=t,r=!1;for(const t of n)if("cacheWillUpdate"in t){r=!0;const n=t.cacheWillUpdate;if(a=await n.call(t,{request:e,response:a,event:s}),!a)break}return r||(a=a&&200===a.status?a:void 0),a||null})({event:n,plugins:a,response:s,request:i});if(!p)return;const f=await self.caches.open(e),m=h(a,"cacheDidUpdate"),g=m.length>0?await u({cacheName:e,matchOptions:r,request:i}):null;try{await f.put(i,p)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of o)await e()}(),e}for(const t of m)await t.cacheDidUpdate.call(t,{cacheName:e,event:n,oldResponse:g,newResponse:p,request:i})},p=u,f=async({request:e,fetchOptions:t,event:s,plugins:n=[]})=>{if("string"==typeof e&&(e=new Request(e)),s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const a=h(n,"fetchDidFail"),r=a.length>0?e.clone():null;try{for(const t of n)if("requestWillFetch"in t){const n=t.requestWillFetch,a=e.clone();e=await n.call(t,{request:a,event:s})}}catch(e){throw new c("plugin-error-request-will-fetch",{thrownError:e})}const i=e.clone();try{let a;a="navigate"===e.mode?await fetch(e):await fetch(e,t);for(const e of n)"fetchDidSucceed"in e&&(a=await e.fetchDidSucceed.call(e,{event:s,request:i,response:a}));return a}catch(e){for(const t of a)await t.fetchDidFail.call(t,{error:e,event:s,originalRequest:r.clone(),request:i.clone()});throw e}};let m;async function g(e,t){const s=e.clone(),n={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},a=t?t(n):n,r=function(){if(void 0===m){const e=new Response("");if("body"in e)try{new Response(e.body),m=!0}catch(e){m=!1}m=!1}return m}()?s.body:await s.blob();return new Response(r,a)}function w(e){if(!e)throw new c("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:t,url:s}=e;if(!s)throw new c("add-to-cache-list-unexpected-type",{entry:e});if(!t){const e=new URL(s,location.href);return{cacheKey:e.href,url:e.href}}const n=new URL(s,location.href),a=new URL(s,location.href);return n.searchParams.set("__WB_REVISION__",t),{cacheKey:n.href,url:a.href}}class y{constructor(e){this._cacheName=a(e),this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map}addToCacheList(e){const t=[];for(const s of e){"string"==typeof s?t.push(s):s&&void 0===s.revision&&t.push(s.url);const{cacheKey:e,url:n}=w(s),a="string"!=typeof s&&s.revision?"reload":"default";if(this._urlsToCacheKeys.has(n)&&this._urlsToCacheKeys.get(n)!==e)throw new c("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(n),secondEntry:e});if("string"!=typeof s&&s.integrity){if(this._cacheKeysToIntegrities.has(e)&&this._cacheKeysToIntegrities.get(e)!==s.integrity)throw new c("add-to-cache-list-conflicting-integrities",{url:n});this._cacheKeysToIntegrities.set(e,s.integrity)}if(this._urlsToCacheKeys.set(n,e),this._urlsToCacheModes.set(n,a),t.length>0){const e=`Workbox is precaching URLs without revision info: ${t.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}async install({event:e,plugins:t}={}){const s=[],n=[],a=await self.caches.open(this._cacheName),r=await a.keys(),i=new Set(r.map((e=>e.url)));for(const[e,t]of this._urlsToCacheKeys)i.has(t)?n.push(e):s.push({cacheKey:t,url:e});const c=s.map((({cacheKey:s,url:n})=>{const a=this._cacheKeysToIntegrities.get(s),r=this._urlsToCacheModes.get(n);return this._addURLToCache({cacheKey:s,cacheMode:r,event:e,integrity:a,plugins:t,url:n})}));await Promise.all(c);return{updatedURLs:s.map((e=>e.url)),notUpdatedURLs:n}}async activate(){const e=await self.caches.open(this._cacheName),t=await e.keys(),s=new Set(this._urlsToCacheKeys.values()),n=[];for(const a of t)s.has(a.url)||(await e.delete(a),n.push(a.url));return{deletedURLs:n}}async _addURLToCache({cacheKey:e,url:t,cacheMode:s,event:n,plugins:a,integrity:r}){const i=new Request(t,{integrity:r,cache:s,credentials:"same-origin"});let o,h=await f({event:n,plugins:a,request:i});for(const e of a||[])"cacheWillUpdate"in e&&(o=e);if(!(o?await o.cacheWillUpdate({event:n,request:i,response:h}):h.status<400))throw new c("bad-precaching-response",{url:t,status:h.status});h.redirected&&(h=await g(h)),await d({event:n,plugins:a,response:h,request:e===t?i:new Request(e),cacheName:this._cacheName,matchOptions:{ignoreSearch:!0}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this._urlsToCacheKeys.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this._cacheName)).match(s)}}createHandler(e=!0){return async({request:t})=>{try{const e=await this.matchPrecache(t);if(e)return e;throw new c("missing-precache-entry",{cacheName:this._cacheName,url:t instanceof Request?t.url:t})}catch(s){if(e)return fetch(t);throw s}}}createHandlerBoundToURL(e,t=!0){if(!this.getCacheKeyForURL(e))throw new c("non-precached-url",{url:e});const s=this.createHandler(t),n=new Request(e);return()=>s({request:n})}}let x;const v=()=>(x||(x=new y),x);const R=(e,t)=>{const s=v().getURLsToCacheKeys();for(const n of function*(e,{ignoreURLParametersMatching:t,directoryIndex:s,cleanURLs:n,urlManipulation:a}={}){const r=new URL(e,location.href);r.hash="",yield r.href;const i=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(r,t);if(yield i.href,s&&i.pathname.endsWith("/")){const e=new URL(i.href);e.pathname+=s,yield e.href}if(n){const e=new URL(i.href);e.pathname+=".html",yield e.href}if(a){const e=a({url:r});for(const t of e)yield t.href}}(e,t)){const e=s.get(n);if(e)return e}};let q=!1;function U(e){q||((({ignoreURLParametersMatching:e=[/^utm_/],directoryIndex:t="index.html",cleanURLs:s=!0,urlManipulation:n}={})=>{const r=a();self.addEventListener("fetch",(a=>{const i=R(a.request.url,{cleanURLs:s,directoryIndex:t,ignoreURLParametersMatching:e,urlManipulation:n});if(!i)return;let c=self.caches.open(r).then((e=>e.match(i))).then((e=>e||fetch(i)));a.respondWith(c)}))})(e),q=!0)}const b=e=>{const s=v(),n=t.get();e.waitUntil(s.install({event:e,plugins:n}).catch((e=>{throw e})))},N=e=>{const t=v();e.waitUntil(t.activate())};try{self["workbox:routing:5.1.4"]&&_()}catch(e){}const T=e=>e&&"object"==typeof e?e:{handle:e};class E{constructor(e,t,s="GET"){this.handler=T(t),this.match=e,this.method=s}}class L extends E{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}class K{constructor(){this._routes=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map((e=>{"string"==typeof e&&(e=[e]);const t=new Request(...e);return this.handleRequest({request:t})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const{params:n,route:a}=this.findMatchingRoute({url:s,request:e,event:t});let r,i=a&&a.handler;if(!i&&this._defaultHandler&&(i=this._defaultHandler),i){try{r=i.handle({url:s,request:e,event:t,params:n})}catch(e){r=Promise.reject(e)}return r instanceof Promise&&this._catchHandler&&(r=r.catch((n=>this._catchHandler.handle({url:s,request:e,event:t})))),r}}findMatchingRoute({url:e,request:t,event:s}){const n=this._routes.get(t.method)||[];for(const a of n){let n;const r=a.match({url:e,request:t,event:s});if(r)return n=r,(Array.isArray(r)&&0===r.length||r.constructor===Object&&0===Object.keys(r).length||"boolean"==typeof r)&&(n=void 0),{route:a,params:n}}return{}}setDefaultHandler(e){this._defaultHandler=T(e)}setCatchHandler(e){this._catchHandler=T(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new c("unregister-route-but-not-found-with-method",{method:e.method});const t=this._routes.get(e.method).indexOf(e);if(!(t>-1))throw new c("unregister-route-route-not-registered");this._routes.get(e.method).splice(t,1)}}let O;const C=()=>(O||(O=new K,O.addFetchListener(),O.addCacheListener()),O);function j(e,t,s){let n;if("string"==typeof e){const a=new URL(e,location.href);n=new E((({url:e})=>e.href===a.href),t,s)}else if(e instanceof RegExp)n=new L(e,t,s);else if("function"==typeof e)n=new E(e,t,s);else{if(!(e instanceof E))throw new c("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});n=e}return C().registerRoute(n),n}try{self["workbox:strategies:5.1.4"]&&_()}catch(e){}class M{constructor(e={}){this._cacheName=r(e.cacheName),this._plugins=e.plugins||[],this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:t}){"string"==typeof t&&(t=new Request(t));let s,n=await p({cacheName:this._cacheName,request:t,event:e,matchOptions:this._matchOptions,plugins:this._plugins});if(!n)try{n=await this._getFromNetwork(t,e)}catch(e){s=e}if(!n)throw new c("no-response",{url:t.url,error:s});return n}async _getFromNetwork(e,t){const s=await f({request:e,event:t,fetchOptions:this._fetchOptions,plugins:this._plugins}),n=s.clone(),a=d({cacheName:this._cacheName,request:e,response:n,event:t,plugins:this._plugins});if(t)try{t.waitUntil(a)}catch(e){}return s}}const A={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};function k(e){e.then((()=>{}))}class S{constructor(e,t,{onupgradeneeded:s,onversionchange:n}={}){this._db=null,this._name=e,this._version=t,this._onupgradeneeded=s,this._onversionchange=n||(()=>this.close())}get db(){return this._db}async open(){if(!this._db)return this._db=await new Promise(((e,t)=>{let s=!1;setTimeout((()=>{s=!0,t(new Error("The open request was blocked and timed out"))}),this.OPEN_TIMEOUT);const n=indexedDB.open(this._name,this._version);n.onerror=()=>t(n.error),n.onupgradeneeded=e=>{s?(n.transaction.abort(),n.result.close()):"function"==typeof this._onupgradeneeded&&this._onupgradeneeded(e)},n.onsuccess=()=>{const t=n.result;s?t.close():(t.onversionchange=this._onversionchange.bind(this),e(t))}})),this}async getKey(e,t){return(await this.getAllKeys(e,t,1))[0]}async getAll(e,t,s){return await this.getAllMatching(e,{query:t,count:s})}async getAllKeys(e,t,s){return(await this.getAllMatching(e,{query:t,count:s,includeKeys:!0})).map((e=>e.key))}async getAllMatching(e,{index:t,query:s=null,direction:n="next",count:a,includeKeys:r=!1}={}){return await this.transaction([e],"readonly",((i,c)=>{const o=i.objectStore(e),h=t?o.index(t):o,l=[],u=h.openCursor(s,n);u.onsuccess=()=>{const e=u.result;e?(l.push(r?e:e.value),a&&l.length>=a?c(l):e.continue()):c(l)}}))}async transaction(e,t,s){return await this.open(),await new Promise(((n,a)=>{const r=this._db.transaction(e,t);r.onabort=()=>a(r.error),r.oncomplete=()=>n(),s(r,(e=>n(e)))}))}async _call(e,t,s,...n){return await this.transaction([t],s,((s,a)=>{const r=s.objectStore(t),i=r[e].apply(r,n);i.onsuccess=()=>a(i.result)}))}close(){this._db&&(this._db.close(),this._db=null)}}S.prototype.OPEN_TIMEOUT=2e3;const P={readonly:["get","count","getKey","getAll","getAllKeys"],readwrite:["add","put","clear","delete"]};for(const[e,t]of Object.entries(P))for(const s of t)s in IDBObjectStore.prototype&&(S.prototype[s]=async function(t,...n){return await this._call(s,t,e,...n)});try{self["workbox:expiration:5.1.4"]&&_()}catch(e){}const W="cache-entries",D=e=>{const t=new URL(e,location.href);return t.hash="",t.href};class I{constructor(e){this._cacheName=e,this._db=new S("workbox-expiration",1,{onupgradeneeded:e=>this._handleUpgrade(e)})}_handleUpgrade(e){const t=e.target.result.createObjectStore(W,{keyPath:"id"});t.createIndex("cacheName","cacheName",{unique:!1}),t.createIndex("timestamp","timestamp",{unique:!1}),(async e=>{await new Promise(((t,s)=>{const n=indexedDB.deleteDatabase(e);n.onerror=()=>{s(n.error)},n.onblocked=()=>{s(new Error("Delete blocked"))},n.onsuccess=()=>{t()}}))})(this._cacheName)}async setTimestamp(e,t){const s={url:e=D(e),timestamp:t,cacheName:this._cacheName,id:this._getId(e)};await this._db.put(W,s)}async getTimestamp(e){return(await this._db.get(W,this._getId(e))).timestamp}async expireEntries(e,t){const s=await this._db.transaction(W,"readwrite",((s,n)=>{const a=s.objectStore(W).index("timestamp").openCursor(null,"prev"),r=[];let i=0;a.onsuccess=()=>{const s=a.result;if(s){const n=s.value;n.cacheName===this._cacheName&&(e&&n.timestamp<e||t&&i>=t?r.push(s.value):i++),s.continue()}else n(r)}})),n=[];for(const e of s)await this._db.delete(W,e.id),n.push(e.url);return n}_getId(e){return this._cacheName+"|"+D(e)}}class F{constructor(e,t={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=t.maxEntries,this._maxAgeSeconds=t.maxAgeSeconds,this._cacheName=e,this._timestampModel=new I(e)}async expireEntries(){if(this._isRunning)return void(this._rerunRequested=!0);this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-1e3*this._maxAgeSeconds:0,t=await this._timestampModel.expireEntries(e,this._maxEntries),s=await self.caches.open(this._cacheName);for(const e of t)await s.delete(e);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,k(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){return await this._timestampModel.getTimestamp(e)<Date.now()-1e3*this._maxAgeSeconds}return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}class H{constructor(e={}){var t;this.cachedResponseWillBeUsed=async({event:e,request:t,cacheName:s,cachedResponse:n})=>{if(!n)return null;const a=this._isResponseDateFresh(n),r=this._getCacheExpiration(s);k(r.expireEntries());const i=r.updateTimestamp(t.url);if(e)try{e.waitUntil(i)}catch(e){}return a?n:null},this.cacheDidUpdate=async({cacheName:e,request:t})=>{const s=this._getCacheExpiration(e);await s.updateTimestamp(t.url),await s.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&(t=()=>this.deleteCacheAndMetadata(),o.add(t))}_getCacheExpiration(e){if(e===r())throw new c("expire-custom-caches-only");let t=this._cacheExpirations.get(e);return t||(t=new F(e,this._config),this._cacheExpirations.set(e,t)),t}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const t=this._getDateHeaderTimestamp(e);if(null===t)return!0;return t>=Date.now()-1e3*this._maxAgeSeconds}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const t=e.headers.get("date"),s=new Date(t).getTime();return isNaN(s)?null:s}async deleteCacheAndMetadata(){for(const[e,t]of this._cacheExpirations)await self.caches.delete(e),await t.delete();this._cacheExpirations=new Map}}const B=[];var $,G;$=[{"revision":"9cad1428791fcfdb5f613d557e778659","url":"index.html"},{"revision":"739fd689be0e75032af7e9c0fd2cc1d1","url":"css/bundle.css"},{"revision":"5718475f599effc2eeb21dcdce471a03","url":"js/bundle.js"}],G={},function(e){v().addToCacheList(e),e.length>0&&(self.addEventListener("install",b),self.addEventListener("activate",N))}($),U(G);const Q=["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.2.0/jspdf.umd.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.13/jspdf.plugin.autotable.min.js"],J=["./fonts/HelveticaUTF8.ttf","./fonts/abril-fatface-v12-latin-ext_latin-regular.woff2","./fonts/abril-fatface-v12-latin-ext_latin-regular.woff"],V=Q.concat(J);j(/.+\/(pdf\.min\.js|pdf\.worker\.min\.js|jspdf\..+min\.js|HelveticaUTF8\.ttf|abril-fatface-v12-latin-ext_latin-regular\.woff2?)$/,new M({cacheName:"flytax-warmup"})),j((({url:e})=>e.pathname.match(/\/data\/data[0-9]{4}\.json/)),new M({cacheName:"flytax-data",plugins:[new H({maxEntries:6})]})),j((({url:e})=>e.pathname.match(/\/flytax-icons\/.+\.png/)),new class{constructor(e={}){if(this._cacheName=r(e.cacheName),this._plugins=e.plugins||[],e.plugins){const t=e.plugins.some((e=>!!e.cacheWillUpdate));this._plugins=t?e.plugins:[A,...e.plugins]}else this._plugins=[A];this._fetchOptions=e.fetchOptions,this._matchOptions=e.matchOptions}async handle({event:e,request:t}){"string"==typeof t&&(t=new Request(t));const s=this._getFromNetwork({request:t,event:e});let n,a=await p({cacheName:this._cacheName,request:t,event:e,matchOptions:this._matchOptions,plugins:this._plugins});if(a){if(e)try{e.waitUntil(s)}catch(n){}}else try{a=await s}catch(e){n=e}if(!a)throw new c("no-response",{url:t.url,error:n});return a}async _getFromNetwork({request:e,event:t}){const s=await f({request:e,event:t,fetchOptions:this._fetchOptions,plugins:this._plugins}),n=d({cacheName:this._cacheName,request:e,response:s.clone(),event:t,plugins:this._plugins});if(t)try{t.waitUntil(n)}catch(e){}return s}}({cacheName:"flytax-icons",plugins:[new H({maxEntries:20})]}));self.addEventListener("install",(e=>{e.waitUntil(caches.open("flytax-warmup").then((e=>function(e,t=[],s=[]){if(!(e instanceof Cache&&Array.isArray(t)&&Array.isArray(s)))return Promise.reject();let n=[];return Promise.all(t.map((function(t){return caches.match(t).then((function(s){return s?e.put(t,s):(n.push(t),Promise.resolve())}))}))).then((function(){return e.addAll(n.concat(s))}))}(e,V))))}));const z=e=>B.includes(e),X=e=>{if(-1!==Q.indexOf(e.url))return!1;for(const t of J)if(t.startsWith("http")){if(e.url===t)return!1}else if(-1!==e.url.indexOf(t.replace(/^\./,"")))return!1;return!0};self.addEventListener("activate",(function(e){e.waitUntil(caches.keys().then((function(e){return e.filter(z).map((e=>caches.delete(e)))})).then((()=>caches.open("flytax-warmup"))).then((function(e){return e.keys().then((function(t){return Promise.all(t.filter(X).map((t=>e.delete(t))))}))})).then((()=>self.clients.claim())))})),self.addEventListener("message",(e=>{"SKIP_WAITING"===e.data&&self.skipWaiting()}))}();
//# sourceMappingURL=sw.js.map
