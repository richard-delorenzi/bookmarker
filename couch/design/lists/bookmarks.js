"use strict";
function (head, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    const template = req.query["template"];
    const key = req.query["key"];
    const title = req.query["title_part1"]+ " " +req.query["title_part2"] ;

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

	var prevDate=null;
        function row_info(row){
	    const date = row.doc.date.split("T")[0];

	    const data ={
		url : row.doc.url,
		name: row.doc.name,
		tags: processedTags(row.doc.tags),
		date: date,
		description: row.doc.description
	    };

	    return [data];
	}
	 
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                 the_stash = the_stash.concat(row_info(row));
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
