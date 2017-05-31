/* global moment, _, eventList, Handlebars, WeekView, selectWeek */

class WeekView {

	constructor(baseDate) {
		this.baseDate = baseDate;
	}

	setBaseDate(baseDate) {
		this.baseDate = baseDate;
	}

	getBaseDate(baseDate) {
		return this.baseDate;
	}

	moveBaseDate(addition) {
		this.baseDate = moment(this.baseDate).add(addition, 'days');
	}

	arrangeDayEvents(plainArray) {

		if (!plainArray.length) return plainArray;
		let array2d = [[{event: plainArray[0]}]];

		// Пройти всі події і сформувати двовимірний масив подій
		for (let item = 1; item < plainArray.length; item++) {
			let found = false;
			// Шукати місце в кожній колонці
			for (let i = 0; i < array2d.length; i++) {
				let plane = array2d[i];
				let lastItem = plane.slice(-1)[0];
				if (moment(plainArray[item].begin).isSameOrAfter(lastItem.event.end)) {
					// Якщо знайшли місце в колонці - додату подію в колонку
					plane.push({event: plainArray[item]});
					found = true;
					break;
				}
			}
			// Якщо в існуючій колонці місця не знайшлося - створити нову колонку
			if (!found) {
				array2d.push([{event: plainArray[item]}]);
			}

		}

		// Знайти максимальну довжину вкладеного масиву
		let maxLen = 0;
		for (let i = 0; i < array2d.length; i++) {
			if (array2d[i].length > maxLen) maxLen = array2d[i].length;
		}

		// Двічі обходимо матрицю та попарно порівнюємо події для того, щоб визначити глибину вкладеності
		// кожної групи подій, що перекриваються. Глибину зберігаємо в поле depth
		// Воно буде використовуватися для визначення лівої межі та ширини картки події
		let i = 0;
		while (i < maxLen) {
			let level = array2d.length-1;
			while (level >= 0) {
				if (array2d[level][i]) {
					// Якщо для поточної події рівень ще не встановлений - встановити його
					if (!array2d[level][i].depth) array2d[level][i].depth = level + 1;
					let _i = 0;
					while (_i < maxLen) {
						let _level = array2d.length - 2;
						while (_level >= 0) {
							// Якщо події перекриваються, та рівень ще не встановлений, то встановити його
							if (array2d[_level][_i] && !array2d[_level][_i].depth &&
								moment(array2d[level][i].event.begin).isBetween(
									array2d[_level][_i].event.begin,
									array2d[_level][_i].event.end, null, '[]') &&
								moment(array2d[_level][_i].event.begin).isBetween(
									array2d[level][i].event.begin,
									array2d[level][i].event.end, null, '[]')
							)
								array2d[_level][_i].depth = array2d[level][i].depth;
							_level--;
						}
						_i++;
					}
				}
				level--;
			}
			i++;
		}

		// console.log('array2d', array2d);
		return array2d;
	}

	renderDayEvents(date) {

		let dayElement = $('tbody .day-col .day')[moment(date).weekday()];
		$(dayElement).html('');
		let data = this.arrangeDayEvents( eventList.getEventsByDay(date) );
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
						top: Math.floor(topMin-1) + 'px',
						height: Math.ceil(bottomMin - topMin) + 'px',
						left: (100 / (data[i][j].depth) * i) + '%', // 50*i + 'px',
						// width: Math.min((90 / data[i][j].depth) + (90 / (data[i][j].depth) / 2), 90) + '%',
						width: (100 / data[i][j].depth) + '%',
					})
					.html(
						'<span class="time">' + moment(data[i][j].event.begin).format('HH:mm') + ' - ' +
						moment(data[i][j].event.end).format('HH:mm') + '</span><br>' +
						data[i][j].event.desc
					)
					.data('id', data[i][j].event.id);

				$(dayElement).append(elem);
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
		let days = [];
		for (let i = 0; i < 7; i++) {
			days.push(currentDay.format('dd, DD MMM'));
			currentDay.add(1, 'days');
		}
		$place.html(template({days}));

		$('tbody .day-col .day').height( $('.grid-table tbody').height() );
		$('.header .nav-block .week-number').text(moment(this.baseDate).week());
	}
}

$('#editevent').modal({
	complete: () => {
		if ($timeSelector) $timeSelector.remove();
	}
});

$.datetimepicker.setLocale('uk');
$('.date-picker-inline').datetimepicker({
	format: 'd.m.Y',
	inline: true,
	lang: 'uk',
	timepicker: false,
	defaultDate: new Date(),
	dayOfWeekStart: 1,
	onSelectDate: function(ct) {
		selectWeek(ct);
	},
});
