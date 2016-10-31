'use strict';

const options = {
	toMarkdown: {
		converters: [
			{
				filter: 'li',
				replacement: (content, node) => {
					content = content.replace(/^\s+/, '').replace(/\n/gm, '\n ');
					let prefix = '- ';
					const parent = node.parentNode;
					const index = Array.prototype.indexOf.call(parent.children, node) + 1;

					prefix = /ol/i.test(parent.nodeName) ? index + '. ' : '- ';
					return prefix + content;
				}
			},
			{
				filter: 'div',
				replacement: (content, node) => `\n\n${content}`
			}
		]
	},
	marked: {
		gfm: true,
		breaks: true
	}
};
