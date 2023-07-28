/**
 * Helpers.
 */
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {string | number} val
 * @param {object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {string | number}
 * @api public
 */

function ms(val: any, options = { long: true }, locale = 'en-US') {
	options = options || {};
	var type = typeof val;
	if (type === 'string' && val.length > 0) {
		return parse(val);
	} else if (type === 'number' && isFinite(val)) {
		return options.long ? fmtLong(val, locale) : fmtShort(val);
	}

	return null;
}

export default ms;
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {string} str
 * @return {number}
 * @api private
 */

function parse(str: string) {
	str = String(str);
	if (str.length > 100) {
		return;
	}

	// eslint-disable-next-line
	var match =
		/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);

	if (!match) {
		return;
	}
	var n = parseFloat(match[1]);
	var type = (match[2] || 'ms').toLowerCase();
	switch (type) {
		case 'years':
		case 'year':
		case 'yrs':
		case 'yr':
		case 'y':
			return n * y;
		case 'weeks':
		case 'week':
		case 'w':
			return n * w;
		case 'days':
		case 'day':
		case 'd':
			return n * d;
		case 'hours':
		case 'hour':
		case 'hrs':
		case 'hr':
		case 'h':
			return n * h;
		case 'minutes':
		case 'minute':
		case 'mins':
		case 'min':
		case 'm':
			return n * m;
		case 'seconds':
		case 'second':
		case 'secs':
		case 'sec':
		case 's':
			return n * s;
		case 'milliseconds':
		case 'millisecond':
		case 'msecs':
		case 'msec':
		case 'ms':
			return n;
		default:
			return undefined;
	}
}

/**
 * Short format for `ms`.
 *
 * @param {number} ms
 * @return {string}
 * @api private
 */

function fmtShort(ms: any) {
	var msAbs = Math.abs(ms);
	if (msAbs >= d) {
		return Math.round(ms / d) + 'd';
	}
	if (msAbs >= h) {
		return Math.round(ms / h) + 'h';
	}
	if (msAbs >= m) {
		return Math.round(ms / m) + 'm';
	}
	if (msAbs >= s) {
		return Math.round(ms / s) + 's';
	}
	return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {number} ms
 * @return {string}
 * @api private
 */

const translations = {
	'en-US': {
		day: 'day',
		hour: 'hour',
		minute: 'minute',
		second: 'second',
		slavic: false
	},
	ru: {
		day: {
			nomSingular: 'день',
			genSingular: 'дня',
			genPlural: 'дней'
		},
		hour: {
			nomSingular: 'час',
			genSingular: 'часа',
			genPlural: 'часов'
		},
		minute: {
			nomSingular: 'минута',
			genSingular: 'минуты',
			genPlural: 'минут'
		},
		second: {
			nomSingular: 'секунда',
			genSingular: 'секунды',
			genPlural: 'секунд'
		},
		slavic: true
	},
	ua: {
		day: {
			nomSingular: 'день',
			genSingular: 'дні',
			genPlural: 'днів'
		},
		hour: {
			nomSingular: 'година',
			genSingular: 'години',
			genPlural: 'годин'
		},
		minute: {
			nomSingular: 'хвилина',
			genSingular: 'хвилини',
			genPlural: 'хвилин'
		},
		second: {
			nomSingular: 'секунда',
			genSingular: 'секунди',
			genPlural: 'секунд'
		},
		slavic: true
	}
};
function fmtLong(ms: any, locale: string) {
	const translation = translations[locale as keyof typeof translations] || translations['en-US'];
	var msAbs = Math.abs(ms);
	if (msAbs >= d) {
		return plural(ms, msAbs, d, 'day', translation);
	}
	if (msAbs >= h) {
		return plural(ms, msAbs, h, 'hour', translation);
	}
	if (msAbs >= m) {
		return plural(ms, msAbs, m, 'minute', translation);
	}
	if (msAbs >= s) {
		return plural(ms, msAbs, s, 'second', translation);
	}
	return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms: any, msAbs: any, n: any, name: any, translation: any) {
	var isPlural = msAbs >= n * 1.5;
	let nameTranslated = translation.slavic ? translation[name].nomSingular : translation[name];
	if (translation.slavic) {
		if (Math.round(ms / n) > 1) nameTranslated = translation[name].genSingular;
		if (Math.round(ms / n) >= 5) nameTranslated = translation[name].genPlural;
	}
	return Math.round(ms / n) + ' ' + nameTranslated + (isPlural && !translation.slavic ? 's' : '');
}
