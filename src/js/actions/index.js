'use strict';

const Rx = require('rx');
const $ = Rx.Observable;
const {Subject} = Rx;

const md = require('../util/md');

const request = require('../util/request');

const stream = new Subject();
const wizySubject = new Subject();

const init = () => stream.onNext(state => state);

const wizyInput = ({html, sel}) => wizySubject.onNext({html, sel});

const wizy$ = wizySubject.debounce(500).map(({html, sel}) =>
	state => Object.assign({}, state, {content: Object.assign(
		{}, state.content, {body: md.fromHTML(html), sel}
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
		body: '# Hello World!\n\n- I mean it',
		sel: {start: 0, end: 0}
	},
	wizyIsActive: true,
	sidePanelOpened: false
};

module.exports = {
	init,
	wizyInput,
	fromMD,
	toggleSidePanel,
	toggleWizzy,
	initial,
	stream: $.merge(stream, wizy$)
};
