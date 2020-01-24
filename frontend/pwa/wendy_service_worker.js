// wendy service-worker

//console.log('Hello from wendy service-worker');

var CACHE = 'wendy-cache-and-update';

self.addEventListener('install', (evt) => {
  console.log('INFO008: The Wendy service worker is being installed!');
  evt.waitUntil(precache().then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', (evt) => {
  console.log('INFO015: The Wendy service worker is being activated!');
  evt.waitUntil(self.clients.claim());
});

let ignoreRequests = new RegExp('(' + [
  '/quantumcom\/(.*)',
  '/yellow_counter'].join('(\/?)|\\') + ')$');

self.addEventListener('fetch', (evt) => {
  //console.log('INFO020: The Wendy service worker is serving the asset:', evt.request.url);
  if (ignoreRequests.test(event.request.url)) {
    console.log('ignored: ', event.request.url)
    // request will be networked
    fetch(request)
    .then( (resp) => {
      return resp;
    }).catch( () => {
      console.log("Error network when fetching uncachable resource ...")
    });
    return
  }
  //evt.respondWith(fromCache(evt.request)
  //evt.respondWith(cacheOrNetwork(evt.request)
  evt.respondWith(networkOrCache(evt.request)
  //evt.respondWith(networkTimeoutOrCache(evt.request, 400)
  .catch(function () {
    console.log('INFO026: Fallback of fallback for: ', evt.request.url);
    return useFallback();
  }));
  evt.waitUntil(update(evt.request));
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    console.log('INFO034: Preloading the app-shell in cache');
    return cache.addAll([
      '/',
      '/index.html',
      '/wendy_favicon.svg',
      '/manifest.json',
      '/wendy_favicon_64x64.png',
      '/wendy_favicon_256x256.png',
      '/wendy_service_worker.js',
      '/css/wendy_style.css',
      '/js/wendy_app.js',
      '/crochet_1.png',
      '/crochet_2.png',
      '/wendy_1.png',
      '/wendy_2.png',
      '/wendy_3.png',
      '/wendy_4.png',
      '/wendy_5.png',
      '/wendy_6.png',
      '/wendy_7.png',
      '/wendy_8.png',
      '/wendy_9.png',
      '/wendy_10.png',
      '/wendy_11.png',
      '/wendy_12.png'
    ]);
  });
}

function networkOrCache(request) {
  return fetch(request)
  .then(function (response) {
    if (response.ok) {
      //console.log('INFO063: File from network: ', request.url);
      return response;
    } else {
      //console.log('INFO066: File from cache because network.nok: ', request.url);
      return fromCache(request);
    }
  })
  .catch(function () {
    //console.log('INFO071: File from cache because network error: ', request.url);
    return fromCache(request);
  });
}

function networkTimeoutOrCache(request, timeout) {
  return fromNetworkTimeout(request, timeout)
  .then(function (response) {
    if (response.ok) {
      //console.log('INFO080: File from network: ', request.url);
      return response;
    } else {
      //console.log('INFO083: File from cache because network.nok: ', request.url);
      return fromCache(request);
    }
  })
  .catch(function () {
    //console.log('INFO088: File from cache because network error: ', request.url);
    return fromCache(request);
  });
}

function cacheOrNetwork(request) {
  return fromCache(request)
  .then(function (response) {
    //console.log('INFO096: File from cache: ', request.url);
    return response;
  })
  .catch(function (error) {
    //console.log('INFO100: Error by searching in cache: ', error)
    //console.log('INFO101: File not in cache, fallback to network: ', request.url);
    return fetch(request);
  });
}

function fromNetworkTimeout(request, timeout) {
  return new Promise(function (fulfill, reject) {
    var timeoutId = setTimeout(reject, timeout);
    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      //console.log('INFO111: From networkTimeout: ', request.url);
      fulfill(response);
    }, reject);
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      //console.log('INFO120: From cache: ', request.url);
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      //console.log('INFO129: Update cache: ', request.url);
      return cache.put(request, response);
    });
  });
}

var FALLBACK =
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180" stroke-linejoin="round">' +
    '  <path stroke="#DDD" stroke-width="25" d="M99,18 15,162H183z"/>' +
    '  <path stroke-width="17" fill="#FFF" d="M99,18 15,162H183z" stroke="#eee"/>' +
    '  <path d="M91,70a9,9 0 0,1 18,0l-5,50a4,4 0 0,1-8,0z" fill="#aaa"/>' +
    '  <circle cy="138" r="9" cx="100" fill="#aaa"/>' +
    '</svg>';

function useFallback() {
  console.log('INFO144: Response with the final fallback');
  return Promise.resolve(new Response(FALLBACK, { headers: {
    'Content-Type': 'image/svg+xml'
  }}));
}


