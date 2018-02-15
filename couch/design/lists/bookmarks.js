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
    const is_tag_mode= (req.query["mode"]=="tags");

    function stash(){
	var bookmark_stash=[];
	var tag_stash=[];

	function processedTags(tags){
	    var out=[];
	    tags.forEach( function (tag) {
		out.push({
		    name: tag,
		    url: "/tag/" + tag.toLowerCase()
		});
	    });
	    return out;
	}
	function ArrayHas(array,item){
	    return array.indexOf(item) > -1;
	}
	function addTag(tag){
	    if (!ArrayHas(tag_stash,tag)){
		tag_stash.push(tag);
	    }
	}
	function addTags(tags){
	    tags.forEach( function (tag) {
		addTag(tag);
	    });
	}

	var prevDate=null;
        function row_info(row){
	    const date = row.doc.created_at.split("T")[0];
	    const date_stash = {date: date};
	    const edit_url= "/edit/"+row.id;
	    const tags=row.doc.tags;

	    addTags(tags);

	    const main_stash ={
		main:{
		    url : row.doc.url,
		    name: row.doc.name,
		    tags: processedTags(tags),
		    description: row.doc.description,
		    edit_url: edit_url
		}
	    };

	    const Result= ( date != prevDate )?
		  [date_stash,main_stash]:
		  [main_stash];
	    
	    prevDate=date;
	    return Result;
	}
	 
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                 bookmark_stash = bookmark_stash.concat(row_info(row));
            }
        }
	
        mainLoop();

	const related_tags= (
	    tag_stash.length == 0?
		undefined:
		processedTags(tag_stash)
	);
        return {
	    title:title,
	    bookmarks:bookmark_stash,
	    related_tags:related_tags
	};
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
