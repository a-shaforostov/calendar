'use strict';

/* global Handlebars */

Handlebars.registerHelper('times', function (n, block) {
	var accum = '';
	for (var i = 0; i < n; ++i) {
		accum += block.fn(i);
	}return accum;
});

Handlebars.registerHelper('add', function (a, b) {
	return a + b;
});

Handlebars.registerHelper('pad', function (a, b) {
	return ('00000000000000' + a).substr(-b);
});

Handlebars.registerHelper('for', function (from, to, incr, block) {
	var accum = '';
	for (var i = from; i < to; i += incr) {
		accum += block.fn(i);
	}return accum;
});