const CACHE_NAME = 'app-cache-v11';
const STATIC_ASSETS = [
    './manifest.json',
    './assets/img/logo192.png',
    './assets/img/logo512.png',
    './assets/img/logo2880.png',
    './index.html',
    './favicon.ico',
    './robots.txt',
    './sitemap.xml',
    './assets/img/imagem1.webp',
    './assets/img/imagem2.webp',
    './assets/img/imagem3.webp',
    './assets/img/img0.webp',
    './assets/img/img1.webp',
    './assets/img/img2.webp',
    './assets/img/img3.webp',
    './assets/img/js1.webp',
    './assets/img/js2.webp',
    './assets/img/js3.webp',
    './assets/img/config.webp',
    './assets/img/f.webp',
    './assets/img/ss.webp',
    './assets/css/w3.css',
    './assets/js/App.js',
    './assets/js/router.js',
    './assets/js/PWAInstaller.js',
    './assets/js/componentes/card.js',
    './assets/js/componentes/formContato.js',
    './assets/js/componentes/navbar.js',
    './assets/js/componentes/slides.js',
    './assets/js/componentes/Modal.js',
    './assets/js/componentes/slides/slideImages.js',
    './assets/js/componentes/slides/slideControls.js',
    './assets/js/api/FetchData.js',
    './assets/json/postagens.json',
    './assets/js/paginas/home.js',
    './assets/js/paginas/sobre.js',
    './assets/js/paginas/contato.js',
    './assets/js/paginas/extra.js',
    './assets/i18n/en.json',
    './assets/i18n/es.json',
    './assets/i18n/pt.json',
    './assets/js/libs/I18nService.js',
    './assets/js/libs/LocalStorageService.js',
    './assets/js/paginas/Configuracoes.js',
    './assets/json/slides.json',
    './assets/js/componentes/floatingButton.js',
    './assets/img/notifica.webp',
    './assets/img/imagem1-small.webp',
    './assets/img/imagem1-medium.webp',
    './assets/img/imagem1-large.webp',
    './assets/img/imagem2-small.webp',
    './assets/img/imagem2-medium.webp',
    './assets/img/imagem2-large.webp',
    './assets/img/imagem3-small.webp',
    './assets/img/imagem3-medium.webp',
    './assets/img/imagem3-large.webp',
    './assets/js/Atualizacoes.js',
    './assets/json/atualizacoes.json'
];
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; 
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); 
          }
        })
      );
    })
  );
});


const recursos = [
  './assets/json/postagens.json',
  './assets/json/slides.json',
  './assets/i18n/en.json',
  './assets/i18n/es.json',
  './assets/i18n/pt.json',
  './assets/json/atualizacoes.json',
  // 'api/atualizacao.php' 
];
self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(CACHE_NAME).then(async cache => {
          try {
              await cache.addAll(STATIC_ASSETS);
              const fetchPromises = recursos.map(url => fetch(url));
              const responses = await Promise.allSettled(fetchPromises);

              const falhaurl = [];

              for (let i = 0; i < responses.length; i++) {
                  const response = responses[i];
                  if (response.status === 'fulfilled' && response.value.ok) {
                      await cache.put(recursos[i], response.value);
                  } else {
                      falhaurl.push(recursos[i]);
                  }
              }

              if (falhaurl.length > 0) {
                  console.error('Erro durante o cache.addAll: ', falhaurl);
              }
                } catch (error) {
                    console.error("Erro durante o cache.addAll: ", error);
                    throw error;
                }
      })
  );
});
  
self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
              return cachedResponse;
          }
          return fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                  return caches.open(CACHE_NAME).then(cache => {
                      cache.put(event.request, networkResponse.clone());
                      return networkResponse;
                  });
              }
              return caches.match('offline.html'); 
          }).catch(() => {
              return caches.match('offline.html'); 
          });
      }).catch(() => {
          return caches.match('offline.html'); 
      })
  );
}); 
 

// self.addEventListener('fetch', function(event) {
//   if (event.request.url.includes('/novidades')) {
//     event.respondWith(
//       fetch('api/atualizacao.php')
//         .then(function(response) {
//           return response.json();
//         })
//         .then(function(data) {
//           const ultimaModificacao = data.ultimaModificacao;
//           clients.matchAll().then(clients => {
//             clients.forEach(client => {
//               client.postMessage({ultimaModificacao: ultimaModificacao});
//             });
//           });
//           return caches.match(event.request);
//         })
//     );
//   }
// });


self.addEventListener('message', event => {
  if (event.data.action === 'checkForUpdates') {
    fetch('./assets/json/atualizacoes.json')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        const ultimaModificacao = data.ultimaModificacao;
        clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_AVAILABLE',
              ultimaModificacao: ultimaModificacao
            });
          });
        });
      })
      .catch(function(error) {
        console.error('Erro ao buscar atualizações:', error);
      });
  }
});


// self.addEventListener('message', event => {
//   if (event.data.action === 'notifyAllClients') {
//       self.clients.matchAll().then(clients => {
//           clients.forEach(client => {
//               client.postMessage({
//                   action: 'showNotification',
//                   message: 'Notificação personalizada ativada!'
//               });
//           });
//       });
//   }
// });

self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon
  });
});

  