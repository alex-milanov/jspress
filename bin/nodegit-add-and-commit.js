"use strict";

var path = require("path");

var nodegit = require("nodegit");
var Promise = require("nodegit-promise");

var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));

// mkdirp
fse.ensureDir = promisify(fse.ensureDir);

var files = [
	{
		name: "test-article.md",
		content: "# Hello World! \n\nSome random list: \n- Item 1 \n- Item 2"
	}
];

var repo;
var index;
var oid;

nodegit.Repository.open(path.resolve(__dirname, "../content/.git"))
.then(function(repoResult) {
	repo = repoResult;
})
.then(function() {
	var fileWritePromises = [];
	files.forEach(function(file){
		fileWritePromises.push(fse.writeFile(
			path.join(repo.workdir(), './', file.name),
			file.content
		));
	})
	return Promise.all(fileWritePromises);
})
.then(function() {
	return repo.openIndex();
})
.then(function(indexResult) {
	index = indexResult;
	return index.read(1);
})
.then(function() {
	// this file is in the root of the directory and doesn't need a full path

	return index.addByPath(files[0].name);
})
.then(function() {
	// this will write both files to the index
	return index.write();
})
.then(function() {
	return index.writeTree();
})
.then(function(oidResult) {
	oid = oidResult;
	return nodegit.Reference.nameToId(repo, "HEAD");
})
.then(function(head) {
	return repo.getCommit(head);
})
.then(function(parent) {
	var author = nodegit.Signature.default(repo);
	var committer = nodegit.Signature.default(repo);

	return repo.createCommit("HEAD", author, committer, "test-article.md added", oid, [parent]);
})
.done(function(commitId) {
	console.log("New Commit: ", commitId);
});