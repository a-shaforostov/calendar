let showNotification = function(text, options) {

	// Перевірка підтримки
	if (!('Notification' in window)) {

		alert('This browser does not support desktop notification');

	} else {

		// Перевірка дозволу
		if (Notification.permission === 'granted') {

			// Створюємо повідомлення
			new Notification(text, options);

		} else {

			// Запитуємо дозвіл
			if (Notification.permission !== 'denied') {
				Notification.requestPermission(function(permission) {
					// Створюємо повідомлення
					if (permission === 'granted') {
						new Notification(text, options);
					}
				});
			}

		}

	}
};

Notification.requestPermission();
