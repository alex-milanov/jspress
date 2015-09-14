"use strict";


var toMarkdownOptions = {
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
}

var typingTimer = false;                //timer identifier
var doneTypingInterval = 500;  //time in ms, 5 second for example

function doneTyping (el) {
	var sel = saveSelection(el[0]);
	
	var html = el.html();
	var md = toMarkdown(html, toMarkdownOptions);

	$("#markdown-editor").val(md);
	
	el.html(marked(md))
	
	restoreSelection(el[0],sel);
}


$(document).ready(function(){

	function md2html(){
		var md = $("#markdown-editor").val();
		$("#wysiwyg-editor").html(marked(md));
	}

	function html2md(){
		var html = $("#wysiwyg-editor").html();
		var md = toMarkdown(html, toMarkdownOptions);
		console.log(md);
		$("#markdown-editor").val(md);
	}

	$("#markdown-editor").on("keyup",md2html);

	$("#wysiwyg-editor").keyup(function () {
		var that = this;
		if(typingTimer)
			clearTimeout(typingTimer);
		typingTimer = setTimeout(function(){
			doneTyping($(that));
		}, doneTypingInterval);
	})

	$("#wysiwyg-editor").keydown(function(){
		clearTimeout(typingTimer);
	});


	$(".editor-toolbar > button").click(function(){
		$(this).parent().find("button").removeClass("active");
		$(this).addClass("active");
		$(".editor-layout > .editor").removeClass("active");
		$($(this).attr("rel")).addClass("active");
	});




})