"use strict";

$(document).ready(function(){
	$("#convert-markdown-html").click(function(){
		var md = $("#markdown-editor").val();
		console.log(md);
		console.log(marked(md));
		$("#html-editor").html(marked(md));
	})
})