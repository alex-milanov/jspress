"use strict";

var Git = require("nodegit");

var getMostRecentCommit = function(repository) {
	return repository.getBranchCommit("master");
};

var getCommitMessage = function(commit) {
	return commit.message();
};

var repo;

Git.Repository.open("content")
	.then(function(repository){
		repo = repository;
		return repo;
	})
	.then(getMostRecentCommit)
	.then(getCommitMessage)
	.then(function(message) {
		console.log("Last commit: "+message);
	})
	.then(function(){
		return repo.getStatus();
	})
	.then(function(statuses) {
		function statusToText(status) {
			var words = [];
			if (status.isNew()) { words.push("NEW"); }
			if (status.isModified()) { words.push("MODIFIED"); }
			if (status.isTypechange()) { words.push("TYPECHANGE"); }
			if (status.isRenamed()) { words.push("RENAMED"); }
			if (status.isIgnored()) { words.push("IGNORED"); }

			return words.join(" ");
		}
		console.log("Git status:");
		statuses.forEach(function(file) {
			console.log(file.path() + " " + statusToText(file));
		});
	})
	.then(function(){
		return Git.Remote.list(repo);
	})
	.then(function(remotes){
		console.log("Remotes list:", remotes)
	})