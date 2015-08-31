"use strict";

var Git = require("nodegit");

Git.Clone("https://github.com/alex-milanov/jspress-md-content", "content").then(function(repository) {
  // Work with the repository object here.
});
