const { DateTime } = require('luxon');

module.exports = {
  /**
   * The **`formatToTime()`** function parses seconds and returns a string in the format of weeks, days, hours, minutes and seconds.
   * @param {number} seconds The seconds to parse.
   * @returns {string} A string in the format of weeks, days, hours, minutes and seconds.
   */
  formatToTime: (seconds) => {
    let sec = Math.trunc(seconds);

    const weeks = Math.floor(sec / (3600 * 24 * 7));
    sec -= weeks * 3600 * 24 * 7;

    const days = Math.floor(sec / (3600 * 24));
    sec -= days * 3600 * 24;

    const hrs = Math.floor(sec / 3600);
    sec -= hrs * 3600;

    const min = Math.floor(sec / 60);
    sec -= min * 60;

    const tmp = [];

    weeks && tmp.push(weeks + (weeks === 1 ? ' week' : ' weken'));
    days && tmp.push(days + (days === 1 ? ' dag' : ' dagen'));
    hrs && tmp.push(hrs + (hrs === 1 ? ' uur' : ' uren'));
    min && tmp.push(min + ' min');
    tmp.push(sec + ' sec');

    return tmp.join(', ');
  },

  /**
   * The **`formatToDate()`** function parses milliseconds and returns a string in the format of a localized date and time.
   * @param {number} milliseconds The milliseconds to parse.
   * @returns {string} A string in the format of a localized date and time.
   */
  formatToDate: (milliseconds) => {
    const date = new Date(milliseconds);
    const tmp = [];

    tmp.push(date.toLocaleDateString('nl-BE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    tmp.push(date.toLocaleTimeString('nl-BE', { hour: 'numeric', minute: 'numeric', hour12: false }));

    return tmp.join(' ');
  },

  /**
   * The **`isValidDate()`** function checks if the given date has a valid format and returns true or false.
   * @param {string} date The date to check.
   * @returns {boolean} True if the given date is valid; otherwise false.
   */
  isValidDate: (date) => {
    // Checks date with /
    const check1 = DateTime.fromFormat(date, 'd/M').isValid;
    const check2 = DateTime.fromFormat(date, 'd/M/y').isValid;

    // Checks date with -
    const check3 = DateTime.fromFormat(date, 'd-M').isValid;
    const check4 = DateTime.fromFormat(date, 'd-M-y').isValid;

    return check1 || check2 || check3 || check4;
  },

  /**
   * The **`convertToISO()`** function parses a date and returns an ISO 8601-compliant string.
   * @param {string} date The date to parse.
   * @returns {string} An ISO 8601-compliant string in UTC.
   */
  convertToISO: (date) => {
    let tmp;

    // Converts date with /
    if (DateTime.fromFormat(date, 'd/M').isValid) tmp = DateTime.fromFormat(date, 'd/M');

    if (DateTime.fromFormat(date, 'd/M/y').isValid) tmp = DateTime.fromFormat(date, 'd/M/y');

    // Converts date with -
    if (DateTime.fromFormat(date, 'd-M').isValid) tmp = DateTime.fromFormat(date, 'd-M');

    if (DateTime.fromFormat(date, 'd-M-y').isValid) tmp = DateTime.fromFormat(date, 'd-M-y');

    return tmp.setZone('utc', { keepLocalTime: true }).toISO();
  },
};