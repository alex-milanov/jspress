

if(typeof(jspress) === "undefined") {
	jspress = {};
}

jspress.Editor = function(dom, options){
	this._dom = dom;
	this._options = options;

	this._nodeMap = [];

	this._generateNodeMap = function(){
		var editor = this;
		editor._nodeMap = [];
		Array.prototype.forEach.call(editor._wysiwyg[0].childNodes, function(node, index){ 
			if(node.nodeType == 3 && node.textContent == "\n"){

			} else {
				editor._nodeMap.push({
					index: index,
					type: node.nodeType,
					name: node.nodeName,
					content: node.textContent
				})
			}
		})
	}
}


jspress.Editor.prototype.process = function(){
	var sel = saveSelection(this._wysiwyg[0]);
	
	this._generateNodeMap();
	var oldMap = _.clone(this._nodeMap);

	var html = this._wysiwyg.html();
	var md = toMarkdown(html, this._options.toMarkdown);

	$(this._markdown).val(md);

	this._wysiwyg.html(marked(md, this._options.marked))

	this._generateNodeMap();
	var newMap = _.clone(this._nodeMap);

	var diffMap = DeepDiff.diff(oldMap,newMap);
	console.log(diffMap,oldMap,newMap);

	restoreSelection(this._wysiwyg[0],sel);
}


jspress.Editor.prototype.init = function(){

	this._wysiwyg = $(this._dom).find("#wysiwyg-editor");
	this._markdown = $(this._dom).find("#markdown-editor");

	var editor = this;

	var typingTimer = false;                //timer identifier
	var doneTypingInterval = 500;  //time in ms, 5 second for example

	function md2html(){
		var md = $(editor._markdown).val();
		$(editor._wysiwyg).html(marked(md, editor._options.marked));
	}

	function html2md(){
		var html = $(editor._wysiwyg).html();
		var md = toMarkdown(html, editor._options.toMarkdown);
		$(editor._markdown).val(md);
	}

	$(editor._markdown).on("keyup",md2html);

	$(editor._wysiwyg).keyup(function () {
		var that = this;
		if(typingTimer)
			clearTimeout(typingTimer);
		typingTimer = setTimeout(function(){
			editor.process();
		}, doneTypingInterval);
	})

	$(editor._wysiwyg).keydown(function(){
		clearTimeout(typingTimer);
	});

	$(editor._dom).on("click",".editor-toolbar > button",function(){
		$(this).parent().find("button").removeClass("active");
		$(this).addClass("active");
		$(".editor-layout > .editor-area").removeClass("active");
		$($(this).attr("rel")).addClass("active");
	});


}