"use strict";


var options = {
	toMarkdown: {
		converters: [
			{
				filter: 'li',
				replacement: function (content, node) {
					content = content.replace(/^\s+/, '').replace(/\n/gm, '\n ');
					var prefix = '- ';
					var parent = node.parentNode;
					var index = Array.prototype.indexOf.call(parent.children, node) + 1;

					prefix = /ol/i.test(parent.nodeName) ? index + '. ' : '- ';
					return prefix + content;
				}
			},
			{
				filter: 'div',
				replacement: function (content, node) {
					return "\n\n"+content;
				}
			}
		]
	},
	marked: {
		gfm: true,
		breaks: true
	}
}

var editor = new jspress.Editor("#editor",options);

$(document).ready(function(){

	editor.init();
	
})