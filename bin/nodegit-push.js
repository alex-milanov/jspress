"use strict";

var path = require("path");

var nodegit = require("nodegit");
var Promise = require("nodegit-promise");

var repo;
var remote;

nodegit.Repository.open("content")
	.then(function(repository){
		repo = repository;
		return repo;
	})
	.then(function(){
		return nodegit.Remote.lookup(repo, "origin");		
	})
	.then(function(remoteResult) {
		remote = remoteResult;
		
		remote.setCallbacks({
			certificateCheck: function() { return 1; },
			credentials: function(url, userName) {
				return nodegit.Cred.sshKeyFromAgent(userName);
			}
		});
		// Create the push object for this remote
		return remote.push(
			["refs/heads/master:refs/heads/master"],
			null,
			repo.defaultSignature(),
			"Push to master");
	}).done(function() {
		console.log("Done!");
	},function(error){
		console.log(error);
	});