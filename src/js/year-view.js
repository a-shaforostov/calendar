/* global moment, eventList, Handlebars */

class YearView {

	constructor(baseDate) {
		this.baseDate = baseDate;
		this.stateHolidays = [
			'2017-01-01',
			'2017-01-02',
			'2017-01-07',
			'2017-01-09',
			'2017-03-08',
			'2017-04-16',
			'2017-04-17',
			'2017-04-16',
			'2017-05-01',
			'2017-05-01',
			'2017-06-04',
			'2017-06-05',
			'2017-06-28',
			'2017-08-24',
			'2017-10-14',
			'2017-10-16',
		];
	}

	setBaseDate(baseDate) {
		this.baseDate = baseDate;
	}

	getBaseDate() {
		return this.baseDate;
	}

	renderView() {
		let $place = $('#year-placeholder');
		let source = document.getElementById('year-template').innerHTML;
		let template = Handlebars.compile(source);


		let months = [];
		for (let currentMonth = 0; currentMonth < 12; currentMonth++) {
			let firstDay = moment().set({year: this.baseDate.year(), month: currentMonth, date: 1});
			let firstDayOfWeek = firstDay.weekday();
			let totalDays = firstDay.daysInMonth();
			let days = [];
			let wi = 0;
			let di = firstDayOfWeek;
			let currentDay = moment(firstDay);
			let isStateHoliday = this.stateHolidays.indexOf(currentDay.format('YYYY-MM-DD')) !== -1;
			for (let i = 0; i <= totalDays-1; i++) {
				if (!days[wi]) days[wi] = new Array(7).fill(null);
				let events = eventList.getEventsByDay(currentDay, true);
				days[wi][di] = {
					day: currentDay.get('date'),
					events: events.length,
					dateText: currentDay.format('YYYY-MM-DDTHH:mm'),
					holiday: [5, 6].indexOf(di) !== -1 || isStateHoliday,
				};
				if (di++ === 6) {
					di = 0;
					wi++;
				}
				currentDay.add(1, 'day');
			}
			months.push({
				days,
				monthName: firstDay.format('MMMM'),
			});
		}

		let daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'];


		$place.html(template({months, daysOfWeek}));

		let text = moment(this.baseDate).format('YYYY');
		$('.header .nav-block .week-number').text(text);
	}
}
