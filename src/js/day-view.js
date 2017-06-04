/* global moment, _, eventList, Handlebars, selectWeek, viewMode */

class DayView {

	constructor(baseDate) {
		this.baseDate = baseDate;
		this.daysCount = 7;
	}

	setBaseDate(baseDate) {
		this.baseDate = baseDate;
	}

	getBaseDate() {
		return this.baseDate;
	}

	moveBaseDate(addition) {
		this.baseDate = moment(this.baseDate).add(addition, 'days');
	}
	
	setDaysCount(count) {
		this.daysCount = count;
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
									array2d[_level][_i].event.end, null, '[]')
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

		let dayIndex = 0;
		if (viewMode === 'week') {
			dayIndex = moment(date).weekday();
		} else {
			if (viewMode === 'day') {
				dayIndex = 0;
			}
		}
		let dayElement = $('tbody .day-col .day')[dayIndex];
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

	renderGrid() {
		let $place = $('#week-placeholder');
		let source = document.getElementById('week-template').innerHTML;
		let template = Handlebars.compile(source);
		let currentDay = _.cloneDeep(this.baseDate);
		let days = [];
		for (let i = 0; i < this.daysCount; i++) {
			days.push(currentDay.format('dd, DD MMM'));
			currentDay.add(1, 'days');
		}
		$place.html(template({days}));

		$('tbody .day-col .day').height( $('.grid-table tbody').height() );
		let text;
		if (viewMode === 'week') {
			text = moment(this.baseDate).week() + ' тиждень';
		} else {
			if (viewMode === 'day') {
				text = moment(this.baseDate).format('DD MMMM YYYY');
			}
		}
		$('.header .nav-block .week-number').text(text);
	}

	renderShortEvents() {
		let currentDay = _.cloneDeep(this.baseDate);
		for (let days = 0; days < this.daysCount; days++) {
			this.renderDayEvents(currentDay);
			currentDay.add(1, 'days');
		}
	}

	renderLongEvents() {
		let startOfWeek = _.cloneDeep(this.baseDate);
		let endOfWeek = _.cloneDeep(this.baseDate);
		endOfWeek.add(this.daysCount-1, 'days');
		// Сформувати набір подій
		let events = eventList.getEventsOfWeek(startOfWeek, this.daysCount);
		let entities = [];
		let array2d = [new Array(this.daysCount).fill(false)];
		let maxRow = 0;
		$.each(events, (index, item) => {
			let entity = {};
			// Чи виходить подія за межі тижня
			entity.beforeWeek = item.begin.isBefore(startOfWeek, 'day');
			entity.afterWeek = item.end.isAfter(endOfWeek, 'day');
			// Перший і останній дні тижня де має бути подія
			entity.firstDay = entity.beforeWeek ? 0 : moment.duration( moment(item.begin).diff(startOfWeek) ).days();
			entity.lastDay =
				entity.afterWeek ? this.daysCount-1 : moment.duration( moment(item.end).diff(startOfWeek) ).days();
			// Власне подія
			entity.event = item;

			// Шукаємо місце для події
			let collision = false;
			let placeFound = false;
			$.each(array2d, (row) => {
				for(let day = entity.firstDay; day <= entity.lastDay; day++) {
					// Якщо місце зайняте, на цьомі рядку перевірку закінчити
					if (array2d[row][day]) {
						collision = true;
						break;
					}
				}
				// Якщо колізії не було - розмістити подію на цьому рядку
				if (!collision) {
					placeFound = true;
					for(let day = entity.firstDay; day <= entity.lastDay; day++) {
						array2d[row][day] = true;
					}
					entity.row = row;
				}
				// Забути про колізію на цьому рядку, і на наступному шукати знову
				collision = false;
				// Якщо знайшли - більше не шукати
				return !placeFound;
			});

			// Якщо в існуючих рядках місця не знайшлося, то створити новий рядок і розміститися там
			if (!placeFound) {
				let newRow = new Array(this.daysCount).fill(false);
				for(let day = entity.firstDay; day <= entity.lastDay; day++) {
					newRow[day] = true;
				}
				array2d.push(newRow);
				entity.row = array2d.length-1;
			}

			// Тут в нас точно є місце, додаємося в масив визначених подій
			entities.push(entity);
			maxRow = Math.max(maxRow, entity.row);
		});


		// Виводимо події в DOM
		let $weekElement = $('.long-events');
		$weekElement.html('');
		$.each(entities, (index, entity) => {
			let elem = $('<div class="long-event"></div>');
			let fullWidth = $weekElement.width()-50;
			let top = entity.row * 20;
			let left = 50 + entity.firstDay * fullWidth / this.daysCount;
			let height = 19;
			let width = (entity.lastDay - entity.firstDay + 1) * fullWidth / this.daysCount - 4;
			elem
				.css({
					top: top + 'px',
					height: height + 'px',
					left: left + 'px', // 50*i + 'px',
					width: width + 'px',
				})
				.html(
					entity.event.desc
				)
				.data('id', entity.event.id);

			$($weekElement).append(elem);
		});

		// Сформувати сітку багатоденних подій
		let tds = '<td width="50px"></td>' + new Array(this.daysCount+1).join('<td class="day-full"></td>');
		let $tableContent = $('<tr class="week-full">' + tds + '</tr>');
		$tableContent.find('.day-full').each((index, item) => {
			$(item).data('day-index', index);
		});
		$tableContent.css('height', ++maxRow * 20 + 10);
		$('.header-table tbody').html($tableContent);

	}

	renderView() {
		this.renderGrid();
		this.renderShortEvents();
		this.renderLongEvents();
	}

	updateFullDaySelection(firstDay, lastDay) {
		let $allDays = $('.day-full');
		$allDays.removeClass('selected-day');
		let fd = Math.min(firstDay, lastDay);
		let ld = Math.max(firstDay, lastDay);
		for (let i = fd; i <= ld; i++) {
			$($allDays[i]).addClass('selected-day');
		}
	}
}

