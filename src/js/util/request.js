'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const superagent = require('superagent');

superagent.Request.prototype.observe = function() {
	return $.fromNodeCallback(this.end, this)();
};

module.exports = superagent;
