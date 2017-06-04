/* global eventList, moment, weekView, Materialize, EventsList, DayView, MonthView, YearView */
/* eslint-disable no-invalid-this */

// Доступні періоди 'day', 'week', 'month', 'year';

/* ІНІЦІАЛІЗАЦІЯ */

moment.locale('uk');

// Модальне вікно редагування події
$('#editevent').modal({
	complete: () => {
		if ($timeSelector) $timeSelector.remove();
		$('.day-full').removeClass('selected-day');
	},
});

// Ініціалізуємо тиждень
let viewMode = 'week';

// Створити список подій і завантажити події
let eventList = new EventsList();
eventList.loadEvents();

// Створити представлення
let view = new DayView(moment().startOf('week'), 7);
view.renderView();


/* РЕЄСТРАЦІЯ ОБРОБНИКІВ ПОДІЙ */

// Натиснута кнопка створення події
$('#create-event').on('click', () => {
	let form = $('#editevent form')[0];
	form.elements.id.value = '';
	form.elements.date1.value = moment().format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment().add(1, 'hours').format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = '';
	$('#delete-event, #export-event').addClass('disabled');
	$('#editevent').modal('open');
});

// Натиснута кнопка "створити" в модальному вікні редагування події
$('#create-event-ok').on('click', (event) => {
	let form = $('#editevent form')[0];

	// Валідація
	if (!form.checkValidity() || moment(form.elements.date1.value).isAfter(form.elements.date2.value)) {

		alert('Не вірно заповнені поля');
		event.preventDefault();
		event.stopImmediatePropagation();

	} else {

		if (form.elements.id && form.elements.id.value) {
			// Змінити подію
			eventList.updateEvent({
				id: form.elements.id.value,
				begin: moment(form.elements.date1.value),
				end: moment(form.elements.date2.value),
				desc: form.elements.desc.value,
			});
		} else {
			// Створити подію
			eventList.addEvent({
				begin: moment(form.elements.date1.value),
				end: moment(form.elements.date2.value),
				desc: form.elements.desc.value,
			});
		}

		// Оновити представлення
		view.renderView();
	}
});

// Натиснута кнопка видалення події
$('#delete-event').on('click', () => {
	let form = $('#editevent form')[0];
	if (form.elements.id && form.elements.id.value) {
		eventList.deleteEvent(form.elements.id.value);
		view.renderView();
	}
});

// Натиснута кнопка збереження в файл
$('#export-event').on('click', () => {
	let form = $('#editevent form')[0];
	eventList.getEvent(form.elements.id.value).exportEvent();
});

// Клік по події ініціює редагування події
let selector = '#month-placeholder .event-item, #week-placeholder .event, #week-placeholder .long-event';
$('body').on('click', selector, function() {
	let eventId = $(this).data('id');
	let event = eventList.getEvent(eventId);
	let form = $('#editevent form')[0];
	form.elements.date1.value = moment(event.begin).format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment(event.end).format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = event.desc;
	form.elements.id.value = event.id;
	$('#delete-event, #export-event').removeClass('disabled');
	$('#editevent').modal('open');
	Materialize.updateTextFields();
});

// Клік по полю дати на місячному календарі - створити нову подію за обраний день
$('#month-placeholder').on('click', '.day-block', function(event) {
	if ($(event.target).hasClass('day-block') || $(event.target).hasClass('day-wrapper')) {
		let date = $(this).find('.date-number a').data('date');
		let form = $('#editevent form')[0];
		form.elements.id.value = '';
		form.elements.date1.value = moment(date).set({hour: 0, minute: 0}).format('YYYY-MM-DDTHH:mm');
		form.elements.date2.value = moment(date).set({hour: 23, minute: 59}).format('YYYY-MM-DDTHH:mm');
		form.elements.desc.value = '';
		$('#delete-event, #export-event').addClass('disabled');
		$('#editevent').modal('open');
	}
});

// Обрати тиждень
function selectWeek(date) {
	let baseDate = moment(date).startOf('week');
	view.setBaseDate(baseDate);
	view.renderView();
}

// Натиснута кнопка зміни періода (попередній період)
$('.prev-period-button').on('click', () => {
	if (viewMode === 'week') {
		view.moveBaseDate(-7);
	} else {
		if (viewMode === 'day') {
			view.moveBaseDate(-1);
		} else {
			if (viewMode === 'month') {
				view.setBaseDate(moment(view.getBaseDate()).subtract(1, 'month'));
			} else {
				if (viewMode === 'year') {
					view.setBaseDate(moment(view.getBaseDate()).subtract(1, 'year'));
				}
			}
		}
	}
	view.renderView();
});

// Натиснута кнопка зміни періода (наступиий період)
$('.next-period-button').on('click', () => {
	if (viewMode === 'week') {
		view.moveBaseDate(7);
	} else {
		if (viewMode === 'day') {
			view.moveBaseDate(1);
		} else {
			if (viewMode === 'month') {
				view.setBaseDate(moment(view.getBaseDate()).add(1, 'month'));
			} else {
				if (viewMode === 'year') {
					view.setBaseDate(moment(view.getBaseDate()).add(1, 'year'));
				}
			}
		}
	}
	view.renderView();
});

// Натиснуто на дату на місячному або на річному календарі - перейти в режим дня
$('#month-placeholder, #year-placeholder').on('click', '.date-number a', function(event) {
	event.preventDefault();

	let date = $(this).data('date');

	$('.scale .btn').removeClass('selected');
	$('.view-content').html('');

	viewMode = 'day';
	view = new DayView(moment(date), 1);
	view.renderView();

	$('.scale .btn[data-period="day"]').addClass('selected');

});

/* ----------------------------------------- */
/* Створення подій через “малювання” мишею  */

let $timeSelector;
let timeSelectorTime1;
let timeSelectorTime2;
let timeSelectorActiveShort = false;
let timeSelectorActiveLong = false;
let firstDay;
let lastDay;

// Почати виділення
$('#week-placeholder').on('mousedown', '.day-col, .day-full', function(event) {

	// Не продовжувати, якщо клік по блоку події
	if ($(event.target).hasClass('event') || $(event.target).closest('.event').length) return;

	// Відстежувати переміщення якщо натиснута ліва кнопка миші
	if (event.buttons === 1) {

		if ($(this).hasClass('day-col')) {
			// Для коротких подій

			timeSelectorActiveShort = true;

			// Визначити координату міши відносно колонки дня
			let yCoord = event.clientY - $(this).offset().top + $(window).scrollTop();

			// Визначити час, що відповідає позиції миші
			timeSelectorTime1 = timeSelectorTime2 = Math.floor(yCoord / $(this).height() * 24 * 2) / 2;

			// Визначити день
			firstDay = $(this).data('index');

			// Створити блок вибору діапазону часу
			if ($timeSelector) $timeSelector.remove();
			$timeSelector = $('<div>');
			$(this).append($timeSelector);
			$timeSelector.css({
				top: timeSelectorTime1 * $(this).height() / 24,
				height: 0.5 * $(this).height() / 24,
			}).addClass('time-selector');

		} else {
			// Для довгих подій

			timeSelectorActiveLong = true;
			firstDay = lastDay = $(this).data('day-index');
			view.updateFullDaySelection(firstDay, lastDay);
		}

	}
});

// Виділення діапазону при переміщенні вказівника миші
$('#week-placeholder').on('mousemove', '.s-events .day-col, .l-events .day-full', function(event) {

	// Відстежувати переміщення якщо натиснута ліва кнопка миші
	if (event.buttons === 1) {

		if ($(this).hasClass('day-col') && timeSelectorActiveShort) {

			// Визначити координату міши відносно колонки дня
			let yCoord = event.clientY - $(this).offset().top + $(window).scrollTop();

			// Визначити час, що відповідає позиції миші
			timeSelectorTime2 = Math.floor(yCoord / $(this).height() * 24 * 2) / 2;

			// Визначити діапазон, але не менше 0.5 години
			let t1 = Math.min(timeSelectorTime1, timeSelectorTime2);
			let t2 = Math.max(timeSelectorTime1, timeSelectorTime2);
			let delta = t2 - t1 + 0.5;

			// Оновити позицію блока виділення
			if ($timeSelector) {
				$timeSelector.css({
					top: t1 * $(this).height() / 24,
					height: delta * $(this).height() / 24,
				});
			}

		}

		if ($(this).hasClass('day-full') && timeSelectorActiveLong) {
			let dayIndex = $(this).data('day-index');
			if (dayIndex) lastDay = dayIndex;
			view.updateFullDaySelection(firstDay, lastDay);
		}

	}

});

// Коли кнопку миші відпустили - закінчити виділення та створити подію
$('body').on('mouseup', () => {

	if (timeSelectorActiveShort) {

		timeSelectorActiveShort = false;
		let form = $('#editevent form')[0];
		// let selectedDay = moment(view.getBaseDate()).add($(this).data('index'), 'days');

		// Визначити, котрий час більший, а котрий менший, та забезпечити мінімальний діапазон 0.5 години
		let t1 = Math.min(timeSelectorTime1, timeSelectorTime2);
		let t2 = Math.max(timeSelectorTime1, timeSelectorTime2) + 0.5;

		let day = moment(view.getBaseDate()).add(firstDay, 'days');

		// Сформувати час початку події
		let hr = Math.round(t1);
		let min = (t1 - hr) * 60;
		form.elements.date1.value = day.set({hour: hr, minute: min}).format('YYYY-MM-DDTHH:mm');

		// Сформувати час закінчення події
		hr = Math.round(t2);
		min = (t2 - hr) * 60;
		form.elements.date2.value = day.set({hour: hr, minute: min}).format('YYYY-MM-DDTHH:mm');

		form.elements.desc.value = '';
		form.elements.id.value = '';

		// Відкрити вікно створення події
		$('#delete-event, #export-event').addClass('disabled');
		$('#editevent').modal('open');
	}

	if (timeSelectorActiveLong) {

		timeSelectorActiveLong = false;
		let form = $('#editevent form')[0];

		// Визначити, котрий день більший, а котрий менший
		let d1 = Math.min(firstDay, lastDay);
		let d2 = Math.max(firstDay, lastDay);

		// Сформувати час початку події
		form.elements.date1.value = moment(view.getBaseDate()).add(d1, 'days').format('YYYY-MM-DDTHH:mm');

		// Сформувати час закінчення події
		form.elements.date2.value =
			moment(view.getBaseDate()).add(d2, 'days').set({hour: 23, minute: 59}).format('YYYY-MM-DDTHH:mm');

		form.elements.desc.value = '';
		form.elements.id.value = '';

		// Відкрити вікно створення події
		$('#delete-event, #export-event').addClass('disabled');
		$('#editevent').modal('open');
	}
});
/* ----------------------------------------- */

// Натиснуто кнопку вибору періоду
$('.scale .btn').on('click', function() {

	$('.scale .btn').removeClass('selected');
	$('.view-content').html('');

	viewMode = $(this).data('period');
	switch (viewMode) {
		case 'day':
			view = new DayView(view.getBaseDate(), 1);
			break;
		case 'week':
			view = new DayView(view.getBaseDate().startOf('week'), 7);
			break;
		case 'month':
			view = new MonthView(view.getBaseDate());
			break;
		case 'year':
			view = new YearView(view.getBaseDate());
			break;
	}
	view.renderView();

	$(this).addClass('selected');

});

// При зміні розміру вікна оновити довгі події бо вони позиціоновані абсолютно
$(window).on('resize', () => {
	if (['day', 'week'].indexOf(viewMode) !== -1) view.renderLongEvents();
});

// Вимкнути відправку форми
$('form').on('submit', (e) => e.preventDefault());
