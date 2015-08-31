"use strict";

$(document).ready(function(){

	function md2html(){
		var md = $("#markdown-editor").val();
		tinymce.activeEditor.setContent(marked(md));
	}

	function html2md(){
		var html = tinymce.activeEditor.getContent();
		var md = toMarkdown(html);
		$("#markdown-editor").val(md);
	}

	tinymce.init({
		selector: "#html-editor",
        theme_url: '/lib/theme.min.js',
		setup : function(ed) {
			ed.on('keyup',html2md);
		}
	});

	$("#convert-markdown-html").click(md2html);
	$("#markdown-editor").on("keyup",md2html);


	$("#convert-html-markdown").click(html2md);



})