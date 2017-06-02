/* global eventList, moment, weekView, Materialize */

$('#create-event').on('click', () => {
	let form = $('#editevent form')[0];
	form.elements.date1.value = moment().format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment().add(1, 'hours').format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = '';
	$('#delete-event, #export-event').addClass('disabled');
	$('#editevent').modal('open');
});

$('#create-event-ok').on('click', (event) => {
	let form = $('#editevent form')[0];
	if (!form.checkValidity()) {
		alert('Не вірно заповнені поля');
		event.preventDefault();
		event.stopImmediatePropagation();
	} else {
		if (form.elements.id && form.elements.id.value) {
			eventList.updateEvent({
				id: form.elements.id.value,
				begin: moment(form.elements.date1.value),
				end: moment(form.elements.date2.value),
				desc: form.elements.desc.value,
			});
		} else {
			eventList.addEvent({
				begin: moment(form.elements.date1.value),
				end: moment(form.elements.date2.value),
				desc: form.elements.desc.value,
			});
		}
		weekView.renderWeekEvents();
		weekView.renderLongWeekEvents();
	}
});

$('#delete-event').on('click', () => {
	let form = $('#editevent form')[0];
	if (form.elements.id && form.elements.id.value) {
		eventList.deleteEvent(form.elements.id.value);
		weekView.renderWeekEvents();
		weekView.renderLongWeekEvents();
	}
});

$('#export-event').on('click', () => {
	let form = $('#editevent form')[0];
	eventList.getEvent(form.elements.id.value).exportEvent();
});

$('#week-placeholder').on('click', '.event, .long-event', function() {
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

function selectWeek(date) {
	let baseDate = moment(date).startOf('week');
	weekView.setBaseDate(baseDate);
	weekView.renderGrid();
	weekView.renderWeekEvents();
	weekView.renderLongWeekEvents();
}

$('.left-week-button').on('click', () => {
	if (viewMode === 'week') {
		weekView.moveBaseDate(-7);
	} else {
		if (viewMode === 'day') {
			weekView.moveBaseDate(-1);
		}
	}
	weekView.renderGrid();
	weekView.renderWeekEvents();
	weekView.renderLongWeekEvents();
});

$('.right-week-button').on('click', () => {
	if (viewMode === 'week') {
		weekView.moveBaseDate(7);
	} else {
		if (viewMode === 'day') {
			weekView.moveBaseDate(1);
		}
	}
	weekView.renderGrid();
	weekView.renderWeekEvents();
	weekView.renderLongWeekEvents();
});

/*******************************************/
/* Створення подій через “малювання” мишею */

let $timeSelector;
let timeSelectorTime1, timeSelectorTime2;
let timeSelectorActiveShort = false;
let timeSelectorActiveLong = false;
let firstDay, lastDay;

// Почати виділення
$('#week-placeholder').on('mousedown', '.day-col, .day-full', function (event) {

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
			weekView.updateFullDaySelection(firstDay, lastDay);
		}

	}
});

// Виділення діапазону при переміщенні вказівника миші
$('#week-placeholder').on('mousemove', '.s-events .day-col, .l-events .day-full', function (event) {

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
			weekView.updateFullDaySelection(firstDay, lastDay);
		}

	}

});

// Коли кнопку миші відпустили - закінчити виділення та створити подію
$('body').on('mouseup', function (event) {

	if (timeSelectorActiveShort) {

		timeSelectorActiveShort = false;
		let form = $('#editevent form')[0];
		// let selectedDay = moment(weekView.getBaseDate()).add($(this).data('index'), 'days');

		// Визначити, котрий час більший, а котрий менший, та забезпечити мінімальний діапазон 0.5 години
		let t1 = Math.min(timeSelectorTime1, timeSelectorTime2);
		let t2 = Math.max(timeSelectorTime1, timeSelectorTime2) + 0.5;

		let day = moment(weekView.getBaseDate()).add(firstDay, 'days');

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
		form.elements.date1.value = moment(weekView.getBaseDate()).add(d1, 'days').format('YYYY-MM-DDTHH:mm');

		// Сформувати час закінчення події
		form.elements.date2.value = moment(weekView.getBaseDate()).add(d2, 'days').set({hour: 23, minute: 59}).format('YYYY-MM-DDTHH:mm');

		form.elements.desc.value = '';
		form.elements.id.value = '';

		// Відкрити вікно створення події
		$('#delete-event, #export-event').addClass('disabled');
		$('#editevent').modal('open');
	}
});

/*******************************************/

$('.scale .btn').on('click', function() {

	$('.scale .btn').removeClass('selected');

	viewMode = $(this).data('period');
	switch (viewMode) {
		case 'day':
			weekView.setDaysCount(1);
			break;
		case 'week':
			weekView.setBaseDate( moment(weekView.getBaseDate()).startOf('week') );
			weekView.setDaysCount(7);
			break;
	}

	$(this).addClass('selected');

});