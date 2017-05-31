importScripts('/cache-polyfill.js');

self.addEventListener('install', function(e) {
	// При встановленні робітника закешувати файли, що не завантажуються при відкритті сторінки
	e.waitUntil(
		caches.open('calendar').then(function(cache) {
			return cache.addAll([
				'/images/alarm-clock.png',
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {

	// Стратегія кешування: при отриманні ресурсу додати його в кеш, якщо він ще не закешований
	// Це дозволяє сформувати кеш автоматично не перелічуючі всі файли та не відстежуючи зміни в них
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response) {
				return response;
			} else {

				// Кешувати тільки файлі з джерел http та https.
				// Інші, наприклад, chrome-extension:// будуть ігноруватися
			  	if (/^https?:\/\//.test(event.request.url)) {
					console.log('caching', event.request.url);
					caches.open('calendar').then(function (cache) {
						cache.add(event.request);
					});
				} else {
					console.log('skip', event.request.url);
				}

				return fetch(event.request);
			}
		})
	);
});