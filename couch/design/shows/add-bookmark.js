"use strict";
function (doc, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    const bm_url= req.query["url"];
    const bm_title= req.query["title"];
    const bm_description= req.query["description"];
    const template = req.query["template"];
    //const key = req.query["key"];
    const page_title = (
	( req.query["title_part1"] || "" ) +
	    (" ") +
	    (req.query["title_part2"] || "" )
    );

    function stash(){
        return {
	    page_title:page_title,
	    bm_title:bm_title,
	    bm_url:bm_url,
	    bm_description:bm_description
	};
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
