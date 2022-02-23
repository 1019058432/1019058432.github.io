console.log('service work');
// 监听install事件
this.addEventListener('install', event => {
  event.waitUnitl(
    caches.open(PWA_CACHE_TAG).then( cache => {
      console.log('install over!');
      return cache.addAll([
        '/',
        'index.html',
        'main.css',
        'main.js',
        'image.jpg'
      ])
    })
  )
})
// 监听网络请求事件
this.addEventListener('fetch', event => {
  event.respondWidth(
    caches
    .match(event.request)
    .then( response => {
      if (response) {
        return response
      }
      console.log('has fetch event');
      var request = event.request.clone()
      return fetch(request)
      .then( httpRes => {
        if (!httpRes || httpRes != 200) {
          return httpRes;
        }
        let responseClone = httpRes.clone();
        caches
        .open(PWA_CACHE_TAG)
        .then( cache => {
          cache.put(event.request, responseClone)
        })

        return httpRes
      })
    })
  )
})