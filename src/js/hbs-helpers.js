/* global Handlebars */
/* eslint-disable no-invalid-this */

Handlebars.registerHelper('times', function(n, block) {
	let accum = '';
	for(let i = 0; i < n; ++i)
		accum += block.fn(i);
	return accum;
});

Handlebars.registerHelper('pad', function(a, b) {
	return ('00000000000000' + a).substr(-b);
});

Handlebars.registerHelper('iff', function(a, operator, b, opts) {
	let bool = false;
	switch(operator) {
		case '==':
			bool = a == b;
			break;
		case '>':
			bool = a > b;
			break;
		case '<':
			bool = a < b;
			break;
		default:
			throw new Error(`Unknown operator ${operator}`);
	}

	if (bool) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
});
