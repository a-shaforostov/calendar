// Стратегія кешування:
// При встановленні робітника кешуються всі необхідні для роботи сторінки файли
// При кожному запиті обробник намагається отримати дані і з сервера, і з кешу
// Якщо дані з сервера отримані, відповідь не помилка та джерело http або https, то дані в кеші оновлюються
// Обробник повертає відповідь з того джерела, яке надало відповідь, але сервер має вищій за кеш пріоритет,
// це дозволяє мати найсвіжішу версію файлу, але може працювати в offline

importScripts('/cache-polyfill.js');

self.addEventListener('install', function(event) {
	// При встановленні робітника закешувати файли, що не завантажуються при відкритті сторінки
	// Щоб всі необхідні файли закешувалися вже при першому відкритті сторінки - кешуємо все
	event.waitUntil(
		caches.open('calendar').then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				'/images/alarm-clock.png',
				'/js/hbs-helpers.js',
				'/js/notifications.js',
				'/js/controller.js',
				'/js/events-model.js',
				'/js/custom-view.js',
				'/js/day-view.js',
				'/js/month-view.js',
				'/js/year-view.js',
				'/style/core.css',
				'/vendors/handlebars-v4.0.10.js',
				'/vendors/ics.min.js',
				'/vendors/jquery-3.2.1.min.js',
				'/vendors/lodash.min.js',
				'/vendors/moment-with-locales.min.js',
				'/vendors/materialize-v0.98.2/css/materialize.min.css',
				'/vendors/materialize-v0.98.2/js/materialize.min.js',
			]);
		})
	);
});


self.addEventListener('fetch', function(event) {

	event.respondWith(

		Promise.any([
			fetch(event.request.clone())
				.then((response) => {

					let _response = response.clone();

					if (response.status < 400) {
						caches.open('calendar')
							.then(function (cache) {
								if (/^https?:\/\//.test(event.request.url)) {
									cache.put(event.request, _response);
								}
							});
					}

					return response;

				}),
			caches.match(event.request)
				.then(function(response) {

					if (response) {
						return response;
					} else {
						throw new Error('Помилка');
					}

				}),

		]).then((resolve) => {
			// Відповідь від сервера має вищий пріоритет за кешовану версію
			return resolve[0] || resolve[1];
		})
	);

});

// Допоміжна функція, що резолвиться, якщо розрезолвився хоча б один проміс з наданих їй
Promise.any = function(arrayOfPromises) {
	// For each promise that resolves or rejects,
	// make them all resolve.
	// Record which ones did resolve or reject
	var resolvingPromises = arrayOfPromises.map(function(promise) {
		return promise.then(function(result) {
			return {
				resolve: true,
				result: result
			};
		}, function(error) {
			return {
				resolve: false,
				result: error
			};
		});
	});

	return Promise.all(resolvingPromises).then(function(results) {
		// Count how many passed/failed
		var passed = [], failed = [], allFailed = true;
		results.forEach(function(result) {
			if(result.resolve) {
				allFailed = false;
			}
			passed.push(result.resolve ? result.result : null);
			failed.push(result.resolve ? null : result.result);
		});

		if(allFailed) {
			throw failed;
		} else {
			return passed;
		}
	});
};