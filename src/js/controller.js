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
				begin: form.elements.date1.value,
				end: form.elements.date2.value,
				desc: form.elements.desc.value,
			});
		} else {
			eventList.addEvent({
				begin: form.elements.date1.value,
				end: form.elements.date2.value,
				desc: form.elements.desc.value,
			});
		}
		weekView.renderWeekEvents();
	}
});

$('#delete-event').on('click', () => {
	let form = $('#editevent form')[0];
	if (form.elements.id && form.elements.id.value) {
		eventList.deleteEvent(form.elements.id.value);
		weekView.renderWeekEvents();
	}
});

$('#export-event').on('click', () => {
	let form = $('#editevent form')[0];
	eventList.getEvent(form.elements.id.value).exportEvent();
});

$('#week-placeholder').on('click', '.event', function() {
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
}

$('.left-week-button').on('click', () => {
	weekView.moveBaseDate(-7);
	weekView.renderGrid();
	weekView.renderWeekEvents();
});

$('.right-week-button').on('click', () => {
	weekView.moveBaseDate(7);
	weekView.renderGrid();
	weekView.renderWeekEvents();
});

/*******************************************/
/* Створення подій через “малювання” мишею */

let $timeSelector;
let timeSelectorTime1, timeSelectorTime2;

// Почати виділення
$('#week-placeholder').on('mousedown', '.day-col', function (event) {

	// Не продовжувати, якщо клік по блоку події
	if ($(event.target).hasClass('event')) return;

	// Відстежувати переміщення якщо натиснута ліва кнопка миші
	if (event.buttons === 1) {

		// Визначити координату міши відносно колонки дня
		let yCoord = event.clientY - $(this).offset().top + $(window).scrollTop();

		// Визначити час, що відповідає позиції миші
		timeSelectorTime1 = timeSelectorTime2 = Math.floor(yCoord / $(this).height() * 24 * 2) / 2;

		// Створити блок вибору діапазону часу
		if ($timeSelector) $timeSelector.remove();
		$timeSelector = $('<div>');
		$(this).append($timeSelector);
		$timeSelector.css({
			top: timeSelectorTime1 * $(this).height() / 24,
			height: 0.5 * $(this).height() / 24,
		}).addClass('time-selector');

	}
});

// Виділення діапазону при переміщенні вказівника миші
$('#week-placeholder').on('mousemove', '.day-col', function (event) {

	// Відстежувати переміщення якщо натиснута ліва кнопка миші
	if (event.buttons === 1) {

		// Визначити координату міши відносно колонки дня
		let yCoord = event.clientY - $(this).offset().top + $(window).scrollTop();

		// Визначити час, що відповідає позиції миші
		timeSelectorTime2 = Math.floor(yCoord / $(this).height() * 24 * 2) / 2;

		// Визначити діапазон, але не менше 0.5 години
		let t1 = Math.min(timeSelectorTime1, timeSelectorTime2);
		let t2 = Math.max(timeSelectorTime1, timeSelectorTime2);
		let delta = t2 - t1 + 0.5;

		// Оновити позицію блока виділення
		$timeSelector.css({
			top: t1 * $(this).height() / 24,
			height: delta * $(this).height() / 24,
		});

	}

});

// Коли кнопку миші відпустили - закінчити виділення та створити подію
$('#week-placeholder').on('mouseup', '.day-col', function (event) {

	let form = $('#editevent form')[0];
	let selectedDay = moment(weekView.getBaseDate()).add($(this).data('index'), 'days');

	// Визначити, котрий час більший, а котрий менший, та забезпечити мінімальний діапазон 0.5 години
	let t1 = Math.min(timeSelectorTime1, timeSelectorTime2);
	let t2 = Math.max(timeSelectorTime1, timeSelectorTime2)+0.5;

	// Сформувати час початку події
	let hr = Math.round(t1);
	let min = (t1 - hr) * 60;
	form.elements.date1.value = selectedDay.hour(hr).minute(min).format('YYYY-MM-DDTHH:mm');

	// Сформувати час закінчення події
	hr = Math.round(t2);
	min = (t2 - hr) * 60;
	form.elements.date2.value = selectedDay.hour(hr).minute(min).format('YYYY-MM-DDTHH:mm');

	form.elements.desc.value = '';

	// Відкрити вікно створення події
	$('#delete-event, #export-event').addClass('disabled');
	$('#editevent').modal('open');

});

/*******************************************/
