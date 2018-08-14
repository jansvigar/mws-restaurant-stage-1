/**
 * Define cache version to allow service worker update in the future
 */
var CACHE_NAME = 'restaurant-reviews-cache-v1'

/**
 * Add fetch event listener to intercept fetch request
 */
self.addEventListener('fetch', (evt) => {
    evt.respondWith(
        /** If the request is in the cache */
        caches.match(evt.request)
            .then(response => {
                /** return the cached response */
                if(response) return response;

                /** clone request object because it's a stream */
                const fetchRequest = evt.request.clone();
                /** fetch the request */
                return fetch(fetchRequest).then(response => {
                    /** if the request is not successful, just return the response without caching */
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    /** clone the response */
                    var responseToCache = response.clone();

                    /** cache the response */
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(evt.request, responseToCache);
                        });

                    return response;
                });
            })
    )
});

/**
 * add activate event listener to delete old cache
 */
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        /** Loop through the caches and delete old cache version */
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if(cacheName !== CACHE_NAME)
                        return caches.delete(cacheName);
                })
            );
        })
    );
});