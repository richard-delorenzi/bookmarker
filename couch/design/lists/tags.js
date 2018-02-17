"use strict";
function (head, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");
    const myTagSizeLib = require("lib/myTagSizeLib");

    //-----------------------------------------------------------------------------------------

    const template = req.query["template"];
    const title = req.query["title_part1"]+ " " +req.query["title_part2"];

    function stash(){
	var tags =    new Array();
	var maxes = { "tag": -1 };

	function process(row){
	    if (row){
		outputTag ( tags, "tag", "tag", row );
	    }else{
		//post-processing
		myTagSizeLib.calcTagSizes(tags, maxes["tag"]);
	    }
	}

	function outputTag( outputList, input_key, url_prefix, row ) {
	    const count = row.value;
	    const name=row.key[0];
	    maxes[input_key] = Math.max( maxes[input_key], count);
	    
	    outputList.push(
		{
		    count: count,
		    name: name,
		    url: "/" +url_prefix+ "/" +name
		}
	    );
	}
	
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                process(row);
            }
	    process(null);
        }
	
        mainLoop();
        return {tags:tags, title:title};
    }



    //-- The provides function serves the format the client requests.
    //-- The first matching format is sent, so reordering functions changes 
    //-- thier priority. In this case HTML is the preferred format, so it comes first.

    if (true) {
	provides("html", function() {
            return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
	});
    }

    provides("json", function() {
        return JSON.stringify(stash());
    });   
};
