/* global moment, _, eventList, Handlebars, WeekView */

class WeekView {

	constructor(baseDate) {
		this.baseDate = baseDate;
	}

	renderDayEvents(date) {

		let data = eventList.arrangeDayEvents( eventList.getEventsByDay(date) );
		for (let i = 0; i < data.length; i++) {
			for (let j = 0; j < data[i].length; j++) {
				let elem = $('<div class="event"></div>');
				let topMin =
					(moment(data[i][j].event.begin).hour() * 60 + moment(data[i][j].event.begin).minute()) *
					$('.grid-table tbody').height() / (24*60);
				let bottomMin =
					(moment(data[i][j].event.end).hour() * 60 + moment(data[i][j].event.end).minute()) *
					$('.grid-table tbody').height() / (24*60);
				elem
					.css({
						top: topMin + 'px',
						height: (bottomMin - topMin) + 'px',
						left: (100 / (data[i][j].width) / 2 * i) + '%', // 50*i + 'px',
						width: Math.min((100 / data[i][j].width) + (100 / (data[i][j].width) / 2), 100) + '%',
					})
					.html(
						'<span class="time">' + moment(data[i][j].event.begin).format('HH:mm') + ' - ' +
						moment(data[i][j].event.end).format('HH:mm') + '</span><br>' +
						data[i][j].event.desc
					);

				$( $('tbody .day-col .day')[moment(date).weekday()] ).append(elem);
			}
		}

	}

	renderWeekEvents() {
		let currentDay = _.cloneDeep(this.baseDate);
		for (let days = 0; days < 7; days++) {
			this.renderDayEvents(currentDay);
			currentDay.add(1, 'days');
		}
	}

	renderGrid() {
		let $place = $('#week-placeholder');
		let source = document.getElementById('week-template').innerHTML;
		let template = Handlebars.compile(source);
		let currentDay = _.cloneDeep(this.baseDate);
		let days = [
			currentDay.format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
			currentDay.add(1, 'days').format('dd, DD MMM'),
		];
		// console.log(days);
		$place.html(template({days}));

		$('tbody .day-col .day').height( $('.grid-table tbody').height() );
	}
}

$('#editevent').modal();

$.datetimepicker.setLocale('uk');
$('.date-picker-inline').datetimepicker({
	format: 'd.m.Y',
	inline: true,
	lang: 'uk',
	timepicker: false,
	defaultDate: new Date(),
});

// $('.datepicker').pickadate({
// 	selectMonths: true, // Creates a dropdown to control month
// 	selectYears: 15 // Creates a dropdown of 15 years to control year
// });
