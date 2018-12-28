"use strict";
function (head, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");
    const myTagSizeLib = require("lib/myTagSizeLib");
    const marked= require("lib/marked");

//-----------------------------------------------------------------------------------------

    const template = req.query["template"];
    const key = req.query["key"];
    const title = req.query["title_part1"]+ " " +req.query["title_part2"] ;
    const is_tag_mode= (req.query["mode"]=="tags");
    const subSite = req.query["subSite"];

    function stash(){
	var image_stash=[];
	 
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                image_stash = image_stash.concat(
                    {
                        name: row.value,
                        url: "/db/" +row.id+ "/" + row.value
                    }
                );
            }
        }
	
        mainLoop();

	
        return {
	    title:"images",
	    subSite: subSite,
            if_blogs: (subSite==="blog"),
            if_webmarks: (subSite==="webmark"),
            if_read: true,
	    images: image_stash
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
