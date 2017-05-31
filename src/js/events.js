/* global moment, _, Handlebars, WeekView */
moment.locale('uk');

class Event {

	constructor(begin, end, desc) {
		this.begin = moment(begin);
		this.end = moment(end);
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
		// Якщо кінець періода припадає на початок доби - зменшити період на хвилину
		if (moment(end).format('HHmmss') === '000000') end = moment(end).subtract(1, 'minute');
		let event = new Event(begin, end, desc);
		event.id = this.eventIdCounter;
		this.events[this.eventIdCounter] = event;

		// Збереження в localStorage
		localStorage.setItem('event-' + event.id, JSON.stringify(event));

		// Нотифікация
		let timediff = moment(moment(begin).diff(moment(new Date())));
		if (timediff > 0) {
			event.timer = setTimeout(function () {
				showNotification('Починається подія ', {body: desc, icon: '../images/alarm-clock.png'});
			}, timediff);
		}
		return this.eventIdCounter++;
	}

	updateEvent({id, begin, end, desc}) {
		if (moment(end).format('HHmmss') === '000000') end = moment(end).subtract(1, 'minute');
		let event = this.events[id];
		event.begin = begin;
		event.end = end;
		event.desc = desc;
		if (event.timer) clearTimeout(event.timer);

		// Збереження в localStorage
		localStorage.setItem('event-' + id, JSON.stringify(event));

		// Нотифікация
		let timediff = moment(moment(begin).diff(moment(new Date())));
		if (timediff > 0) {
			event.timer = setTimeout(function () {
				showNotification('Починається подія ', {body: desc, icon: 'images/alarm-clock.png'});
			}, timediff);
		}
	}

	getEvent(id) {
		return this.events[id];
	}

	deleteEvent(id) {
		// Видалення з localStorage
		localStorage.removeItem('event-' + id, JSON.stringify(event));
		// Очищення таймера
		if (this.events[id].timer) clearTimeout(this.events[id].timer);
		// Видалення з колекції
		delete this.events[id];
	}

	getEventsByDay(date) {
		let eventsByDate = {};
		$.each(this.events, (index, item) => {
			if (moment(date).isSame(item.begin, 'day') && moment(date).isSame(item.end, 'day')) {
				eventsByDate[index] = item;
			}
		});
		return _.sortBy(eventsByDate, 'begin');
	}

}

// Завантажити події local storage
let eventList = new EventsList();
for (let i = 0; i < localStorage.length; i++) {
	let keyName = localStorage.key(i);
	if (keyName.substr(0, 6) === 'event-') {
		let event = JSON.parse(localStorage.getItem(keyName));
		// Видаляємо подію зі сховища та створюємо ії в колекції (для оновлення id)
		localStorage.removeItem(keyName);
		eventList.addEvent(event);
	}
}

// test
// let events = [
// 	{
// 		begin: moment([2017, 4, 27, 12, 25]),
// 		end: moment([2017, 4, 27, 14, 45]),
// 		desc: 'Обед',
// 	},
// 	{
// 		begin: moment([2017, 4, 27, 12, 20]),
// 		end: moment([2017, 4, 27, 13, 30]),
// 		desc: 'Встреча',
// 	},
// 	{
// 		begin: moment([2017, 4, 27, 9, 10]),
// 		end: moment([2017, 4, 27, 11, 40]),
// 		desc: 'Автобус',
// 	},
// 	{
// 		begin: moment([2017, 4, 27, 14, 15]),
// 		end: moment([2017, 4, 27, 15, 10]),
// 		desc: 'Собеседование',
// 	},
// 	{
// 		begin: moment([2017, 4, 28, 12, 25]),
// 		end: moment([2017, 4, 28, 14, 45]),
// 		desc: 'Обед',
// 	},
// 	{
// 		begin: moment([2017, 4, 28, 12, 20]),
// 		end: moment([2017, 4, 28, 13, 30]),
// 		desc: 'Встреча',
// 	},
// 	{
// 		begin: moment([2017, 4, 29, 9, 10]),
// 		end: moment([2017, 4, 29, 11, 40]),
// 		desc: 'Автобус',
// 	},
// 	{
// 		begin: moment([2017, 4, 29, 14, 15]),
// 		end: moment([2017, 4, 29, 15, 10]),
// 		desc: 'Собеседование',
// 	},
// ];
//
// events.forEach( (item) => {
// 	eventList.addEvent(item);
// });

let weekView = new WeekView(moment().startOf('week'));
weekView.renderGrid();
weekView.renderWeekEvents();

