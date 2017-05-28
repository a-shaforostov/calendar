/* global notifyMe */
let notifyMe = function(text) {

	// Проверка поддерживаемости браузером уведомлений
	if (!('Notification' in window)) {

		alert('This browser does not support desktop notification');

	} else {

		// Проверка разрешения на отправку уведомлений
		if (Notification.permission === 'granted') {

			// Если разрешено то создаем уведомление
			new Notification(text);

		} else {

			// В противном случает мы запрашиваем разрешение
			if (Notification.permission !== 'denied') {
				Notification.requestPermission(function(permission) {
					// Если пользователь разрешил, то создаем уведомление
					if (permission === 'granted') {
						new Notification(text);
					}
				});
			}

		}

	}
};

Notification.requestPermission();
