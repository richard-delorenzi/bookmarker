"use strict";
function  (head, req) {
    const template = req.query["template"];

    const ddoc = this;
    const Mustache = require("lib/mustache");
    const myLib = require("lib/myLib");

    function stash(){

	var row_values = new Array();
	function process(row){
	    row_values.push(row.doc);
	}

	function mainLoop(){
	    var row;
	    while (row = getRow() ) {
		process(row);
	    }
	}
	
	mainLoop();
	return row_values;
    }

    provides("html", function() {	
	return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
    });

    provides("json", function() {
	return JSON.stringify(stash());
    });   
}
