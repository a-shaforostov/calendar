/* global eventList, moment, week */

$('#create-event').on('click', () => {
	let form = $('#editevent form')[0];
	form.elements.date1.value = moment().format('YYYY-MM-DDTHH:mm');
	form.elements.date2.value = moment().add(1, 'hours').format('YYYY-MM-DDTHH:mm');
	form.elements.desc.value = '';
	$('#editevent').modal('open');
});

$('#create-event-ok').on('click', (event) => {
	let form = $('#editevent form')[0];
	if (!form.checkValidity()) {
		alert('Не вірно заповнені поля');
		event.preventDefault();
		event.stopImmediatePropagation();
	} else {
		eventList.addEvent({
			begin: form.elements.date1.value,
			end: form.elements.date2.value,
			desc: form.elements.desc.value,
		});
		week.renderWeekEvents();
	}
});
