'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global moment, _, Handlebars, WeekView */
moment.locale('uk');

var Event = function Event(begin, end, desc) {
	_classCallCheck(this, Event);

	this.begin = begin;
	this.end = end;
	this.desc = desc;
};

var EventsList = function () {
	function EventsList() {
		_classCallCheck(this, EventsList);

		this.eventIdCounter = 1;
		this.events = {};
	}

	_createClass(EventsList, [{
		key: 'addEvent',
		value: function addEvent(_ref) {
			var begin = _ref.begin,
			    end = _ref.end,
			    desc = _ref.desc;

			// debugger;
			var event = new Event(begin, end, desc);
			this.events[this.eventIdCounter] = event;
			return this.eventIdCounter++;
		}
	}, {
		key: 'getEvent',
		value: function getEvent(id) {
			return this.events[id];
		}
	}, {
		key: 'deleteEvent',
		value: function deleteEvent(id) {
			delete this.events[id];
		}
	}, {
		key: 'getEventsByDay',
		value: function getEventsByDay(date) {
			var eventsByDate = {};
			$.each(this.events, function (index, item) {
				if (moment(date).isSame(item.begin, 'day') && moment(date).isSame(item.end, 'day')) {
					eventsByDate[index] = item;
				}
			});
			// console.log(eventsByDate);
			// console.log(_.find(_.sortBy(eventsByDate, 'begin'), events[2]));
			return _.sortBy(eventsByDate, 'begin');
		}
	}, {
		key: 'arrangeDayEvents',
		value: function arrangeDayEvents(plainArray) {
			// debugger;
			if (!plainArray.length) return plainArray;
			var array3d = [[{ width: 1, event: plainArray[0] }]];
			// Пройти всі події
			for (var item = 1; item < plainArray.length; item++) {
				var found = false;
				// Шукати місце в кожній колонці
				for (var i = 0; i < array3d.length; i++) {
					var plane = array3d[i];
					var lastItem = plane.slice(-1)[0];
					if (moment(plainArray[item].begin).isSameOrAfter(lastItem.event.end)) {
						// Якщо знайшли місце в колонці - додату подію в колонку
						plane.push({ width: 1, event: plainArray[item] });
						array3d[i].slice(-1)[0].width++;
						found = true;
						break;
					}
				}
				// Якщо в існуючій колонці місця не знайшлося - створити нову колонку
				if (!found) {
					array3d.push([{ width: 1, event: plainArray[item] }]);
					array3d.slice(-1)[0].slice(-1)[0].width++;
				}
			}
			return array3d;
		}
	}]);

	return EventsList;
}();

// test


var eventList = new EventsList();
var events = [{
	begin: moment([2017, 4, 27, 12, 25]),
	end: moment([2017, 4, 27, 14, 45]),
	desc: 'Обед'
}, {
	begin: moment([2017, 4, 27, 12, 20]),
	end: moment([2017, 4, 27, 13, 30]),
	desc: 'Встреча'
}, {
	begin: moment([2017, 4, 27, 9, 10]),
	end: moment([2017, 4, 27, 11, 40]),
	desc: 'Автобус'
}, {
	begin: moment([2017, 4, 27, 14, 15]),
	end: moment([2017, 4, 27, 15, 10]),
	desc: 'Собеседование'
}, {
	begin: moment([2017, 4, 28, 12, 25]),
	end: moment([2017, 4, 28, 14, 45]),
	desc: 'Обед'
}, {
	begin: moment([2017, 4, 28, 12, 20]),
	end: moment([2017, 4, 28, 13, 30]),
	desc: 'Встреча'
}, {
	begin: moment([2017, 4, 29, 9, 10]),
	end: moment([2017, 4, 29, 11, 40]),
	desc: 'Автобус'
}, {
	begin: moment([2017, 4, 29, 14, 15]),
	end: moment([2017, 4, 29, 15, 10]),
	desc: 'Собеседование'
}];

events.forEach(function (item) {
	eventList.addEvent(item);
});

var week = new WeekView(moment().startOf('week'));
week.renderGrid();
week.renderWeekEvents();