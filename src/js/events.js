/* global moment, _, Handlebars, WeekView */
moment.locale('uk');

class Event {

	constructor(begin, end, desc) {
		this.begin = begin;
		this.end = end;
		this.desc = desc;
	}

	exportEvent() {
		let filename = this.desc.replace(/[|&;$%@"<>()+,]/g, "").substr(0, 50);
		var cal = ics();
		cal.addEvent(this.desc, '', '', this.begin, this.end);
		cal.download(filename);
	}

}

class EventsList {

	constructor() {
		this.eventIdCounter = 1;
		this.events = {};
	}

	addEvent({begin, end, desc}) {
		// debugger;
		let event = new Event(begin, end, desc);
		event.id = this.eventIdCounter;
		this.events[this.eventIdCounter] = event;
		return this.eventIdCounter++;
	}

	updateEvent({id, begin, end, desc}) {
		let event = this.events[id];
		event.begin = begin;
		event.end = end;
		event.desc = desc;
	}

	getEvent(id) {
		return this.events[id];
	}

	deleteEvent(id) {
		delete this.events[id];
	}

	getEventsByDay(date) {
		let eventsByDate = {};
		$.each(this.events, (index, item) => {
			if (moment(date).isSame(item.begin, 'day') && moment(date).isSame(item.end, 'day')) {
				eventsByDate[index] = item;
			}
		});
		// console.log(eventsByDate);
		// console.log(_.find(_.sortBy(eventsByDate, 'begin'), events[2]));
		return _.sortBy(eventsByDate, 'begin');
	}

	arrangeDayEvents(plainArray) {
		// debugger;
		if (!plainArray.length) return plainArray;
		let array3d = [[{width: 1, event: plainArray[0]}]];
		// Пройти всі події
		for (let item = 1; item < plainArray.length; item++) {
			let found = false;
			// Шукати місце в кожній колонці
			for (let i = 0; i < array3d.length; i++) {
				let plane = array3d[i];
				let lastItem = plane.slice(-1)[0];
				if (moment(plainArray[item].begin).isSameOrAfter(lastItem.event.end)) {
					// Якщо знайшли місце в колонці - додату подію в колонку
					plane.push({width: 1, event: plainArray[item]});
						array3d[i].slice(-1)[0].width++;
					found = true;
					break;
				}
			}
			// Якщо в існуючій колонці місця не знайшлося - створити нову колонку
			if (!found) {
				array3d.push([{width: 1, event: plainArray[item]}]);
				array3d.slice(-1)[0].slice(-1)[0].width++;
			}

		}
		return array3d;
	}
}


// test
let eventList = new EventsList();
let events = [
	{
		begin: moment([2017, 4, 27, 12, 25]),
		end: moment([2017, 4, 27, 14, 45]),
		desc: 'Обед',
	},
	{
		begin: moment([2017, 4, 27, 12, 20]),
		end: moment([2017, 4, 27, 13, 30]),
		desc: 'Встреча',
	},
	{
		begin: moment([2017, 4, 27, 9, 10]),
		end: moment([2017, 4, 27, 11, 40]),
		desc: 'Автобус',
	},
	{
		begin: moment([2017, 4, 27, 14, 15]),
		end: moment([2017, 4, 27, 15, 10]),
		desc: 'Собеседование',
	},
	{
		begin: moment([2017, 4, 28, 12, 25]),
		end: moment([2017, 4, 28, 14, 45]),
		desc: 'Обед',
	},
	{
		begin: moment([2017, 4, 28, 12, 20]),
		end: moment([2017, 4, 28, 13, 30]),
		desc: 'Встреча',
	},
	{
		begin: moment([2017, 4, 29, 9, 10]),
		end: moment([2017, 4, 29, 11, 40]),
		desc: 'Автобус',
	},
	{
		begin: moment([2017, 4, 29, 14, 15]),
		end: moment([2017, 4, 29, 15, 10]),
		desc: 'Собеседование',
	},
];

events.forEach( (item) => {
	eventList.addEvent(item);
});

let weekView = new WeekView(moment().startOf('week'));
weekView.renderGrid();
weekView.renderWeekEvents();

