function  (head, req) {
    template = req.query["template"];

    var ddoc = this;
    var Mustache = require("lib/mustache");
    var myLib = require("lib/myLib");

    function stash(){

	var row_values = new Array();
	function process(row){
	    row_values.push(row.doc);
	}

	function mainLoop(){
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