class MonthView {

	constructor(baseDate) {
		this.baseDate = baseDate;
	}

	setBaseDate(baseDate) {
		this.baseDate = baseDate;
	}

	getBaseDate() {
		return this.baseDate;
	}

	renderView() {
		let $place = $('#month-placeholder');
		let source = document.getElementById('month-template').innerHTML;
		let template = Handlebars.compile(source);
		let firstDay = moment().set({year: this.baseDate.year(), month: this.baseDate.month(), date: 1});
		let firstDayOfWeek = firstDay.weekday();
		let totalDays = firstDay.daysInMonth();
		let days = [];
		let wi = 0;
		let di = 0;
		let currentDay = moment(firstDay).subtract(firstDayOfWeek, 'day');
		let totalWeeks = Math.ceil((totalDays+firstDayOfWeek) / 7);
		let counter = totalWeeks * 7;
		for (let i = 1; i <= counter; i++) {
			if (!days[wi]) days[wi] = new Array(7).fill(null);
			let events = eventList.getEventsByDay(currentDay, true);
			days[wi][di] = {
				day: currentDay.get('date'),
				eventCount: Math.max(events.length - 2, 0),
				alien: currentDay.get('month') !== this.baseDate.get('month'),
				dateText: currentDay.format('YYYY-MM-DDTHH:mm'),
				events
			};
			if (di++ === 6) {
				di = 0;
				wi++;
			}
			currentDay.add(1, 'day');
		}
		let daysOfWeek = ['понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота', 'неділя'];
		console.log(days);


		$place.html(template({days, daysOfWeek}));

		let text = moment(this.baseDate).format('MMMM YYYY');
		$('.header .nav-block .week-number').text(text);
	}

}

