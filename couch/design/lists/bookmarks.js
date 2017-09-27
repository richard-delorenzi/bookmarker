"use strict";
function (head, req) {
    var ddoc = this;
    var Mustache = require("lib/mustache");
    var List = require("vendor/couchapp/lib/list");
    var path = require("vendor/couchapp/lib/path").init(req);
    var myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    var template = req.query["template"];
    var key = req.query["key"];
    var title = req.query["title_part1"]+ " " +req.query["title_part2"] ;

    function stash(){
	var the_stash=[];

	function processedTags(tags){
	    var out=[];
	    tags.forEach( function (tag) {
		out.push({
		    name: tag,
		    url: "/tag/" + tag
		});
	    });
	    return out;
	}
	
        function row_info(row){
	    
	    return {
		url : row.doc.url,
		name: row.doc.name,
		tags: processedTags(row.doc.tags),
		date: row.doc.date
	    }
	}
	 
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                 the_stash.push(row_info(row));
            }
        }
	
        mainLoop();
        return {bookmarks:the_stash, title:title};
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
