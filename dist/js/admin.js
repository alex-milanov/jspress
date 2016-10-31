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

	$("body").on("click","a[class*='-toggle']",function(){
		$(this).toggleClass("toggled");
		var $toggleRef = $($(this).data("toggle-ref"));
		var _toggleClass = $(this).data("toggle-class");
		var _toggleParam = $(this).data("toggle-param");
		$toggleRef.toggleClass(_toggleClass);
	});
	

	var $fileList = $("#file-list");

	$.get("/api/content")
		.then(function(files){
			$fileList.html("")
			files.forEach(function(fileName){
				var $fileNode = $("<li><a>"+fileName+"</a></li>");
				$fileNode.click(function(){
					openFile(fileName);
				})
				$fileList.append($fileNode);
			})
		})

	var openFile = function(filePath){
		$.get("/api/content/"+filePath)
			.then(function(fileContent){
				editor.setContent(fileContent);
				$("#article-title").text(filePath);
			})
	}

	var saveFile = function(filePath){
		var content = editor.getContent();
		$.ajax({
			url: "/api/content/"+filePath, 
			data: {content:content},
			method: "PUT"
		});
	}

	$("#file-save").click(function(){
		var filePath = $("#article-title").text();
		saveFile(filePath);
	})
})