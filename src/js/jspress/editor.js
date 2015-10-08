

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


	this._getNodePath = function(parent, child){
		if(!parent.contains(child))
			return false;
		var node = child;
		var nodePath = [];

		nodePath.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node));

		while(node.parentNode != parent) {
			node = node.parentNode;
			nodePath.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node));
		}

		nodePath.reverse();
		return nodePath;
	}

	this._nodeByPath = function(parent, nodePath){
		var node = parent;

		nodePath.forEach(function(index){
			if(node.childNodes[index]){
				if(node.childNodes[index].nodeType == 3 && node.childNodes[index].textContent == "\n"){
					if(node.childNodes[index+1])
						node = node.childNodes[index+1];
					else 
						return false;
				} else {
					node = node.childNodes[index];
				}
			}
			else 
				return false;
		})

		// select a text node if it's present
		if(node.childNodes[0] && node.childNodes[0].nodeType == 3){
			node = node.childNodes[0];
		}

		return node;
	}

	this._getSelection = function(){

		var containerEl = this._wysiwyg[0];

		var sel = window.getSelection();
		//console.log(containerEl);
		var range = window.getSelection().getRangeAt(0);
		var preSelectionRange = range.cloneRange();
		preSelectionRange.selectNodeContents(containerEl);
		preSelectionRange.setEnd(range.startContainer, range.startOffset);
		var start = preSelectionRange.toString().length;

		return {
			start: start,
			startNodePath: this._getNodePath(containerEl, sel.anchorNode),
			startNodeOffset: sel.anchorOffset,
			end: start + range.toString().length,
			endNodePath: this._getNodePath(containerEl, sel.extentNode),
			endNodeOffset: sel.extentOffset
		};
	}

	this._setSelection = function(changeMap, savedSel){

		var containerEl = this._wysiwyg[0];
		
		var charIndex = 0, range = document.createRange();
		range.setStart(containerEl, 0);
		range.collapse(true);

		for(var index in changeMap){
			var change = changeMap[index];
			switch(change.kind){
				case "D":
					console.log(change, index);
					var newNode = document.createElement(change.lhs.name);
					newNode.appendChild(document.createElement("br"));
					if(containerEl.childNodes[index]){
						containerEl.insertBefore(newNode, containerEl.childNodes[index]);
					} else {
						containerEl.appendChild(newNode);
					}
					break;
				case "E":
					if(savedSel.startNodePath[0] == index 
						|| ( savedSel.startNodePath[0] == index+1 && containerEl.childNodes[index].nodeType == 3 )){
						if(change.changes.name){
							if(["H1","H2","H3","H4","LI"].indexOf(change.changes.name.rhs) > -1){
								console.log("changed",change.changes.content.rhs.length)
								savedSel.startNodeOffset = change.changes.content.rhs.length;
							}
						}
					}
					if(savedSel.endNodePath[0] == index
						|| ( savedSel.endNodePath[0] == index+1 && containerEl.childNodes[index].nodeType == 3 )){
						if(change.changes.name){
							if(["H1","H2","H3","H4","LI"].indexOf(change.changes.name.rhs) > -1){
								savedSel.endNodeOffset = change.changes.content.rhs.length;
							}
						}
					}
					break;
			}
		}
		console.log(changeMap, savedSel);
		
		range.setStart(this._nodeByPath(containerEl,savedSel.startNodePath),savedSel.startNodeOffset);
		range.setEnd(this._nodeByPath(containerEl,savedSel.endNodePath),savedSel.endNodeOffset);
		

		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

jspress.Editor.prototype.processDiffMap = function(diffMap, selection){
	if(!diffMap)
		return false;
	var editor = this;
	var changeMap = {};
	diffMap.forEach(function(diffNode){
		var kind = diffNode.kind;
		var index, item;
		switch(kind){
			case "E":
				index = diffNode.path[0];
				break;
			case "A":
				index = diffNode.index;
				diffNode = diffNode.item;
				kind = diffNode.kind;
				break;
		}
		if(!changeMap[index])
			changeMap[index] = { changes: [], kind: "E" };
		if(diffNode.path && diffNode.path.length > 0){
			changeMap[index].changes[diffNode.path[diffNode.path.length-1]] = _.cloneDeep(diffNode);
		} else {
			changeMap[index] = diffNode;
		}

	})
	return changeMap;
}


jspress.Editor.prototype.process = function(){
	var sel = this._getSelection(this._wysiwyg[0]);
	
	this._generateNodeMap();
	var oldMap = _.clone(this._nodeMap);

	var html = this._wysiwyg.html();
	var md = toMarkdown(html, this._options.toMarkdown);

	$(this._markdown).val(md);

	this._wysiwyg.html(marked(md, this._options.marked))

	this._generateNodeMap();
	var newMap = _.clone(this._nodeMap);

	var diffMap = DeepDiff.diff(oldMap,newMap);
	//console.log(diffMap,oldMap,newMap);
	var changeMap = this.processDiffMap(diffMap);

	this._setSelection(changeMap,sel);
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