importScripts('/cache-polyfill.js');

self.addEventListener('install', function(event) {
	// При встановленні робітника закешувати файли, що не завантажуються при відкритті сторінки
	event.waitUntil(
		caches.open('calendar').then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				'/images/alarm-clock.png',
				'/js/controller.js',
				'/js/events.js',
				'/js/hbs-helpers.js',
				'/js/notifications.js',
				'/js/view.js',
				'/style/core.css',
				'/vendors/handlebars-v4.0.10.js',
				'/vendors/ics.min.js',
				'/vendors/jquery-3.2.1.min.js',
				'/vendors/lodash.min.js',
				'/vendors/moment-with-locales.min.js',
				'/vendors/datetimepicker/jquery.datetimepicker.full.min.js',
				'/vendors/datetimepicker/jquery.datetimepicker.min.css',
				'/vendors/materialize-v0.98.2/css/materialize.min.css',
				'/vendors/materialize-v0.98.2/js/materialize.min.js',
			]);
		})
	);
});


self.addEventListener('fetch', function(event) {

	console.log(event.request.url);

	event.respondWith(

		caches.match(event.request).then(function(response) {

			return response || fetch(event.request);

		})

	);

});