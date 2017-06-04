/**
 *  Базовий клас представлення
 */
class CustomView {

	/**
	 * @param {moment} baseDate - дата початку періоду, що відображається
	 */
	constructor(baseDate) {
		this.baseDate = baseDate;
	}

	/**
	 * Встановити базову дату
	 * @param {moment} baseDate
	 */
	setBaseDate(baseDate) {
		this.baseDate = baseDate;
	}

	/**
	 * Отримати базову дату
	 * @return {moment}
	 */
	getBaseDate() {
		return this.baseDate;
	}

}
