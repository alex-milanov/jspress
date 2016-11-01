'use strict';

const get = el => {
	var range = window.getSelection().getRangeAt(0);
	var preSelectionRange = range.cloneRange();
	preSelectionRange.selectNodeContents(el);
	preSelectionRange.setEnd(range.startContainer, range.startOffset);
	var start = preSelectionRange.toString().length;

	return {
		start: start,
		end: start + range.toString().length
	};
};

const set = (el, sel) => {
	console.log(el, sel);
	var charIndex = 0;
	var range = document.createRange();
	range.setStart(el, 0);
	range.collapse(true);
	var nodeStack = [el];
	var node;
	var foundStart = false;
	var stop = false;

	while (!stop && (node = nodeStack.pop())) {
		if (node.nodeType === 3) {
			var nextCharIndex = charIndex + node.length;
			if (!foundStart && sel.start >= charIndex && sel.start <= nextCharIndex) {
				range.setStart(node, sel.start - charIndex);
				foundStart = true;
			}
			if (foundStart && sel.end >= charIndex && sel.end <= nextCharIndex) {
				range.setEnd(node, sel.end - charIndex);
				stop = true;
			}
			charIndex = nextCharIndex;
		} else {
			var i = node.childNodes.length;
			while (i--) {
				nodeStack.push(node.childNodes[i]);
			}
		}
	}

	var tSel = window.getSelection();
	tSel.removeAllRanges();
	tSel.addRange(range);
};

module.exports = {
	get,
	set
};
