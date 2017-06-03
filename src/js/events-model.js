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
		event.beginText = event.begin.format('HH:mm');
		event.endText = event.end.format('HH:mm');
		event.id = this.eventIdCounter;
		this.events[this.eventIdCounter] = event;

		// Збереження в localStorage
		localStorage.setItem('event-' + event.id, JSON.stringify(event));

		// Нотифікация
		let timediff = moment.duration(moment(begin).diff(moment(new Date())));
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
		event.beginText = event.begin.format('HH:mm');
		event.end = end;
		event.endText = event.end.format('HH:mm');
		event.desc = desc;
		if (event.timer) clearTimeout(event.timer);

		// Збереження в localStorage
		localStorage.setItem('event-' + id, JSON.stringify(event));

		// Нотифікация
		let timediff = moment.duration(moment(begin).diff(moment(new Date())));
		if (timediff > 0) {
			event.timer = setTimeout(function () {
				showNotification('Починається подія ', {body: desc, icon: 'images/alarm-clock.png'});
			}, timediff);
		}
	}

	loadEvents(){
		// Завантажити події local storage
		let loadedEvents = [];
		let lsKeys = Object.keys(localStorage);
		lsKeys.forEach((keyName) => {
			// Події збережені з префіксом event-
			if (keyName.substr(0, 6) === 'event-') {
				let event = JSON.parse(localStorage.getItem(keyName));
				// Додаємо подію в масив
				loadedEvents.push(event);
				// Видаляємо подію зі сховища та створюємо ії в колекції (для оновлення id)
				localStorage.removeItem(keyName);
			}
		});
		// Сформувати події з переприсвоєнням індексів
		loadedEvents.forEach((event) => {
			this.addEvent(event);
		});
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

	// Повернути короткі події за день, сортування за зростанням часу початку
	getEventsByDay(date, all) {
		let eventsByDate = {};
		$.each(this.events, (index, item) => {
			if (
				// Всі події за вказану дату
				(all && moment(date).isBetween(item.begin, item.end, 'day', '[]')) ||
				// Тільки одноденні
				(moment(date).isSame(item.begin, 'day') && moment(date).isSame(item.end, 'day')) ) {
				eventsByDate[index] = item;
			}
		});
		return _.sortBy(eventsByDate, ['begin', 'end', 'desc']);
	}

	// Повернути довгі події що зачіпають тиждень, сортування за зростанням дати початку
	getEventsOfWeek(date, daysCount) {
		let startOfWeek = _.cloneDeep(date);
		let endOfWeek = _.cloneDeep(date);
		endOfWeek.add(daysCount-1, 'days');

		let eventsOfWeek = {};
		$.each(this.events, (index, item) => {
			let beginFits = moment(item.begin).isSameOrBefore(endOfWeek, 'day');
			let endFits = moment(item.end).isSameOrAfter(startOfWeek, 'day');
			let datesIsSame = item.begin.isSame(item.end, 'day');
			if (!datesIsSame && beginFits && endFits) {
				eventsOfWeek[index] = item;
			}
		});
		return _.sortBy(eventsOfWeek, ['begin', 'end', 'desc']);
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


