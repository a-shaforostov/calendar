/* global eventList, moment, weekView, Materialize */

$('#create-event').on('click', () => {
	let form = $('#editevent form')[0];
	form.elements.date1.value = moment().format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment().add(1, 'hours').format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = '';
	$('#delete-event').addClass('disabled');
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

$('#week-placeholder').on('click', '.event', function() {
	let eventId = $(this).data('id');
	let event = eventList.getEvent(eventId);
	let form = $('#editevent form')[0];
	form.elements.date1.value = moment(event.begin).format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment(event.end).format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = event.desc;
	form.elements.id.value = event.id;
	$('#delete-event').removeClass('disabled');
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
