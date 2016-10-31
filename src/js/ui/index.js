'use strict';

const {
	section, h1, h2, h3, hr, header, i, ul, li, a, div, textarea,
	table, thead, tbody, tr, td, th, form, input, button, label
} = require('../util/vdom');

const marked = require('marked');

module.exports = ({state, actions}) => section('#ui', [
	section('.side-panel', {
		class: {opened: state.sidePanelOpened}
	}, [
		h3('File List'),
		ul('.file-list', [
			li([a('README.md')]),
			li([a('index.md')]),
			li([a('about.md')]),
			li([a('news.md')])
		])
	]),
	header([
		a('.fa.fa-bars', {
			on: {click: () => actions.toggleSidePanel()}
		}),
		h1('JSPress'),
		// article title
		h2('.article-title[contenteditable="true"]', state.content.title),
		section('.article-menu', [
			a('.fa.fa-save'),
			a('.fa.fa-cog'),
			a('.fa.fa-plus')
		])
	]),
	section('.editor', [
		// wysiwig
		div('.editor-area[contenteditable="true"]', {
			class: {active: state.wizyIsActive},
			props: {innerHTML: marked(state.content.body)},
			on: {input: ev => actions.fromHTML(ev.target.innerHTML)}
		}),
		// markdown
		textarea('.editor-area', {
			class: {active: !state.wizyIsActive},
			props: {value: state.content.body},
			on: {input: ev => actions.fromMD(ev.target.value)}
		}),
		div('.editor-toolbar', [
			button({class: {active: state.wizyIsActive}, on: {click: () => actions.toggleWizzy(true)}}, 'WYSIWYG'),
			button({class: {active: !state.wizyIsActive}, on: {click: () => actions.toggleWizzy(false)}}, 'Markdown')
		])
	])
]);
