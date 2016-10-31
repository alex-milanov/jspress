'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const {Subject} = Rx;

const toMarkdown = require('to-markdown');

const request = require('../util/request');

const stream = new Subject();

const init = () => stream.onNext(state => state);

const fromHTML = html => stream.onNext(
	state => Object.assign({}, state, {content: Object.assign(
		{}, state.content, {body: toMarkdown(html)}
	)})
);
const fromMD = body => stream.onNext(
	state => Object.assign({}, state, {content: Object.assign(
		{}, state.content, {body}
	)})
);

const toggleSidePanel = () => stream.onNext(
	state => Object.assign({}, state, {sidePanelOpened: !state.sidePanelOpened})
);

const toggleWizzy = wizyIsActive => stream.onNext(
	state => Object.assign({}, state, {wizyIsActive})
);

const initial = {
	content: {
		title: 'New Article',
		body: '# Hello World!\n\n- I mean it'
	},
	wizyIsActive: true,
	sidePanelOpened: false
};

module.exports = {
	init,
	fromHTML,
	fromMD,
	toggleSidePanel,
	toggleWizzy,
	initial,
	stream
};
