'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global moment, _, eventList, Handlebars, WeekView */

var WeekView = function () {
	function WeekView(baseDate) {
		_classCallCheck(this, WeekView);

		this.baseDate = baseDate;
	}

	_createClass(WeekView, [{
		key: 'renderDayEvents',
		value: function renderDayEvents(date) {

			var data = eventList.arrangeDayEvents(eventList.getEventsByDay(date));
			for (var i = 0; i < data.length; i++) {
				for (var j = 0; j < data[i].length; j++) {
					var elem = $('<div class="event"></div>');
					var topMin = (moment(data[i][j].event.begin).hour() * 60 + moment(data[i][j].event.begin).minute()) * $('.grid-table tbody').height() / (24 * 60);
					var bottomMin = (moment(data[i][j].event.end).hour() * 60 + moment(data[i][j].event.end).minute()) * $('.grid-table tbody').height() / (24 * 60);
					elem.css({
						top: topMin + 'px',
						height: bottomMin - topMin + 'px',
						left: 100 / data[i][j].width / 2 * i + '%', // 50*i + 'px',
						width: Math.min(100 / data[i][j].width + 100 / data[i][j].width / 2, 100) + '%'
					}).html('<span class="time">' + moment(data[i][j].event.begin).format('HH:mm') + ' - ' + moment(data[i][j].event.end).format('HH:mm') + '</span><br>' + data[i][j].event.desc);

					$($('tbody .day-col .day')[moment(date).weekday()]).append(elem);
				}
			}
		}
	}, {
		key: 'renderWeekEvents',
		value: function renderWeekEvents() {
			var currentDay = _.cloneDeep(this.baseDate);
			for (var days = 0; days < 7; days++) {
				this.renderDayEvents(currentDay);
				currentDay.add(1, 'days');
			}
		}
	}, {
		key: 'renderGrid',
		value: function renderGrid() {
			var $place = $('#week-placeholder');
			var source = document.getElementById('week-template').innerHTML;
			var template = Handlebars.compile(source);
			var currentDay = _.cloneDeep(this.baseDate);
			var days = [currentDay.format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM'), currentDay.add(1, 'days').format('dd, DD MMM')];
			// console.log(days);
			$place.html(template({ days: days }));

			$('tbody .day-col .day').height($('.grid-table tbody').height());
		}
	}]);

	return WeekView;
}();

$('#editevent').modal();

$.datetimepicker.setLocale('uk');
$('.date-picker-inline').datetimepicker({
	format: 'd.m.Y',
	inline: true,
	lang: 'uk',
	timepicker: false,
	defaultDate: new Date()
});

// $('.datepicker').pickadate({
// 	selectMonths: true, // Creates a dropdown to control month
// 	selectYears: 15 // Creates a dropdown of 15 years to control year
// });