"use strict";
function (doc, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    const page_title = (
	( req.query["title_part1"] || "" ) +
	    (" ") +
	    (req.query["title_part2"] || "" )
    );
    const docId= (doc!=null)? doc._id : null;
    const template = req.query["template"];
    
 

    function stash(){
	var stash={
	    page_title:page_title,
	    docId:docId
	};

	if (docId == null){
	    stash.bm_name= req.query["title"];
	    stash.bm_url=req.query["url"];
	    stash.bm_description=req.query["description"];
	    stash.bm_author="ctrl_alt_delor@home";
	    stash.bm_is_private=false;
	}else{
	    stash.bm_author=doc["author"];
	    stash.bm_created_at=doc["created_at"];
	    stash.bm_is_private=doc["is_private"];
	    stash.bm_name= doc["name"];
	    stash.bm_tags=doc["tags"];
	    stash.bm_tags_asText=doc["tags"].join(" ");
	    stash.bm_url=doc["url"];
	    stash.bm_description=doc["description"];
	    stash.bm_rev=doc._rev;
	}
	return stash;
    }



    //-- The provides function serves the format the client requests.
    //-- The first matching format is sent, so reordering functions changes 
    //-- thier priority. In this case HTML is the preferred format, so it comes first.
    provides("html", function() {
        return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
    });

    provides("json", function() {
        return JSON.stringify(stash());
    });
};
