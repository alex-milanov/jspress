'use strict';

const contains = (str, exp) => str.match(new RegExp(exp, 'ig')) || [];
const occuring = (str, exp) => contains(str, exp).length;
const replace = (str, exp, rep) => str.replace(new RegExp(exp, 'ig'), rep);

const textOf = el => {
	if (el.innerText) return el.innerText;
	let sel;
	let range;
	let prevRange;
	let selString;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			prevRange = sel.getRangeAt(0);
		}
		range = document.createRange();
		range.selectNodeContents(el);
		sel.removeAllRanges();
		sel.addRange(range);
		selString = sel.toString();
		sel.removeAllRanges();
		if (prevRange) sel.addRange(prevRange);
	} else if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(el);
		range.select();
	}
	return selString;
};

const get = el => {
	var range = window.getSelection().getRangeAt(0);
	var preSelectionRange = range.cloneRange();
	preSelectionRange.selectNodeContents(el);
	preSelectionRange.setEnd(range.startContainer, range.startOffset);
	var start = preSelectionRange.toString().length;

	const sel = {
		start: start,
		end: start + range.toString().length
	};

	let textOfEl = textOf(el).replace(/(\n)+/ig, '\n');

	const offsetS = ((textOfEl.length < sel.start)
		|| (occuring(textOfEl.slice(0, sel.start), '\n') > occuring(el.textContent.replace(/\n+/ig, '\n').slice(0, sel.start), '\n')))
		? 1 : 0;

	const offsetE = ((textOfEl.length < sel.end)
		|| (occuring(textOfEl.slice(0, sel.end), '\n') > occuring(el.textContent.replace(/\n+/ig, '\n').slice(0, sel.end), '\n')))
		? 1 : 0;

	const mdMatch = /\n([ \t]+)?(-|[#]+)([ ]+)?/ig;

	const tstart = ('\n' + textOfEl.slice(0, sel.start)).replace(mdMatch, '\n').slice(1);
	const tend = ('\n' + textOfEl.slice(0, sel.end)).replace(mdMatch, '\n').slice(1);

	console.log(textOfEl, el.textContent.replace(/\n+/ig, '\n'), textOfEl.length, textOfEl.slice(0, sel.end).length, sel, {
		start: tstart.length,
		end: tend.length
	});

	return {
		start: tstart.length + offsetS,
		end: tend.length + offsetE
	};
};

const set = (el, sel) => {
	console.log(4, sel);
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
